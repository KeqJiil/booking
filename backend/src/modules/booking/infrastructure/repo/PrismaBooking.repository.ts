import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { IBookingRepo } from '../../domain/repo-interfaces/IBookingRepo.interface';
import { BookingEntity } from '../../domain/entities/booking.entity';
import { BookingMapper } from '../../application/mappers/booking.mapper';

@Injectable()
export class PrismaBookingRepo implements IBookingRepo {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: BookingEntity): Promise<void> {
    await this.prisma.booking.upsert({
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

  async getEntityById(id: string): Promise<BookingEntity | null> {
    const data = await this.prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        propertyId: true,
        priceAtMoment: true,
        amountDue: true,
        days: true,
        startDate: true,
        endDate: true,
        status: true,
      },
    });
    if (!data) return null;
    return BookingMapper.toEntity({
      ...data,
      priceAtMoment: Number(data.priceAtMoment),
      totalPrice: Number(data.amountDue),
    });
  }
}
