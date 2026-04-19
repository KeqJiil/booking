import {
  BookingEntity,
  IBookingDbData,
} from '../../domain/entities/booking.entity';

export class BookingMapper {
  static toEntity(data: IBookingDbData) {
    const entity = BookingEntity.fromDB(data);
    return entity;
  }
}
