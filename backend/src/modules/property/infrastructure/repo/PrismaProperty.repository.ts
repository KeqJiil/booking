import { Injectable, NotFoundException } from '@nestjs/common';
import { IPropertyRepo } from '../../domain/repo-interface/IPropertyRepo.interface';
import { PropertyEntity } from '../../domain/entities/Property.entity';
import { PrismaService } from 'src/database/prisma.service';
import { PropertyMapper } from '../../application/mappers/property.mapper';
import { propertyPlainSelect } from './prisma.property.select';
import { Tx } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';

@Injectable()
export class PrismaPropertyRepository implements IPropertyRepo {
  constructor(private readonly prisma: PrismaService) {}

  private getDb(tx?: unknown) {
    return (tx ? tx : this.prisma) as Tx;
  }

  async checkBookings(id: string, date: Date, tx?: unknown): Promise<boolean> {
    const db = this.getDb(tx);
    const bookings = await db.booking.findMany({
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
      select: { id: true },
    });
    return bookings.length > 0;
  }

  async getEntityById(id: string, tx?: unknown): Promise<PropertyEntity> {
    const db = this.getDb(tx);
    const property = await db.property.findUnique({
      where: { id },
      select: propertyPlainSelect,
    });
    if (!property) throw new NotFoundException();
    return PropertyMapper.toEntityDb({
      ...property,
      price: Number(property.price),
      hostId: property.hostId,
      typeId: property.typeId ?? '',
      images: property.images ?? [],
    });
  }

  async save(property: PropertyEntity, tx?: unknown): Promise<void> {
    const db = this.getDb(tx);
    await db.property.upsert({
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
        images: {
          create: property.images.map((img) => ({
            id: img.id,
            url: img.data.url,
          })),
        },
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
        images: {
          deleteMany: {
            id: { notIn: property.images.map((img) => img.id) },
          },
          upsert: property.images.map((img) => ({
            where: { id: img.id },
            create: { id: img.id, url: img.data.url },
            update: { url: img.data.url },
          })),
        },
      },
      where: {
        id: property.id,
      },
    });
  }
}
