import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ConfirmBookingStatusHandler } from '../application/commands/confirm-status.handler';
import { ConfirmBookingStatusCommand } from '../application/commands/booking.commands';
import type { IBookingRepo } from '../domain/repo-interfaces/IBookingRepo.interface';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { BookingEntity } from '../domain/entities/booking.entity';
import { TBookingStatus } from 'src/common/constants/bookingStatuses';
import { NotFoundException } from '@nestjs/common';
import { UnexpectedDataError } from '../../../common/exceptions/entityDomain.exceptions';

describe('ConfirmBookingStatusHandler', () => {
  let handler: ConfirmBookingStatusHandler;
  let transactions: jest.Mocked<ITransactionRepo>;
  let repo: jest.Mocked<IBookingRepo>;

  const mockTx = {} as any;
  const command = new ConfirmBookingStatusCommand('host-1', 'booking-1');

  const makeEntity = (hostId: string, status: TBookingStatus = 'PENDING') =>
    BookingEntity.fromDB({
      id: 'booking-1',
      userId: 'user-1',
      hostId,
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
        ConfirmBookingStatusHandler,
        {
          provide: 'TransactionRepo',
          useValue: createMock<ITransactionRepo>(),
        },
        { provide: 'BookingRepo', useValue: createMock<IBookingRepo>() },
      ],
    }).compile();

    handler = module.get(ConfirmBookingStatusHandler);
    transactions = module.get('TransactionRepo');
    repo = module.get('BookingRepo');

    transactions.startTransaction.mockImplementation(async (cb) => cb(mockTx));
  });

  describe('happy path', () => {
    it('host confirms booking → entity.confirm(), repo.save, commit', async () => {
      const entity = makeEntity('host-1');
      repo.getEntityById.mockResolvedValue(entity);
      repo.save.mockResolvedValue(undefined);
      jest.spyOn(entity, 'confirm');
      jest.spyOn(entity, 'commit');
      await handler.execute(command);
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(transactions.startTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('entity not found', () => {
    it('repo.getEntityById returns null → NotFoundException', async () => {
      repo.getEntityById.mockResolvedValue(null);
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('wrong host', () => {
    it('entity.isOwner(hostId) === false → NotFoundException', async () => {
      const entity = makeEntity('host-12323');
      repo.getEntityById.mockResolvedValue(entity);
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('wrong status', () => {
    it('entity with status CONFIRMED → entity.confirm() throws UnexpectedDataError', async () => {
      const entity = makeEntity('host-1', 'CONFIRMED');
      repo.getEntityById.mockResolvedValue(entity);
      await expect(handler.execute(command)).rejects.toThrow(
        UnexpectedDataError,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });
  });
});
