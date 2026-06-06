import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateBookingHandler } from '../application/commands/create-booking.handler';
import { CreateBookingCommand } from '../application/commands/booking.commands';
import type { IBookingRepo } from '../domain/repo-interfaces/IBookingRepo.interface';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import type { IPropertyAdapterToBooking } from '../domain/repo-interfaces/IPropertyAdapter.interface';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { eventNames } from '../../../common/constants/eventnames';
import { REDIS } from '../../../common/constants/providerConstants';
import { ConflictException } from '@nestjs/common';

describe('CreateBookingHandler', () => {
  let handler: CreateBookingHandler;
  let transactions: jest.Mocked<ITransactionRepo>;
  let repo: jest.Mocked<IBookingRepo>;
  let cache: jest.Mocked<RedisService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let propertyAdapter: jest.Mocked<IPropertyAdapterToBooking>;

  const mockTx = {} as any;

  const baseCommand = new CreateBookingCommand(
    {
      propertyId: 'prop-1',
      userId: 'user-1',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-05'),
    },
    'idempotency-key-123',
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBookingHandler,
        {
          provide: 'TransactionRepo',
          useValue: createMock<ITransactionRepo>(),
        },
        { provide: 'BookingRepo', useValue: createMock<IBookingRepo>() },
        { provide: REDIS, useValue: createMock<RedisService>() },
        { provide: EventEmitter2, useValue: createMock<EventEmitter2>() },
        {
          provide: 'PropertyAdapter',
          useValue: createMock<IPropertyAdapterToBooking>(),
        },
      ],
    }).compile();

    handler = module.get(CreateBookingHandler);
    transactions = module.get('TransactionRepo');
    repo = module.get('BookingRepo');
    cache = module.get(REDIS);
    eventEmitter = module.get(EventEmitter2);
    propertyAdapter = module.get('PropertyAdapter');

    transactions.startTransaction.mockImplementation(async (cb) => cb(mockTx));
  });

  describe('happy path', () => {
    it('creates booking, saves and sets the cache', async () => {
      cache.get.mockResolvedValue(null);
      propertyAdapter.getData.mockResolvedValue({
        price: 100,
        hostId: 'host-1',
      });
      repo.getOverlapping.mockResolvedValue(false);
      repo.save.mockResolvedValue(undefined);
      cache.set.mockResolvedValue('OK');
      await handler.execute(baseCommand);
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(cache.set).toHaveBeenCalledWith(
        'booking:create:idempotency-key-123',
        0,
        360,
      );
    });

    it('emit calls with booking_created and object { id: string }', async () => {
      cache.get.mockResolvedValue(null);
      propertyAdapter.getData.mockResolvedValue({
        price: 100,
        hostId: 'host-1',
      });
      repo.getOverlapping.mockResolvedValue(false);
      repo.save.mockResolvedValue(undefined);
      await handler.execute(baseCommand);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        eventNames.booking_created,
        { id: expect.any(String) },
      );
    });
  });

  describe('cache hit (idempotency)', () => {
    it('once cache hit → returns undefined, tx doesnt start', async () => {
      cache.get.mockResolvedValue({ result: 0 });
      await handler.execute(baseCommand);
      expect(transactions.startTransaction).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('overlapping dates', () => {
    it('overlapping dates → ConflictException', async () => {
      cache.get.mockResolvedValue(null);
      propertyAdapter.getData.mockResolvedValue({
        price: 100,
        hostId: 'host-1',
      });
      repo.getOverlapping.mockResolvedValue(true);
      await expect(handler.execute(baseCommand)).rejects.toThrow(
        ConflictException,
      );
      expect(repo.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('property adapter error', () => {
    it('PropertyAdapter throws', async () => {
      cache.get.mockResolvedValue(null);
      propertyAdapter.getData.mockImplementation(() => {
        throw new Error('Property not found');
      });
      await expect(handler.execute(baseCommand)).rejects.toThrow();
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('save fails', () => {
    it('repo.save throws error', async () => {
      cache.get.mockResolvedValue(null);
      propertyAdapter.getData.mockResolvedValue({
        price: 100,
        hostId: 'host-1',
      });
      repo.getOverlapping.mockResolvedValue(false);
      repo.save.mockImplementation(() => {
        throw new Error('Something went wrong');
      });
      await expect(handler.execute(baseCommand)).rejects.toThrow();
      expect(cache.set).not.toHaveBeenCalled();
    });
  });
});
