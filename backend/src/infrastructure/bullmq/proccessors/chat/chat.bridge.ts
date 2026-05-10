import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { eventNames } from 'src/common/constants/eventnames';
import { IConfirmedBook } from './interfaces/ICompletedBooking.interface';

@Injectable()
export class ChatBullBridge {
  constructor(@InjectQueue('chat') private chatQueue: Queue) {}

  async handle(event: IConfirmedBook) {
    await this.chatQueue.add(eventNames.booking_confirmed, {
      usersId: [event.userId, event.hostId],
      bookingId: event.bookingId,
      propertyId: event.propertyId,
    });
  }
}
