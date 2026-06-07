import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { ChatService } from './app/chat.service';

@ApiTags('Chat')
@ApiBearerAuth()
@Authorization('USER')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Get all chats for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of chats with participants and last message',
    schema: {
      example: [
        {
          id: 'uuid',
          participants: [{ id: 'uuid', name: 'Bob' }],
          lastMessage: { text: 'Hello!', createdAt: '2026-06-01T10:00:00Z' },
        },
      ],
    },
  })
  @Get()
  @HttpCode(200)
  async getChatInfo(@AccessInfo('id') id: string) {
    return await this.chatService.getUserChats(id);
  }

  @ApiOperation({ summary: 'Get messages for a specific chat' })
  @ApiParam({
    name: 'id',
    description: 'Chat UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'List of messages in the chat',
    schema: {
      example: [
        {
          id: 'uuid',
          text: 'Hello!',
          senderId: 'uuid',
          createdAt: '2026-06-01T10:00:00Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'User is not a participant of this chat',
  })
  @Get(':id/messages')
  @HttpCode(200)
  async getMessages(@AccessInfo('id') id: string, @Param('id') chatId: string) {
    return await this.chatService.getMessages(id, chatId);
  }
}
