import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { IBookingRepo } from '../../domain/repo-interfaces/IBookingRepo.interface';
import { BookingEntity } from '../../domain/entities/booking.entity';
import { BookingMapper } from '../../application/mappers/booking.mapper';
import { Prisma } from 'generated/prisma/browser';
import { Decimal } from '@prisma/client/runtime/index-browser';
import { TBookingStatus } from 'src/common/constants/bookingStatuses';

type Tx = Prisma.TransactionClient;

type IDataReturnType = {
  id: string;
  amountDue: Decimal;
  days: number;
  priceAtMoment: Decimal;
  status: TBookingStatus;
  startDate: Date;
  endDate: Date;
  userId: string;
  propertyId: string;
} | null;

@Injectable()
export class PrismaBookingRepo implements IBookingRepo {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: BookingEntity, tx?: Tx): Promise<void> {
    const db = (tx ?? this.prisma) as Tx;
    await db.booking.upsert({
      update: {
        status: entity.status,
      },
      where: {
        id: entity.id,
      },
      create: {
        id: entity.id,
        status: entity.status,
        amountDue: entity.data.totalPrice,
        priceAtMoment: entity.data.priceAtMoment,
        userId: entity.data.userId,
        propertyId: entity.data.propertyId,
        startDate: entity.data.startDate,
        endDate: entity.data.endDate,
        days: entity.data.days,
      },
    });
  }

  async getEntityById(id: string, tx?: Tx): Promise<BookingEntity | null> {
    const db = (tx ?? this.prisma) as Tx;
    const data = (await db.$queryRaw`
    SELECT id, user_id, property_id, price_at_the_moment, amount_due, days, start_date, end_date, status
    FROM Booking
    WHERE id = ${id}
    FOR UPDATE
    `[0]) as IDataReturnType;
    if (!data) return null;
    return BookingMapper.toEntity({
      ...data,
      priceAtMoment: Number(data.priceAtMoment),
      totalPrice: Number(data.amountDue),
    });
  }
}
