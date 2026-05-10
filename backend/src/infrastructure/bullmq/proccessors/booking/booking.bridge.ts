import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { eventNames } from 'src/common/constants/eventnames';

@Injectable()
export class BookingBullBridge {
  constructor(@InjectQueue('booking') private bookingQueue: Queue) {}

  @OnEvent(eventNames.booking_created)
  async bookingCreated(payload: { id: string }) {
    await this.bookingQueue.add(eventNames.booking_created, payload, {
      delay: 10 * 60 * 1000,
    });
  }
}
