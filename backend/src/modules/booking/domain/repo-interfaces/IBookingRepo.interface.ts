import type { BookingEntity, IBookingDbData } from '../entities/booking.entity';

export interface IBookingRepo {
  getEntityById(id: string): Promise<IBookingDbData>;
  save(entity: BookingEntity): Promise<void>;
}

export interface IBookingRepoQuery {}
