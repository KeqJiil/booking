import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthToken } from '@/shared/api/auth.store';
import { resetPasswordFn } from '../api/reset-password.api';

export const useResetPassword = () => {
  const clearToken = useAuthToken((state) => state.clearToken);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: resetPasswordFn,
    onSuccess: () => {
      clearToken();
      toast.success('Password was succesfully changed');
      navigate('/');
    },
    onError: (err) => {
      toast.error(`Something went wrong: ${err.name} ${err.message}`);
    },
  });
};
