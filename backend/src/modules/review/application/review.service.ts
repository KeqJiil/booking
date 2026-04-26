import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { ICacheReturnValue } from '../domain/interfaces/review.interfaces';
import { CreateReviewDto } from './dto/createReview.dto';
import type { IReviewRepo } from '../domain/interfaces/repo.interface';
import { randomUUID } from 'crypto';
import { ChangeReviewDto } from './dto/changeReview.dto';
import { SearchParamsReviewsDto } from './dto/searchParams.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventNames } from 'src/common/constants/eventnames';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @Inject('ReviewRepo') private readonly repo: IReviewRepo,
    private readonly eventEmmiter: EventEmitter2,
  ) {}

  private async dataInCache(userId: string) {
    const data = await this.cache.get<ICacheReturnValue>(userId);
    if (!data) throw new NotFoundException();
    return data;
  }

  public async createReview(data: CreateReviewDto, userId: string) {
    const cache = await this.dataInCache(userId);
    await this.repo.save({
      ...data,
      bookingId: cache.bookingId,
      userId: userId,
      id: randomUUID(),
    });
    this.eventEmmiter.emit(eventNames.new_review_created, { ...data, userId });
    this.eventEmmiter.emit(eventNames.new_review_received, { ...data, userId });
  }

  public async changeReview(data: ChangeReviewDto, userId: string) {
    await this.repo.changeReveiew(data, userId);
    this.eventEmmiter.emit(eventNames.review_edited, { ...data, userId });
  }

  public async deleteReview(id: string, userId: string) {
    await this.repo.deleteReview(id, userId);
  }

  public async getMyReviews(
    userId: string,
    searchParams: SearchParamsReviewsDto,
  ) {
    return await this.repo.getMyReviews(userId, searchParams);
  }

  public async getReviewsByProperty(
    propertyId: string,
    searchParams: SearchParamsReviewsDto,
  ) {
    return await this.repo.getReviewsByProperty(propertyId, searchParams);
  }
}
