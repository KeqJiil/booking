import { Module } from '@nestjs/common';
import { PrismaChatRepository } from './repo/chat.repository';
import { ChatGateway } from './app/chat.gateway';
import { ChatService } from './app/chat.service';
import { ChatEventConfirmBookHandler } from './app/event/chatCreate.handler';

@Module({
  controllers: [],
  providers: [
    {
      provide: 'ChatRepo',
      useClass: PrismaChatRepository,
    },
    ChatGateway,
    ChatService,
    ChatEventConfirmBookHandler,
  ],
})
export class ChatModule {}
