import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BookingConfirmStatus } from '../../domain/events/booking.events';
import { GlobalBookConfirmedStatus } from 'src/common/events/globalConfirmed.event';

@EventsHandler(BookingConfirmStatus)
export class CompletedBookingEventHandler implements IEventHandler<BookingConfirmStatus> {
  constructor(private readonly eventBus: EventBus) {}

  handle(event: BookingConfirmStatus) {
    this.eventBus.publish(
      new GlobalBookConfirmedStatus(
        event.userId,
        event.hostId,
        event.bookingId,
        event.name,
      ),
    );
  }
}
