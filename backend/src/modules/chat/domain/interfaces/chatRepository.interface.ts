export interface IMessageView {
  id: string;
  text: string;
  user: string;
  createdAt: Date;
}

export interface ICreateChatData {
  bookingId: string;
  usersId: string[];
}

export interface IChatRoom {
  chatUser: { id: string; userId: string }[];
  chatId: string;
}

export interface IChatRepository {
  getMessages(chatRoomId: string, cursor: string): Promise<IMessageView[]>;
  createChatRoom(data: ICreateChatData): Promise<void>;
  createMessage(
    chatRoomId: string,
    userId: string,
    text: string,
  ): Promise<void>;
  editMessage(
    chatRoomId: string,
    messageId: string,
    text: string,
  ): Promise<void>;
  deleteMessage(chatRoomId: string, messageId: string): Promise<void>;
  getMessage(chatRoomId: string, messageId: string): Promise<IMessageView>;
  leaveFromChat(chatRoomId: string, userId: string): Promise<void>;
  getChatRoom(chatRoomId: string): Promise<IChatRoom>;
}
