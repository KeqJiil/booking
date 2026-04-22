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
  hostId: string;
} | null;

@Injectable()
export class PrismaBookingRepo implements IBookingRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getIdsToComplete(): Promise<{ id: string }[]> {
    return await this.prisma.booking.findMany({
      where: {
        AND: {
          status: 'CONFIRMED',
          endDate: { lte: new Date() },
        },
      },
      select: {
        id: true,
      },
      take: 200,
    });
  }

  async getOverlapping(
    startDate: Date,
    endDate: Date,
    propertyId: string,
    tx?: unknown,
  ) {
    const db = (tx ?? this.prisma) as Tx;
    return !!(await db.booking.findFirst({
      where: {
        propertyId,
        status: {
          in: ['CONFIRMED', 'PAID', 'PENDING'],
        },
        startDate: {
          lt: endDate,
        },
        endDate: {
          gt: startDate,
        },
      },
      select: {
        id: true,
      },
    }));
  }

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
        startDate: entity.data.dateData.startDate,
        endDate: entity.data.dateData.endDate,
        days: entity.data.dateData.days,
      },
    });
  }

  async getEntityById(id: string, tx?: Tx): Promise<BookingEntity | null> {
    const db = (tx ?? this.prisma) as Tx;
    const data = (await db.$queryRaw`
    SELECT 
      Booking.id, Booking.user_id, 
      Booking.property_id AS "propertyId", Booking.price_at_the_moment AS "priceAtTheMoment", 
      Booking.amount_due AS "amountDue", Booking.days, 
      Booking.start_date AS "startDate", Booking.end_date AS "endDate", 
      Booking.status, Property.host_Id AS "hostId"
    FROM Booking
    INNER JOIN Property ON Booking.property_id=Property.id 
    WHERE Booking.id = ${id}
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
