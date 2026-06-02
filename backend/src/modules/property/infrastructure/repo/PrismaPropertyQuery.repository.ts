import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IPropertyQueryRepo,
  IPropertySearchParams,
  IPropertyListView,
  IPropertyDetailView,
  IPaginatedResponse,
} from '../../domain/repo-interface/IPropertyRepo.interface';
import { PrismaService } from 'src/database/prisma.service';
import {
  propertyDetailSelect,
  propertyListSelect,
} from './prisma.property.select';
import { PropertySearchParamsDto } from '../../application/dto/searchParams.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaPropertyQueryRepository implements IPropertyQueryRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string): Promise<IPropertyDetailView> {
    const raw = await this.prisma.property.findUnique({
      where: { id },
      select: propertyDetailSelect,
    });
    if (!raw) throw new NotFoundException();
    return {
      ...raw,
      host: raw.host.name,
      types: raw.propertyType?.name,
      price: Number(raw.price),
      images: raw.images.map((img) => img.url),
    };
  }

  async getList(
    searchParams: PropertySearchParamsDto,
  ): Promise<IPaginatedResponse<IPropertyListView>> {
    const limit = searchParams.limit ?? 10;

    const raw = await this.prisma.property.findMany({
      where: this.buildWhereClause(searchParams),
      orderBy: {
        [searchParams.orderBy ?? 'name']: searchParams.orderStyle ?? 'asc',
      },
      select: propertyListSelect,
      take: limit + 1,
      ...(searchParams.cursor
        ? { cursor: { id: searchParams.cursor }, skip: 1 }
        : {}),
    });

    const hasNextPage = raw.length > limit;
    const data = hasNextPage ? raw.slice(0, limit) : raw;

    return {
      data: data.map((el) => ({
        ...el,
        host: el.host.name,
        types: el.propertyType?.name,
        price: Number(el.price),
        coverImage: el.images[0]?.url ?? null,
      })),
      hasNextPage,
      hasPreviousPage: !!searchParams.cursor,
      nextCursor: hasNextPage ? data[data.length - 1].id : null,
    };
  }

  private buildWhereClause(
    params: IPropertySearchParams,
  ): Prisma.PropertyWhereInput {
    return {
      status: 'ALIVE',
      name: params.name
        ? { contains: params.name, mode: 'insensitive' }
        : undefined,
      typeId: params.typeId,
      hostId: params.hostId,
      country: params.country,
      city: params.city,
      maxGuests: params.maxGuests ? { gte: params.maxGuests } : undefined,
      price:
        params.minPrice || params.maxPrice
          ? { gte: params.minPrice, lte: params.maxPrice }
          : undefined,
    };
  }
}
