import z from 'zod';

const passwordRegex = /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(1).regex(passwordRegex, 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type IResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
