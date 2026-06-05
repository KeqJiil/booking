import { TBookingStatus } from 'src/common/constants/bookingStatuses';
import { BookingEntity } from '../domain/entities/booking.entity';

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
});
