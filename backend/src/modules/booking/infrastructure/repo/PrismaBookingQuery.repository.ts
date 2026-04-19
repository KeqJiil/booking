import { PrismaService } from 'src/database/prisma.service';
import {
  IBookingRepoQuery,
  IQueryBookings,
  ISearchParams,
  orderByBooking,
} from '../../domain/repo-interfaces/IBookingRepo.interface';
import { Injectable } from '@nestjs/common';
import { bookingSelect } from './PrismaBooking.select';

@Injectable()
export class PrismaBookingQueryRepo implements IBookingRepoQuery {
  constructor(private readonly prisma: PrismaService) {}

  async getMyBookings(
    userId: string,
    searchParams: ISearchParams,
  ): Promise<IQueryBookings[]> {
    const { startDate, endDate, totalPrice, status, days, orderBy } =
      searchParams;
    const data = await this.prisma.booking.findMany({
      where: {
        id: userId,
        startDate,
        endDate,
        status,
        days,
        amountDue: totalPrice,
      },
      select: bookingSelect,
      orderBy: {
        [orderBy ? orderByBooking[orderBy] : 'endDate']: 'asc',
      },
    });
    return data.map((el) => ({
      ...el,
      priceAtMoment: Number(el.priceAtMoment),
      totalPrice: Number(el.amountDue),
    }));
  }

  async getBookingById(id: string): Promise<IQueryBookings | null> {
    const data = await this.prisma.booking.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        amountDue: true,
        priceAtMoment: true,
        days: true,
        status: true,
        userId: true,
        propertyId: true,
        startDate: true,
        endDate: true,
      },
    });
    if (!data) return null;
    return {
      ...data,
      totalPrice: Number(data.amountDue),
      priceAtMoment: Number(data.priceAtMoment),
    };
  }

  async getBookingByProperty(
    propertyId: string,
    searchParams: ISearchParams,
  ): Promise<IQueryBookings[]> {
    const { startDate, endDate, totalPrice, status, days, orderBy } =
      searchParams;
    const data = await this.prisma.booking.findMany({
      where: {
        propertyId,
        startDate,
        endDate,
        status,
        days,
        amountDue: totalPrice,
      },
      select: bookingSelect,
      orderBy: {
        [orderBy ? orderByBooking[orderBy] : 'endDate']: 'asc',
      },
    });
    return data.map((el) => ({
      ...el,
      priceAtMoment: Number(el.priceAtMoment),
      totalPrice: Number(el.amountDue),
    }));
  }
}
