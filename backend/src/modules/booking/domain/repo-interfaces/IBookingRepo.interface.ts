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

export const orderByBooking = {
  startDate: 'startDate',
  endDate: 'endDate',
  totalPrice: 'totalPrice',
  status: 'status',
  days: 'days',
} as const;

export type TOrderByBooking =
  (typeof orderByBooking)[keyof typeof orderByBooking];

export interface ISearchParams {
  startDate?: Date;
  endDate?: Date;
  totalPrice?: number;
  status?: TBookingStatus;
  days?: number;
  orderBy?: TOrderByBooking;
}

export interface IBookingRepo {
  getIdsToComplete(): Promise<{ id: string }[]>;
  getEntityById(id: string, tx?: unknown): Promise<BookingEntity | null>;
  save(entity: BookingEntity, tx?: unknown): Promise<void>;
  getOverlapping(
    startDate: Date,
    endDate: Date,
    propertyId: string,
    tx: unknown,
  ): Promise<boolean>;
}

export interface IBookingRepoQuery {
  getMyBookings(
    userId: string,
    searchParams: ISearchParams,
  ): Promise<IQueryBookings[]>;
  getBookingById(id: string): Promise<IQueryBookings | null>;
  getBookingByProperty(
    propertyId: string,
    searchParams: ISearchParams,
  ): Promise<IQueryBookings[]>;
}
