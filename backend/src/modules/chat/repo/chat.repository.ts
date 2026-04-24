import { PrismaService } from 'src/database/prisma.service';
import {
  IChatRepository,
  IChatRoom,
  ICreateChatData,
  IMessageView,
} from '../domain/interfaces/chatRepository.interface';
import { NotFoundException } from '@nestjs/common';

export class PrismaChatRepository implements IChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMessages(
    chatRoomId: string,
    cursor: string,
  ): Promise<IMessageView[]> {
    const messages = await this.prisma.message.findMany({
      where: { chatId: chatRoomId },
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take: 20,
    });
    return messages.map((el) => ({ ...el, user: el.user.name }));
  }

  async getMessage(
    chatRoomId: string,
    messageId: string,
  ): Promise<IMessageView> {
    const message = await this.prisma.message.findFirst({
      where: {
        chatId: chatRoomId,
        id: messageId,
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!message) throw new NotFoundException();
    return { ...message, user: message.user.name };
  }

  async createChatRoom(data: ICreateChatData): Promise<void> {
    await this.prisma.chat.create({
      data: {
        bookingId: data.bookingId,
        chatUsers: {
          create: [{ userId: data.usersId[0] }, { userId: data.usersId[1] }],
        },
        status: 'ALIVE',
      },
    });
  }

  async createMessage(
    chatRoomId: string,
    userId: string,
    text: string,
  ): Promise<void> {
    await this.prisma.message.create({
      data: {
        userId,
        chatId: chatRoomId,
        text,
      },
    });
  }

  async leaveFromChat(chatRoomId: string, userId: string): Promise<void> {
    await this.prisma.chatUser.deleteMany({
      where: { userId, chatId: chatRoomId },
    });
  }

  async deleteMessage(chatRoomId: string, messageId: string): Promise<void> {
    await this.prisma.message.delete({
      where: { id: messageId, chatId: chatRoomId },
    });
  }

  async editMessage(
    chatRoomId: string,
    messageId: string,
    text: string,
  ): Promise<void> {
    await this.prisma.message.update({
      where: {
        id: messageId,
        chatId: chatRoomId,
      },
      data: {
        text,
      },
    });
  }

  async getChatRoom(chatRoomId: string): Promise<IChatRoom> {
    const room = await this.prisma.chat.findUnique({
      where: { id: chatRoomId },
      select: {
        id: true,
        chatUsers: {
          select: {
            userId: true,
            id: true,
          },
        },
      },
    });
    if (!room) throw new NotFoundException();
    return { chatId: room.id, chatUser: room.chatUsers };
  }
}
