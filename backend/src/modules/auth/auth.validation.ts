import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string()
    .min(6)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain 1 uppercase, 1 lowercase, 1 number"),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).optional().default('VIEWER')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string()
});