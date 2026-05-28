import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { useResetPassword } from '../model/useResetPassword';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { resetPasswordSchema, type IResetPasswordSchema } from '../model/resetPasswordForm';

export function ResetPasswordForm() {
  const { token } = useParams<{ token: string }>();
  const { register, handleSubmit, formState } = useForm<IResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });
  const { mutate, isPending, isSuccess } = useResetPassword();

  const onSubmit = ({ newPassword }: IResetPasswordSchema) => {
    if (!token) return;
    mutate({ token, newPassword });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input type="password" placeholder="New password" {...register('newPassword')} />
      <span className={`${formState.errors.newPassword?.message ? 'opacity-100' : 'opacity-0'} text-red-500`}>
        {formState.errors.newPassword?.message}
      </span>
      <Input type="password" placeholder="Confirm new password" {...register('confirmPassword')} />
      <span className={`${formState.errors.confirmPassword?.message ? 'opacity-100' : 'opacity-0'} text-red-500`}>
        {formState.errors.confirmPassword?.message}
      </span>
      <Button type="submit" disabled={isPending || isSuccess}>
        {isPending ? 'Saving...' : 'Save password'}
      </Button>
    </form>
  );
}
