import { Module } from '@nestjs/common';
import { PrismaChatRepository } from './repo/chat.repository';
import { ChatGateway } from './app/chat.gateway';

@Module({
  controllers: [],
  providers: [
    {
      provide: 'ChatRepo',
      useClass: PrismaChatRepository,
    },
    ChatGateway,
  ],
})
export class ChatModule {}
