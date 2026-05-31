export interface IChat {
  id: string;
  bookingId: string;
  hostId: string;
  guestId: string;
  createdAt: string;
  lastMessage?: IMessage;
  unreadCount?: number;
}

export interface IMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}
