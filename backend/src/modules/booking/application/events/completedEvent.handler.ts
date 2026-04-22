import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BookingCompletedStatus } from '../../domain/events/booking.events';
import { GlobalBookCompletedStatus } from '../../../../common/events/globalCompleted.event';

@EventsHandler(BookingCompletedStatus)
export class CompletedBookingEventHandler implements IEventHandler<BookingCompletedStatus> {
  constructor(private readonly eventBus: EventBus) {}

  handle(event: BookingCompletedStatus) {
    this.eventBus.publish(
      new GlobalBookCompletedStatus(
        event.userId,
        event.propertyId,
        event.bookingId,
      ),
    );
  }
}
