import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type {
  IChatRepository,
  ICreateChatData,
} from '../domain/interfaces/chatRepository.interface';

@Injectable()
export class ChatService {
  constructor(@Inject('ChatRepo') private readonly repo: IChatRepository) {}

  async getMessages(userId: string, chatId: string) {
    return await this.repo.getMessages(userId, chatId);
  }

  async createChat(data: ICreateChatData) {
    await this.repo.createChatRoom(data);
  }

  async getChat(chatRoomId: string, userId: string) {
    return await this.repo.getRoomAsClient(chatRoomId, userId);
  }

  async sentMessage(text: string, userId: string, chatId: string) {
    return await this.repo.createMessage(chatId, userId, text);
  }

  async updateNames(chatIds: string[], newName: string) {
    return await this.repo.changeName(chatIds, newName);
  }

  async editMessage(
    text: string,
    userId: string,
    messageId: string,
    chatRoomId: string,
  ) {
    const message = await this.repo.getMessage(messageId);
    if (message.text === text) throw new ConflictException();
    await this.repo.editMessage(chatRoomId, messageId, text, userId);
  }

  async deleteMessage(messageId: string, userId: string) {
    await this.deleteMessage(messageId, userId);
  }

  async leaveRoom(userId: string, chatUserId: string) {
    await this.repo.leaveFromChat(chatUserId, userId);
  }

  async getUserChats(userId: string) {
    await this.repo.getUserChats(userId);
  }
}
