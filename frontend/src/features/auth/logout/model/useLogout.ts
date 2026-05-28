import { useMutation } from '@tanstack/react-query';
import { useAuthToken } from '@/shared/api/auth.store';
import { logoutFn, revokeAllSessionsFn } from '../api/logout.api';

export const useLogout = () => {
  const clearToken = useAuthToken((s) => s.clearToken);

  return useMutation({
    mutationFn: logoutFn,
    onSuccess: () => {
      clearToken();
    },
  });
};

export const useRevokeAllSessions = () => {
  const clearToken = useAuthToken((s) => s.clearToken);

  return useMutation({
    mutationFn: revokeAllSessionsFn,
    onSuccess: () => {
      clearToken();
    },
  });
};
