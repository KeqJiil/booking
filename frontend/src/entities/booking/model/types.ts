export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface IBooking {
  id: string;
  propertyId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  guestsCount: number;
  status: BookingStatus;
  createdAt: string;
}

export interface IBookingSearchParams {
  status?: BookingStatus;
  page?: number;
  limit?: number;
}

export interface ICreateBookingData {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
}

export type ICreateBookingAllData = ICreateBookingData & {idempotencyKey: string};