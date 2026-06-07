import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BookingStatusChanges } from '../../domain/events/booking.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventBookingMap } from 'src/common/constants/eventnames';
import { Logger } from 'nestjs-pino';

@EventsHandler(BookingStatusChanges)
export class BookingStatusChangedHandler implements IEventHandler<BookingStatusChanges> {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: Logger,
  ) {}

  handle(event: BookingStatusChanges) {
    const type: string = eventBookingMap[event.newStatus];
    if (type) this.eventEmitter.emit(type, event);
    else
      this.logger.error({ event }, 'Not found type of event for eventEmiter');
  }
}
