import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GlobalBookConfirmedStatus } from 'src/common/events/globalConfirmed.event';
import { ChatService } from '../chat.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventNames } from 'src/common/constants/eventnames';

@EventsHandler(GlobalBookConfirmedStatus)
export class ChatEventConfirmBookHandler implements IEventHandler<GlobalBookConfirmedStatus> {
  constructor(
    private readonly chatService: ChatService,
    private readonly eventEmmiter: EventEmitter2,
  ) {}

  async handle(event: GlobalBookConfirmedStatus) {
    const data = {
      name: event.name,
      bookingId: event.bookingId,
      usersId: [event.hostId, event.userId],
    };
    await this.chatService.createChat(data);
    this.eventEmmiter.emit(eventNames.chat_created, event);
    this.eventEmmiter.emit(eventNames.chat_created, {
      ...event,
      userId: event.hostId,
    });
  }
}
