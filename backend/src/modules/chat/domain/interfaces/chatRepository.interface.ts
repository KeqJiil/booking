export interface IMessageView {
  id: string;
  text: string;
  user: string;
  createdAt: Date;
}

export interface ICreateChatData {
  bookingId: string;
  usersId: string[];
  name: string;
}

export type IChatStatuses = 'DELETED' | 'ALIVE';

export interface IChatRoom {
  id: string;
  status: IChatStatuses;
  bookingId: string | null;
}

export interface IChatRoomForClient {
  status: IChatStatuses;
  id: string;
}

export interface IUserChats {
  id: string;
  chat: {
    name: string;
  };
}

export interface IMessage {
  id: string;
  text: string;
  chatId: string;
}

export interface IChatRepository {
  changeName(chatIds: string[], newName: string): Promise<void>;
  getMessages(chatRoomId: string, cursor: string): Promise<IMessageView[]>;
  createChatRoom(data: ICreateChatData): Promise<void>;
  createMessage(
    chatRoomId: string,
    userId: string,
    text: string,
  ): Promise<IMessage>;
  editMessage(
    chatRoomId: string,
    messageId: string,
    text: string,
    userId: string,
  ): Promise<IMessage>;
  deleteMessage(chatRoomId: string, messageId: string): Promise<void>;
  getMessage(messageId: string): Promise<IMessageView>;
  leaveFromChat(chatRoomId: string, userId: string): Promise<void>;
  getRoomAsClient(chatId: string, userId: string): Promise<IChatRoomForClient>;
  getUserChats(userId: string): Promise<IUserChats[]>;
}
