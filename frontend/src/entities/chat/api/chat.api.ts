import { api } from '@/shared/api/axios.interceptors';
import type { IChat, IMessage } from '../model/types';

// GET /chat — get all user chats (role: USER)
export const getMyChats = async (): Promise<IChat[]> => {
  const { data } = await api.get('/chat');
  return data;
};

// GET /chat/:id/messages — get messages in a chat (role: USER)
export const getChatMessages = async (chatId: string): Promise<IMessage[]> => {
  const { data } = await api.get(`/chat/${chatId}/messages`);
  return data;
};
