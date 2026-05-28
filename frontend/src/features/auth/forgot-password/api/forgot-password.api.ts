import { api } from '@/shared/api/axios.interceptors';

export const forgotPasswordFn = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};
