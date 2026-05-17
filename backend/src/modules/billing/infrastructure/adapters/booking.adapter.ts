import { QueryBus } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IBookingBillingAdapter,
  IBookingDataForBilling,
} from './bookingAdapter.interface';
import { GetBookingByIdQuery } from 'src/modules/booking/application/queries/booking.query';
import { IQueryBookings } from 'src/modules/booking/domain/repo-interfaces/IBookingRepo.interface';

@Injectable()
export class BookingProviderAdapter implements IBookingBillingAdapter {
  constructor(private readonly queryBus: QueryBus) {}

  async getData(bookingId: string): Promise<IBookingDataForBilling> {
    const booking: IQueryBookings | null = await this.queryBus.execute(
      new GetBookingByIdQuery(bookingId),
    );
    if (!booking) throw new NotFoundException('Booking not found');
    return {
      amount: booking.totalPrice,
    };
  }
}
