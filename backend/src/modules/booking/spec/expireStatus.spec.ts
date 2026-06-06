import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ExpireBookingHandler } from '../application/commands/expire-status.handler';
import { ExpireBookingStatusCommand } from '../application/commands/booking.commands';
import type { IBookingRepo } from '../domain/repo-interfaces/IBookingRepo.interface';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { BookingEntity } from '../domain/entities/booking.entity';
import { TBookingStatus } from 'src/common/constants/bookingStatuses';
import { NotFoundException } from '@nestjs/common';

describe('ExpireBookingHandler', () => {
  let handler: ExpireBookingHandler;
  let transactions: jest.Mocked<ITransactionRepo>;
  let repo: jest.Mocked<IBookingRepo>;

  const mockTx = {} as any;
  const command = new ExpireBookingStatusCommand('booking-1');

  const makeEntity = (status: TBookingStatus = 'PENDING') =>
    BookingEntity.fromDB({
      id: 'booking-1',
      userId: 'user-1',
      hostId: 'host-1',
      propertyId: 'prop-1',
      priceAtMoment: 100,
      days: 3,
      totalPrice: 300,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-04'),
      status,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpireBookingHandler,
        {
          provide: 'TransactionRepo',
          useValue: createMock<ITransactionRepo>(),
        },
        { provide: 'BookingRepo', useValue: createMock<IBookingRepo>() },
      ],
    }).compile();

    handler = module.get(ExpireBookingHandler);
    transactions = module.get('TransactionRepo');
    repo = module.get('BookingRepo');

    transactions.startTransaction.mockImplementation(async (cb) => cb(mockTx));
  });

  describe('happy path', () => {
    it('PENDING booking → entity.expire(), repo.save, commit', async () => {
      const entity = makeEntity('PENDING');
      repo.getEntityById.mockResolvedValue(entity);
      repo.save.mockResolvedValue(undefined);
      await handler.execute(command);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('entity not found', () => {
    it('repo.getEntityById → null → NotFoundException', async () => {
      repo.getEntityById.mockResolvedValue(null);
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('wrong status', () => {
    it('CONFIRMED → entity.expire() throws UnexpectedDataError', async () => {
      const entity = makeEntity('CONFIRMED');
      repo.getEntityById.mockResolvedValue(entity);
      await expect(handler.execute(command)).rejects.toThrow(Error);
    });

    it('PAID → entity.expire() throws UnexpectedDataError', async () => {
      const entity = makeEntity('PAID');
      repo.getEntityById.mockResolvedValue(entity);
      await expect(handler.execute(command)).rejects.toThrow(Error);
    });
  });
});
