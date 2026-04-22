import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GlobalBookCompletedStatus } from 'src/common/events/globalCompleted.event';
import type { Cache } from 'cache-manager';

@EventsHandler(GlobalBookCompletedStatus)
export class ReviewEventCompleteBookHandler implements IEventHandler<GlobalBookCompletedStatus> {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

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
  }
}
