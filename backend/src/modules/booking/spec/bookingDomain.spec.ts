import { TBookingStatus } from 'src/common/constants/bookingStatuses';
import { BookingEntity } from '../domain/entities/booking.entity';
import {
  BookingCompletedStatus,
  BookingConfirmStatus,
  BookingCreated,
  BookingStatusChanges,
} from '../domain/events/booking.events';
import {
  UnexpectedDataError,
  WrongInputDataError,
} from '../../../common/exceptions/entityDomain.exceptions';

describe('BookingEntity', () => {
  const validData = {
    priceAtMoment: 4141,
    propertyId: '42',
    userId: '123',
    startDate: new Date(414123412321),
    endDate: new Date(4141234123211231),
    hostId: '1111',
  };

  const validDataDb = {
    priceAtMoment: 11,
    days: 2,
    propertyId: 'string',
    userId: '1321',
    startDate: new Date(123),
    endDate: new Date(312321),
    status: 'PENDING' as TBookingStatus,
    id: '1321',
    totalPrice: 131,
    hostId: '1211',
  };

  it('should create entity', () => {
    const entity = BookingEntity.create(validData);
    expect(entity.data.priceAtMoment).toBe(validData.priceAtMoment);
  });

  it('should create entity by DB', () => {
    const entity = BookingEntity.fromDB(validDataDb);
    expect(entity.data.propertyId).toBe(validDataDb.propertyId);
  });

  it('should throw an error', () => {
    const invalidData: typeof validDataDb = {
      ...validDataDb,
      status: 'CANCELLED',
    };
    expect(() => BookingEntity.fromDB(invalidData)).toThrow(Error);
  });

  it('should throw an error', () => {
    expect(() => {
      const entity = BookingEntity.create(validData);
      entity.complete();
    }).toThrow(Error);
  });

  it('should return false', () => {
    const entity = BookingEntity.fromDB(validDataDb);
    const result = entity.isBooker('3131313131321');
    expect(result).toBe(false);
  });

  describe('create()', () => {
    it('should set status PENDING', () => {
      const entity = BookingEntity.create(validData);
      expect(entity.status).toBe('PENDING');
    });

    it('should apply BookingCreated event', () => {
      const entity = BookingEntity.create(validData);
      const events = entity.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(BookingCreated);
    });

    it('should calculate totalPrice = days * priceAtMoment', () => {
      const startDate = new Date(Date.now()),
        endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days diff
      const expectedPrice = validData.priceAtMoment * 3;
      const entity = BookingEntity.create({ ...validData, startDate, endDate });
      expect(entity.data.totalPrice).toBe(expectedPrice);
    });
  });

  describe('fromDB() with bad statuses', () => {
    const badStatuses: TBookingStatus[] = ['CANCELLED', 'EXPIRED', 'REJECTED'];

    it.each(badStatuses)('should throw for status %s', (status) => {
      expect(() => BookingEntity.fromDB({ ...validDataDb, status })).toThrow(
        WrongInputDataError,
      );
    });

    it('should NOT throw for PENDING', () => {
      expect(() => BookingEntity.fromDB(validDataDb)).not.toThrow();
    });

    it('should NOT throw for CONFIRMED', () => {
      expect(() =>
        BookingEntity.fromDB({ ...validDataDb, status: 'CONFIRMED' }),
      ).not.toThrow();
    });

    it('should NOT throw for PAID', () => {
      expect(() =>
        BookingEntity.fromDB({ ...validDataDb, status: 'PAID' }),
      ).not.toThrow();
    });
  });

  describe('confirm()', () => {
    it('PENDING → CONFIRMED (happy path)', () => {
      const entity = BookingEntity.fromDB(validDataDb);
      entity.confirm();
      expect(entity.status).toBe('CONFIRMED');
    });

    it('BookingConfirmStatus and BookingStatusChanges should be created', () => {
      const entity = BookingEntity.create(validData);
      entity.confirm();
      const events = entity.getUncommittedEvents();
      expect(events.length).toBe(3);
      expect(entity.status);
      expect(events.some((e) => e instanceof BookingCreated)).toBe(true);
      expect(events.some((e) => e instanceof BookingStatusChanges)).toBe(true);
      expect(events.some((e) => e instanceof BookingConfirmStatus)).toBe(true);
    });

    it('not PENDING → UnexpectedDataError', () => {
      const entity = BookingEntity.fromDB({
        ...validDataDb,
        status: 'CONFIRMED',
      });
      expect(() => entity.confirm()).toThrow(UnexpectedDataError);
    });
  });

  describe('pay()', () => {
    it('CONFIRMED → PAID (happy path)', () => {
      const entity = BookingEntity.fromDB({
        ...validDataDb,
        status: 'CONFIRMED',
      });
      entity.pay();
      expect(entity.status).toBe('PAID');
    });

    it('should apply BookingStatusChanges event', () => {
      const entity = BookingEntity.fromDB({
        ...validDataDb,
        status: 'CONFIRMED',
      });
      entity.pay();
      const events = entity.getUncommittedEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toBeInstanceOf(BookingStatusChanges);
    });

    it('not CONFIRMED → UnexpectedDataError', () => {
      const entity = BookingEntity.fromDB(validDataDb);
      expect(() => entity.pay()).toThrow(UnexpectedDataError);
    });

    it('PAID → pay() → UnexpectedDataError (double pay)', () => {
      const entity = BookingEntity.fromDB({ ...validDataDb, status: 'PAID' });
      expect(() => entity.pay()).toThrow(UnexpectedDataError);
    });
  });

  describe('reject()', () => {
    it('PENDING → REJECTED (happy path)', () => {
      const entity = BookingEntity.fromDB({
        ...validDataDb,
        status: 'PENDING',
      });
      entity.reject();
      expect(entity.status).toBe('REJECTED');
    });

    it('not PENDING → UnexpectedDataError', () => {
      const entity = BookingEntity.fromDB({
        ...validDataDb,
        status: 'CONFIRMED',
      });
      expect(() => entity.reject()).toThrow(UnexpectedDataError);
    });
  });

  describe('cancel()', () => {
    it('PENDING → CANCELLED (happy path)', () => {
      const entity = BookingEntity.fromDB(validDataDb);
      entity.cancel();
      expect(entity.status).toBe('CANCELLED');
    });

    it('not PENDING → UnexpectedDataError', () => {
      const entity = BookingEntity.fromDB({
        ...validDataDb,
        status: 'CONFIRMED',
      });
      expect(() => entity.cancel()).toThrow(UnexpectedDataError);
    });
  });

  describe('expire()', () => {
    it('PENDING → EXPIRED (happy path)', () => {
      const entity = BookingEntity.fromDB(validDataDb);
      entity.expire();
      expect(entity.status).toBe('EXPIRED');
    });

    it('not PENDING → UnexpectedDataError', () => {
      const entity = BookingEntity.fromDB({
        ...validDataDb,
        status: 'CONFIRMED',
      });
      expect(() => entity.expire()).toThrow(UnexpectedDataError);
    });
  });

  describe('complete()', () => {
    it('CONFIRMED → COMPLETED (happy path)', () => {
      const entity = BookingEntity.fromDB({
        ...validDataDb,
        status: 'CONFIRMED',
      });
      entity.complete();
      expect(entity.status).toBe('COMPLETED');
    });

    it('should apply BookingCompletedStatus и BookingStatusChanges events', () => {
      const entity = BookingEntity.fromDB({
        ...validDataDb,
        status: 'CONFIRMED',
      });
      entity.complete();
      const events = entity.getUncommittedEvents();
      expect(events.length).toBe(2);
      expect(events.some((e) => e instanceof BookingStatusChanges)).toBe(true);
      expect(events.some((e) => e instanceof BookingCompletedStatus)).toBe(
        true,
      );
    });

    it('PENDING → complete() → UnexpectedDataError', () => {
      const entity = BookingEntity.fromDB(validDataDb);
      expect(() => entity.complete()).toThrow(UnexpectedDataError);
    });

    it('PAID → complete() → UnexpectedDataError', () => {
      const entity = BookingEntity.fromDB({ ...validDataDb, status: 'PAID' });
      expect(() => entity.complete()).toThrow(UnexpectedDataError);
    });
  });

  describe('isBooker() / isOwner()', () => {
    it('isBooker: valid userId → true', () => {
      const entity = BookingEntity.fromDB(validDataDb);
      const isBooker = entity.isBooker(validDataDb.userId);
      expect(isBooker).toBe(true);
    });

    it('isBooker: invalid userId → false', () => {
      const entity = BookingEntity.fromDB(validDataDb);
      const isBooker = entity.isBooker('hacker');
      expect(isBooker).toBe(false);
    });

    it('isOwner: valid hostId → true', () => {
      const entity = BookingEntity.fromDB(validDataDb);
      const isOwner = entity.isOwner(validDataDb.hostId);
      expect(isOwner).toBe(true);
    });

    it('isOwner: invalid hostId → false', () => {
      const entity = BookingEntity.fromDB(validDataDb);
      const isOwner = entity.isOwner('hacker');
      expect(isOwner).toBe(false);
    });
  });
});
