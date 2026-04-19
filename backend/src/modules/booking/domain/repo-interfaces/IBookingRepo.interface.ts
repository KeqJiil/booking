import { TBookingStatus } from 'src/common/constants/bookingStatuses';
import type { BookingEntity } from '../entities/booking.entity';

export interface IQueryBookings {
  id: string;
  totalPrice: number;
  days: number;
  priceAtMoment: number;
  status: TBookingStatus;
  userId: string;
  propertyId: string;
  startDate: Date;
  endDate: Date;
}

export interface ISearchParams {
  startDate?: Date;
  endDate?: Date;
  totalPrice?: Date;
  status?: TBookingStatus;
  days?: number;
}

export interface IBookingRepo {
  getEntityById(id: string, tx?: unknown): Promise<BookingEntity | null>;
  save(entity: BookingEntity, tx?: unknown): Promise<void>;
}

export interface IBookingRepoQuery {
  getMyBookings(
    userId: string,
    searchParams: ISearchParams,
  ): Promise<IQueryBookings[]>;
  getBookingById(id: string): Promise<IQueryBookings>;
  getBookingByProperty(
    propertyId: string,
    searchParams: ISearchParams,
  ): Promise<IQueryBookings[]>;
}
