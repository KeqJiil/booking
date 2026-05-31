import { api } from '@/shared/api/axios.interceptors';
import type { IUserSettings } from '../model/types';

export const getUserSettings = async (): Promise<IUserSettings> => {
  const { data } = await api.get('/user/settings');
  return data;
};
