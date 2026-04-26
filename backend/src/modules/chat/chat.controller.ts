import { Controller, Get, Param } from '@nestjs/common';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { ChatService } from './app/chat.service';

@Controller('chat')
@Authorization('USER')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getChatInfo(@AccessInfo('id') id: string) {
    return await this.chatService.getUserChats(id);
  }

  @Get(':id/messages')
  async getMessages(@AccessInfo('id') id: string, @Param('id') chatId: string) {
    return await this.chatService.getMessages(id, chatId);
  }
}
