import z from "zod";

export const registerSchema = z.object({
  email: z.email(),
  username: z.string().min(4).max(20),
  password: z
    .string()
    .min(1)
    .regex(
      /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/,
    ),
});

export type IRegisterSchema = z.infer<typeof registerSchema>;
