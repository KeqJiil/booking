import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PropertyDeleted } from '../../domain/events/property.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventNames } from 'src/common/constants/eventnames';

@EventsHandler(PropertyDeleted)
export class PropertyDeletedHandler implements IEventHandler<PropertyDeleted> {
  constructor(private readonly eventEmmiter: EventEmitter2) {}

  handle(event: PropertyDeleted) {
    this.eventEmmiter.emit(eventNames.property_deleted, {
      id: event.id,
      userId: event.hostId,
    });
  }
}
