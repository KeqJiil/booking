import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { forgotPasswordFn } from '../api/forgot-password.api';

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPasswordFn,
    onSuccess: () => {
      toast.success('Check your email!');
    },
    onError: () => {
      toast.error('Failed to send a letter on email!');
    },
  });
};
