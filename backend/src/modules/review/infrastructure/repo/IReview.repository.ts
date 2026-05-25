import { Injectable } from '@nestjs/common';
import { IReviewRepo } from '../../domain/interfaces/repo.interface';
import { PrismaService } from 'src/database/prisma.service';
import {
  IReviewChangeData,
  IReviewData,
  IReviewViewData,
} from '../../domain/interfaces/review.interfaces';
import { SearchParamsReviewsDto } from '../../application/dto/searchParams.dto';

@Injectable()
export class PrismaReviewRepository implements IReviewRepo {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: IReviewData): Promise<void> {
    await this.prisma.review.create({
      data: {
        id: data.id,
        description: data.text,
        rating: data.rate,
        propertyId: data.propertyId,
        reviewerId: data.userId,
        bookingId: data.bookingId,
      },
    });
  }

  async changeReveiew(data: IReviewChangeData, userId: string) {
    await this.prisma.review.updateMany({
      where: { id: data.id, reviewerId: userId },
      data: { description: data.text, rating: data.rate },
    });
  }

  async deleteReview(id: string): Promise<void> {
    await this.prisma.review.delete({
      where: { id },
    });
  }

  async getMyReviews(
    userId: string,
    searchParams: SearchParamsReviewsDto,
  ): Promise<IReviewViewData[]> {
    return await this.prisma.review.findMany({
      where: {
        reviewerId: userId,
        rating: searchParams.rate,
      },
      orderBy: {
        [searchParams.orderBy ? searchParams.orderBy : 'createdAt']: 'asc',
      },
    });
  }

  async getReviewsByProperty(
    propertyId: string,
    searchParams: SearchParamsReviewsDto,
  ): Promise<IReviewViewData[]> {
    return await this.prisma.review.findMany({
      where: {
        propertyId,
        rating: searchParams.rate,
      },
      orderBy: {
        [searchParams.orderBy ? searchParams.orderBy : 'createdAt']: 'asc',
      },
    });
  }
}
