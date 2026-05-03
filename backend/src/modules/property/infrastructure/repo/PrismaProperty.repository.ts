import { Injectable, NotFoundException } from '@nestjs/common';
import { IPropertyRepo } from '../../domain/repo-interface/IPropertyRepo.interface';
import { PropertyEntity } from '../../domain/entities/Property.entity';
import { PrismaService } from 'src/database/prisma.service';
import { PropertyMapper } from '../../application/mappers/property.mapper';
import { propertyPlainSelect } from './prisma.property.select';

@Injectable()
export class PrismaPropertyRepository implements IPropertyRepo {
  constructor(private readonly prisma: PrismaService) {}

  async checkBookings(id: string, date: Date): Promise<boolean> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        propertyId: id,
        status: {
          in: ['CONFIRMED', 'PAID', 'PENDING'],
        },
        startDate: {
          gte: date,
        },
        endDate: {
          gte: date,
        },
      },
    });
    return bookings.length > 0;
  }

  async getEntityById(id: string): Promise<PropertyEntity> {
    const property = await this.prisma.property.findUnique({
      where: { id },
      select: propertyPlainSelect,
    });
    if (!property) throw new NotFoundException();
    return PropertyMapper.toEntity({
      ...property,
      price: Number(property.price),
      hostId: property.hostId,
      typeId: property.typeId ?? '',
    });
  }

  async save(property: PropertyEntity): Promise<void> {
    await this.prisma.property.upsert({
      create: {
        id: property.id,
        name: property.props.name,
        description: property.props.description,
        price: property.props.price,
        country: property.props.address.country,
        city: property.props.address.city,
        address: property.props.address.address,
        maxGuests: property.props.maxGuests,
        propertyType: {
          connect: {
            id: property.props.typeId,
          },
        },
        host: {
          connect: {
            id: property.props.hostId,
          },
        },
        idempotencyKey: property.props.idempotencyKey,
      },
      update: {
        name: property.props.name,
        description: property.props.description,
        price: property.props.price,
        country: property.props.address.country,
        city: property.props.address.city,
        address: property.props.address.address,
        maxGuests: property.props.maxGuests,
        status: property.status,
      },
      where: {
        id: property.id,
      },
    });
  }
}
