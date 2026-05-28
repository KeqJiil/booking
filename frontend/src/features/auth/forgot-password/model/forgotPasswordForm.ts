import z from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export type IForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
