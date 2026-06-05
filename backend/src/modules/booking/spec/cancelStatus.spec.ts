import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CancelBookingHandler } from '../application/commands/cancel-status.handler';
import { CancelBookingStatusCommand } from '../application/commands/booking.commands';
import type { IBookingRepo } from '../domain/repo-interfaces/IBookingRepo.interface';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { BookingEntity } from '../domain/entities/booking.entity';
import { TBookingStatus } from 'src/common/constants/bookingStatuses';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CancelBookingHandler', () => {
  let handler: CancelBookingHandler;
  let transactions: jest.Mocked<ITransactionRepo>;
  let repo: jest.Mocked<IBookingRepo>;

  const mockTx = {} as any;
  const command = new CancelBookingStatusCommand('user-1', 'booking-1');

  const makeEntity = (userId: string, status: TBookingStatus = 'PENDING') =>
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
        CancelBookingHandler,
        {
          provide: 'TransactionRepo',
          useValue: createMock<ITransactionRepo>(),
        },
        { provide: 'BookingRepo', useValue: createMock<IBookingRepo>() },
      ],
    }).compile();

    handler = module.get(CancelBookingHandler);
    transactions = module.get('TransactionRepo');
    repo = module.get('BookingRepo');

    transactions.startTransaction.mockImplementation(async (cb) => cb(mockTx));
  });

  describe('happy path', () => {
    it('user cancels its booking → entity.cancel(), repo.save, commit', async () => {
      const entity = makeEntity('user-1');
      repo.getEntityById.mockResolvedValue(entity);
      repo.save.mockResolvedValue(undefined);

      await handler.execute(command);

      expect(repo.save).toHaveBeenCalled();
      expect(entity.status).toEqual('CANCELLED');
    });
  });

  describe('entity not found', () => {
    it('repo.getEntityById should return null → NotFoundException', async () => {
      repo.getEntityById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('wrong user', () => {
    it('entity.isBooker(userId) === false → NotFoundException', async () => {
      const entity = makeEntity('user-5');
      repo.getEntityById.mockResolvedValue(entity);
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('wrong status', () => {
    it('CONFIRMED → entity.cancel() throw UnexpectedDataError', async () => {
      const entity = makeEntity('user-1', 'CONFIRMED');
      repo.getEntityById.mockResolvedValue(entity);
      await expect(handler.execute(command)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('PAID → entity.cancel() throw UnexpectedDataError', async () => {
      const entity = makeEntity('user-1', 'PAID');
      repo.getEntityById.mockResolvedValue(entity);
      await expect(handler.execute(command)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
