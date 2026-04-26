import { PrismaService } from 'src/database/prisma.service';
import {
  IChatRepository,
  IChatRoomForClient,
  ICreateChatData,
  IMessage,
  IMessageView,
  IUserChats,
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

  async getMessage(messageId: string): Promise<IMessageView> {
    const message = await this.prisma.message.findFirst({
      where: {
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

  async changeName(chatIds: string[], newName: string) {
    await this.prisma.chat.updateMany({
      where: {
        id: {
          in: chatIds,
        },
      },
      data: {
        name: newName,
      },
    });
  }

  async createChatRoom(data: ICreateChatData): Promise<void> {
    await this.prisma.chat.create({
      data: {
        name: data.name,
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
    newText: string,
  ): Promise<IMessage> {
    const { id, text, chatId } = await this.prisma.message.create({
      data: {
        userId,
        chatId: chatRoomId,
        text: newText,
      },
    });
    return { id, text, chatId };
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
    newText: string,
    userId: string,
  ): Promise<IMessage> {
    const { id, text, chatId } = await this.prisma.message.update({
      where: {
        id: messageId,
        chatId: chatRoomId,
        userId,
      },
      data: {
        text: newText,
      },
    });
    return { id, text, chatId };
  }

  async getRoomAsClient(
    chatId: string,
    userId: string,
  ): Promise<IChatRoomForClient> {
    const chatAsAUser = await this.prisma.chat.findFirst({
      where: {
        chatUsers: {
          some: { userId, id: chatId },
        },
      },
      select: {
        id: true,
        status: true,
      },
    });
    if (!chatAsAUser || chatAsAUser.status === 'DELETED')
      throw new NotFoundException();
    return chatAsAUser;
  }

  async getUserChats(userId: string): Promise<IUserChats[]> {
    return await this.prisma.chatUser.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        chat: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
