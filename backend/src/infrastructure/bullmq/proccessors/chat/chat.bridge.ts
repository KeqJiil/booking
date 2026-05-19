import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { eventNames } from 'src/common/constants/eventnames';
import type { IConfirmedBook } from './interfaces/ICompletedBooking.interface';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ChatBullBridge {
  constructor(@InjectQueue('chat') private chatQueue: Queue) {}

  @OnEvent(eventNames.booking_confirmed)
  async handle(event: IConfirmedBook) {
    await this.chatQueue.add(eventNames.booking_confirmed, {
      usersId: [event.userId, event.hostId],
      bookingId: event.bookingId,
      propertyId: event.propertyId,
    });
  }
}
