import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PropertyCreated } from '../../domain/events/property.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventNames } from 'src/common/constants/eventnames';

@EventsHandler(PropertyCreated)
export class PropertyCreatedHandler implements IEventHandler<PropertyCreated> {
  constructor(private readonly eventEmmiter: EventEmitter2) {}

  handle(event: PropertyCreated) {
    this.eventEmmiter.emit(eventNames.property_created, {
      id: event.id,
      userId: event.hostId,
    });
  }
}
