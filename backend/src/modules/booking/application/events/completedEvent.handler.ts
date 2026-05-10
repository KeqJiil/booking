import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BookingCompletedStatus } from '../../domain/events/booking.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventNames } from 'src/common/constants/eventnames';

@EventsHandler(BookingCompletedStatus)
export class CompletedBookingEventHandler implements IEventHandler<BookingCompletedStatus> {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  handle(event: BookingCompletedStatus) {
    this.eventEmitter.emit(eventNames.booking_completed, event);
  }
}
