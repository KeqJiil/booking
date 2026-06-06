import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from 'nestjs-pino';
import { BookingStatusChangedHandler } from '../application/events/statusChanged.handler';
import { eventBookingMap } from '../../../common/constants/eventnames';
import { BookingStatusChanges } from '../domain/events/booking.events';

describe('BookingStatusChangedHandler', () => {
  let handler: BookingStatusChangedHandler;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingStatusChangedHandler,
        { provide: EventEmitter2, useValue: createMock<EventEmitter2>() },
        { provide: Logger, useValue: createMock<Logger>() },
      ],
    }).compile();

    handler = module.get(BookingStatusChangedHandler);
    eventEmitter = module.get(EventEmitter2);
    logger = module.get(Logger);
  });

  it('there is status in eventBookingMap → emit with right type', () => {
    const newStatus = eventBookingMap['CONFIRMED'];
    const event = new BookingStatusChanges('PENDING', 'CONFIRMED', 'user-1');
    handler.handle(event);
    expect(eventEmitter.emit).toHaveBeenCalledWith(newStatus, event);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('no status in eventBookingMap → logger.error, emit were not called', () => {
    const event = new BookingStatusChanges('PENDING', 'PENDING', 'user-1');
    handler.handle(event);
    expect(eventEmitter.emit).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});
