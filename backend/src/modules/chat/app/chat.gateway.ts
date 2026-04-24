import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Authorization } from 'src/common/decorators/authorization.decorator';

@Authorization('USER')
@WebSocketGateway({ cors: true, namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('Chat');
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {}

  @SubscribeMessage('sent_message')
  async sentMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() text: string,
  ) {}

  @SubscribeMessage('get_room')
  async getRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() text: string,
  ) {}

  @SubscribeMessage('edit_message')
  async editMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() text: string,
  ) {}

  @SubscribeMessage('delete_message')
  async deleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() text: string,
  ) {}

  @SubscribeMessage('leave_room')
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() text: string,
  ) {}
}
