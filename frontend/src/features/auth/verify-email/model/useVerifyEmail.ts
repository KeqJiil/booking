import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthToken } from '@/shared/api/auth.store';
import { verifyEmailFn } from '../api/verify-email.api';

export const useVerifyEmail = () => {
  const setToken = useAuthToken((token) => token.setToken);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: verifyEmailFn,
    onSuccess: ({ accessToken }) => {
      setToken(accessToken);
      toast.success('Email confirmed succesfully');
      navigate('/');
    },
    onError: () => {
      toast.error('Link was not found or it is expired!');
    },
  });
};
