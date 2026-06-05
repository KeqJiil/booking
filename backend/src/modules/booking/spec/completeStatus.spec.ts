import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CompleteBookingStatusHandler } from '../application/commands/complete-status.handler';
import { CompleteBookingStatusCommand } from '../application/commands/booking.commands';
import type { IBookingRepo } from '../domain/repo-interfaces/IBookingRepo.interface';
import { Logger } from 'nestjs-pino';
import { BookingEntity } from '../domain/entities/booking.entity';
import { TBookingStatus } from 'src/common/constants/bookingStatuses';
import { UnexpectedDataError } from '../../../common/exceptions/entityDomain.exceptions';

describe('CompleteBookingStatusHandler', () => {
  let handler: CompleteBookingStatusHandler;
  let repo: jest.Mocked<IBookingRepo>;
  let logger: jest.Mocked<Logger>;

  const makeEntity = (id: string, status: TBookingStatus = 'CONFIRMED') =>
    BookingEntity.fromDB({
      id,
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
        CompleteBookingStatusHandler,
        { provide: 'BookingRepo', useValue: createMock<IBookingRepo>() },
        { provide: Logger, useValue: createMock<Logger>() },
      ],
    }).compile();

    handler = module.get(CompleteBookingStatusHandler);
    repo = module.get('BookingRepo');
    logger = module.get(Logger);
  });

  describe('happy path', () => {
    it('array with only one id → entity.complete(), repo.save, commit', async () => {
      const entity = makeEntity('1', 'CONFIRMED');
      repo.getEntityById.mockResolvedValue(entity);
      repo.save.mockResolvedValue(undefined);
      await handler.execute(
        new CompleteBookingStatusCommand([{ id: 'booking-1' }]),
      );
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('array with a few id → each is handled', async () => {
      const entity1 = makeEntity('12', 'CONFIRMED');
      const entity2 = makeEntity('123', 'CONFIRMED');
      const entity3 = makeEntity('1234', 'CONFIRMED');
      const entityMap = {
        [entity1.id]: entity1,
        [entity2.id]: entity2,
        [entity3.id]: entity3,
      };

      repo.getEntityById.mockImplementation((id) =>
        Promise.resolve(entityMap[id]),
      );
      repo.save.mockResolvedValue(undefined);
      await handler.execute(
        new CompleteBookingStatusCommand([
          { id: entity1.id },
          { id: entity2.id },
          { id: entity3.id },
        ]),
      );
      expect(repo.save).toHaveBeenCalledTimes(3);
    });
  });

  describe('entity not found (continue, no throw)', () => {
    it('repo.getEntityById → null → continue, save was not called, no errors', async () => {
      repo.getEntityById.mockResolvedValue(null);
      await expect(
        handler.execute(
          new CompleteBookingStatusCommand([{ id: 'booking-1' }]),
        ),
      ).resolves.toBeUndefined();
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('entity with wrong status (error logging)', () => {
    it('entity.complete() throws → logger.error called, save has not been called', async () => {
      const entity = makeEntity('1', 'PENDING');
      expect(() => entity.complete()).toThrow(UnexpectedDataError);
      repo.getEntityById.mockResolvedValue(entity);
      await expect(
        handler.execute(
          new CompleteBookingStatusCommand([{ id: 'booking-1' }]),
        ),
      ).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('one of id failed → others should be handled', async () => {
      const entity1 = makeEntity('1', 'PENDING');
      const entity2 = makeEntity('123', 'CONFIRMED');
      const entityMap = {
        [entity1.id]: entity1,
        [entity2.id]: entity2,
      };

      repo.getEntityById.mockImplementation((id) =>
        Promise.resolve(entityMap[id]),
      );
      await handler.execute(
        new CompleteBookingStatusCommand([
          { id: entity1.id },
          { id: entity2.id },
        ]),
      );
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });
});
