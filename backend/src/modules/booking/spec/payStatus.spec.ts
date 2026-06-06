import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { PayBookingStatusHandler } from '../application/commands/pay-status.handler';
import { PayBookingStatusCommand } from '../application/commands/booking.commands';
import type { IBookingRepo } from '../domain/repo-interfaces/IBookingRepo.interface';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { BookingEntity } from '../domain/entities/booking.entity';
import { TBookingStatus } from 'src/common/constants/bookingStatuses';

describe('PayBookingStatusHandler', () => {
  let handler: PayBookingStatusHandler;
  let transactions: jest.Mocked<ITransactionRepo>;
  let repo: jest.Mocked<IBookingRepo>;

  const mockTx = {} as any;
  const command = new PayBookingStatusCommand('user-1', 'booking-1');

  const makeEntity = (userId: string, status: TBookingStatus = 'CONFIRMED') =>
    BookingEntity.fromDB({
      id: 'booking-1',
      userId,
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
        PayBookingStatusHandler,
        {
          provide: 'TransactionRepo',
          useValue: createMock<ITransactionRepo>(),
        },
        { provide: 'BookingRepo', useValue: createMock<IBookingRepo>() },
      ],
    }).compile();

    handler = module.get(PayBookingStatusHandler);
    transactions = module.get('TransactionRepo');
    repo = module.get('BookingRepo');

    transactions.startTransaction.mockImplementation(async (cb) => cb(mockTx));
  });

  describe('happy path', () => {
    it('user pays → entity.pay(), repo.save, commit', async () => {
      const entity = makeEntity('user-1', 'CONFIRMED');
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

  describe('wrong user', () => {
    it('entity.isBooker(userId) === false → NotFoundException', async () => {
      const entity = makeEntity('user-1234', 'CONFIRMED');
      repo.getEntityById.mockResolvedValue(entity);
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    });
  });

  describe('wrong status', () => {
    it('PENDING → entity.pay() throws UnexpectedDataError', async () => {
      const entity = makeEntity('user-1', 'PENDING');
      repo.getEntityById.mockResolvedValue(entity);
      await expect(handler.execute(command)).rejects.toThrow(Error);
    });

    it('PAID → entity.pay() throws UnexpectedDataError (double pay)', async () => {
      const entity = makeEntity('user-1', 'PAID');
      repo.getEntityById.mockResolvedValue(entity);
      await expect(handler.execute(command)).rejects.toThrow(Error);
    });
  });
});
