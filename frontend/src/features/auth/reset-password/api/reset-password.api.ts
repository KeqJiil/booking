import { api } from '@/shared/api/axios.interceptors';
import type { IReturnTypeAuth } from '../../types';

export const resetPasswordFn = async (params: { token: string; newPassword: string }): Promise<IReturnTypeAuth> => {
  const { data } = await api.post(`/auth/new-password/${params.token}`, { newPassword: params.newPassword });
  return data;
};
