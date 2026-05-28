import { api } from '@/shared/api/axios.interceptors';
import type { IReturnTypeAuth } from '../../types';

export const verifyEmailFn = async (token: string): Promise<IReturnTypeAuth> => {
  const { data } = await api.post(`/auth/verify/${token}`);
  return data;
};
