import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { RejectBookingStatusHandler } from '../application/commands/reject-status.handler';
import { RejectBookingStatusCommand } from '../application/commands/booking.commands';
import type { IBookingRepo } from '../domain/repo-interfaces/IBookingRepo.interface';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { BookingEntity } from '../domain/entities/booking.entity';
import { TBookingStatus } from 'src/common/constants/bookingStatuses';
import { UnexpectedDataError } from '../../../common/exceptions/entityDomain.exceptions';

describe('RejectBookingStatusHandler', () => {
  let handler: RejectBookingStatusHandler;
  let transactions: jest.Mocked<ITransactionRepo>;
  let repo: jest.Mocked<IBookingRepo>;

  const mockTx = {} as any;
  const command = new RejectBookingStatusCommand('host-1', 'booking-1');

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
        RejectBookingStatusHandler,
        {
          provide: 'TransactionRepo',
          useValue: createMock<ITransactionRepo>(),
        },
        { provide: 'BookingRepo', useValue: createMock<IBookingRepo>() },
      ],
    }).compile();

    handler = module.get(RejectBookingStatusHandler);
    transactions = module.get('TransactionRepo');
    repo = module.get('BookingRepo');

    transactions.startTransaction.mockImplementation(async (cb) => cb(mockTx));
  });

  describe('happy path', () => {
    it('host rejects booking → entity.reject(), repo.save, commit', async () => {
      const entity = makeEntity('host-1');
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
    });
  });

  describe('wrong host', () => {
    it('entity.isOwner(hostId) === false → NotFoundException', async () => {
      const entity = makeEntity('host-1234');
      repo.getEntityById.mockResolvedValue(entity);
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    });
  });

  describe('wrong status', () => {
    it('CONFIRMED → entity.reject() throws UnexpectedDataError', async () => {
      const entity = makeEntity('host-1', 'CONFIRMED');
      repo.getEntityById.mockResolvedValue(entity);
      await expect(handler.execute(command)).rejects.toThrow(Error);
    });

    it('PAID → entity.reject() throws UnexpectedDataError', async () => {
      const entity = makeEntity('host-1', 'PAID');
      repo.getEntityById.mockResolvedValue(entity);
      await expect(handler.execute(command)).rejects.toThrow(
        UnexpectedDataError,
      );
    });
  });
});
