import { Module } from '@nestjs/common';
import { PrismaChatRepository } from './repo/chat.repository';
import { ChatGateway } from './app/chat.gateway';
import { ChatService } from './app/chat.service';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { WsAuthGuard } from '../../common/guards/MyAuthWsGuard.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [AuthModule, JwtModule, UserModule],
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
