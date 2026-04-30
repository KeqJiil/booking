import z from "zod";

export const loginSchema = z.object({
  password: z
    .string()
    .min(1)
    .regex(
      /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/,
    ),
  email: z.email(),
});

export type ILoginSchema = z.infer<typeof loginSchema>;