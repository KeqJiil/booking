import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPassword } from '../model/useForgotPassword';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { forgotPasswordSchema, type IForgotPasswordSchema } from '../model/forgotPasswordForm';

export function ForgotPasswordForm() {
  const { register, handleSubmit, formState } = useForm<IForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const { mutate, isPending, isSuccess } = useForgotPassword();

  const onSubmit = ({ email }: IForgotPasswordSchema) => {
    mutate(email);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input type="email" placeholder="Email" {...register('email')} />
      <span className={`${formState.errors.email?.message ? 'opacity-100' : 'opacity-0'} text-red-500`}>
        {formState.errors.email?.message}
      </span>
      <Button disabled={isPending || isSuccess} type="submit">
        {isPending ? 'Sending...' : 'Reset password'}
      </Button>
    </form>
  );
}
