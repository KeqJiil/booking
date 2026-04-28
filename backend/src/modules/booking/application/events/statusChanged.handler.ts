import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BookingStatusChanges } from '../../domain/events/booking.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventBookingMap } from 'src/common/constants/eventnames';
import { Logger } from '@nestjs/common';

@EventsHandler(BookingStatusChanges)
export class BookingStatusChangedHandler implements IEventHandler<BookingStatusChanges> {
  private readonly logger = new Logger('Status change handler');
  constructor(private readonly eventEmmiter: EventEmitter2) {}

  handle(event: BookingStatusChanges) {
    const type = eventBookingMap[event.newStatus];
    if (type) this.eventEmmiter.emit(type, event);
    else this.logger.error('Not found type of event for eventEmiter');
  }
}
