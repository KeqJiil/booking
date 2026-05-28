import { api } from '@/shared/api/axios.interceptors';

// POST /auth/logout — logout from the current session, clears refresh token cookie
export const logoutFn = async (): Promise<void> => {
  await api.post('/auth/logout');
};

// POST /auth/revoke-all — logout from all sessions
export const revokeAllSessionsFn = async (): Promise<void> => {
  await api.post('/auth/revoke-all');
};
