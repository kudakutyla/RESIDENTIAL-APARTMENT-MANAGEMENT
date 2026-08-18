import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    password: z.string().regex(passwordRegex, "Use at least 8 chars with uppercase, lowercase, and a number."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
