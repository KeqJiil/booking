import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompletedBookingEventHandler } from '../application/events/confirmedEvent.handler';
import { BookingConfirmStatus } from '../domain/events/booking.events';
import { eventNames } from 'src/common/constants/eventnames';

describe('CompletedBookingEventHandler (confirm event)', () => {
  let handler: CompletedBookingEventHandler;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompletedBookingEventHandler,
        { provide: EventEmitter2, useValue: createMock<EventEmitter2>() },
      ],
    }).compile();

    handler = module.get(CompletedBookingEventHandler);
    eventEmitter = module.get(EventEmitter2);
  });

  it('handle(event) → emit(booking_confirmed, event) (happy path)', () => {
    const event = new BookingConfirmStatus(
      'user-1',
      'host-1',
      'booking-1',
      'property-1',
    );
    handler.handle(event);
    expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      eventNames.booking_confirmed,
      event,
    );
  });
});
