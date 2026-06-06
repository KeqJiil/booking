import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PropertyCreatedHandler } from '../application/events/propertyCreated.handler';
import { PropertyCreated } from '../domain/events/property.events';
import { eventNames } from 'src/common/constants/eventnames';

describe('PropertyCreatedHandler', () => {
  let handler: PropertyCreatedHandler;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyCreatedHandler,
        { provide: EventEmitter2, useValue: createMock<EventEmitter2>() },
      ],
    }).compile();

    handler = module.get(PropertyCreatedHandler);
    eventEmitter = module.get(EventEmitter2);
  });

  it('handle(event) → emit(property_created, { id, userId: hostId })', () => {
    const event = new PropertyCreated('id-1', 'hostid-1');
    handler.handle(event);
    expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      eventNames.property_created,
      { id: event.id, userId: event.hostId },
    );
  });
});
