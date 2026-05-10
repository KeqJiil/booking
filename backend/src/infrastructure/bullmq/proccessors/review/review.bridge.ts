import { Inject, Injectable } from '@nestjs/common';
import { eventNames } from 'src/common/constants/eventnames';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import type { IAbleToReview } from './interfaces/IAbleToReview.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ReviewBullBridge {
  constructor(
    @Inject('REDIS') private cache: RedisService,
    @InjectQueue('review') private reviewQueue: Queue,
  ) {}

  @OnEvent(eventNames.able_to_leave_review)
  async handle(event: IAbleToReview) {
    await this.cache.set(
      `review:${event.userId}`,
      {
        property: event.propertyId,
        user: event.userId,
        booking: event.bookingId,
      },
      7 * 24 * 60 * 60 * 1000,
    );

    await this.reviewQueue.add(eventNames.able_to_leave_review, event);
  }
}
