import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GlobalBookCompletedStatus } from 'src/common/events/globalCompleted.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventNames } from 'src/common/constants/eventnames';
import { RedisService } from 'src/infrastructure/redis/redis.service';

@EventsHandler(GlobalBookCompletedStatus)
export class ReviewEventCompleteBookHandler implements IEventHandler<GlobalBookCompletedStatus> {
  constructor(
    @Inject('REDIS') private cache: RedisService,
    private readonly eventEmmiter: EventEmitter2,
  ) {}

  async handle(event: GlobalBookCompletedStatus) {
    await this.cache.set(
      event.userId,
      {
        property: event.propertyId,
        user: event.userId,
        booking: event.bookingId,
      },
      7 * 24 * 60 * 60 * 1000,
    );

    this.eventEmmiter.emit(eventNames.able_to_leave_review, event);
  }
}
