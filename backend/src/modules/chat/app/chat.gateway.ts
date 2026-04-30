import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { WsAuthorization } from 'src/common/decorators/wsAuthorization.decorator';
import { WsAccessInfo } from 'src/common/decorators/esAccessInfo.decorator';
import { CreateMessageDto } from './dto/sentMessage.dto';
import { EditMessageDto } from './dto/editMessage.dto';
import { DeleteMessageDto } from './dto/deleteMessage.dto';
import { DeleteChatDto } from './dto/leaveChat.dto';
import { Logger } from 'nestjs-pino';
import { Injectable } from '@nestjs/common';

@Injectable()
@WsAuthorization('USER')
@WebSocketGateway({ cors: true, namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly logger: Logger,
  ) {}
  @WebSocketServer() server!: Server;

  handleConnection(client: Socket) {
    this.logger.log(`User ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`User ${client.id} disconnected`);
  }

  @SubscribeMessage('join_room')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @WsAccessInfo('id') id: string,
    @MessageBody() chatUserId: string,
  ) {
    const data = await this.chatService.getChat(chatUserId, id);
    await client.join(data.id);
  }

  @SubscribeMessage('leave_room')
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: string,
  ) {
    await client.leave(chatId);
  }

  @SubscribeMessage('delete_room')
  async deleteFromRoom(
    @ConnectedSocket() client: Socket,
    @WsAccessInfo('id') id: string,
    @MessageBody() data: DeleteChatDto,
  ) {
    await this.chatService.leaveRoom(id, data.userChatId);
    await client.leave(data.chatId);
    client.emit('deleted_from_chat', data);
  }

  @SubscribeMessage('sent_message')
  async sentMessage(
    @ConnectedSocket() client: Socket,
    @WsAccessInfo('id') id: string,
    @MessageBody() data: CreateMessageDto,
  ) {
    const created = await this.chatService.sentMessage(
      data.text,
      id,
      data.chatId,
    );
    this.server.to(data.chatId).emit('new_message', created);
  }

  @SubscribeMessage('edit_message')
  async editMessage(
    @ConnectedSocket() client: Socket,
    @WsAccessInfo('id') id: string,
    @MessageBody() data: EditMessageDto,
  ) {
    const edited = await this.chatService.editMessage(
      data.text,
      id,
      data.messageId,
      data.chatId,
    );
    this.server.to(data.chatId).emit('edited_message', edited);
  }

  @SubscribeMessage('delete_message')
  async deleteMessage(
    @ConnectedSocket() client: Socket,
    @WsAccessInfo('id') id: string,
    @MessageBody() data: DeleteMessageDto,
  ) {
    await this.chatService.deleteMessage(data.messageId, id);
    this.server.to(data.chatId).emit('message_deleted', {
      messageId: data.messageId,
      chatId: data.chatId,
    });
  }
}
