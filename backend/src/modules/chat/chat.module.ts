import { Module } from '@nestjs/common';
import { PrismaChatRepository } from './repo/chat.repository';
import { ChatGateway } from './app/chat.gateway';
import { ChatService } from './app/chat.service';
import { WsAuthGuard } from 'src/common/guards/MyAuthWsGuard.guard';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, JwtModule],
  controllers: [ChatController],
  providers: [
    {
      provide: 'ChatRepo',
      useClass: PrismaChatRepository,
    },
    ChatGateway,
    ChatService,
    WsAuthGuard,
  ],
})
export class ChatModule {}
