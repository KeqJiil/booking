import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { eventNames } from 'src/common/constants/eventnames';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BookingConfirmStatus } from '../../domain/events/booking.events';

@EventsHandler(BookingConfirmStatus)
export class CompletedBookingEventHandler implements IEventHandler<BookingConfirmStatus> {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  handle(event: BookingConfirmStatus) {
    this.eventEmitter.emit(eventNames.booking_confirmed, event);
  }
}
