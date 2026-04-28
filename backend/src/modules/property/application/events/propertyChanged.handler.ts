import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PropertyChanged } from '../../domain/events/property.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventNames } from 'src/common/constants/eventnames';

@EventsHandler(PropertyChanged)
export class PropertyChangedHandler implements IEventHandler<PropertyChanged> {
  constructor(private readonly eventEmmiter: EventEmitter2) {}

  handle(event: PropertyChanged) {
    this.eventEmmiter.emit(eventNames.property_changed, {
      ...event,
      userId: event.newData.hostId,
    });
  }
}
