import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IPropertyQueryRepo,
  IPropertyView,
} from '../../domain/repo-interface/IPropertyRepo.interface';
import { PrismaService } from 'src/database/prisma.service';
import { propertyViewSelect } from './prisma.property.select';
import { PropertySearchParamsDto } from '../../application/dto/searchParams.dto';

@Injectable()
export class PrismaPropertyQueryRepository implements IPropertyQueryRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string): Promise<IPropertyView> {
    const raw = await this.prisma.property.findUnique({
      where: { id },
      select: propertyViewSelect,
    });
    if (!raw) throw new NotFoundException();
    return {
      ...raw,
      host: raw.host.name,
      types: raw.propertyType?.name,
      price: Number(raw.price),
    };
  }

  async getList(
    searchParams: PropertySearchParamsDto,
  ): Promise<IPropertyView[]> {
    const {
      name,
      typeId,
      minPrice,
      maxPrice,
      hostId,
      country,
      city,
      maxGuests,
    } = searchParams;
    const list = await this.prisma.property.findMany({
      where: {
        name: { contains: name, mode: 'insensitive' },
        typeId,
        hostId,
        country,
        city,
        maxGuests,
        price:
          minPrice || maxPrice
            ? {
                gte: minPrice,
                lte: maxPrice,
              }
            : undefined,
      },
      select: propertyViewSelect,
      take: searchParams.limit ?? 10,
      ...(searchParams.cursor
        ? { cursor: { id: searchParams.cursor }, skip: 1 }
        : {}),
    });
    if (!list) return [];
    return list.map((el) => ({
      ...el,
      host: el.host.name,
      types: el.propertyType?.name,
      price: Number(el.price),
    }));
  }
}
