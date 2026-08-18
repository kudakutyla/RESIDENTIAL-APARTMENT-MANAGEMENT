import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    password: z.string().regex(passwordRegex, "Password must include upper, lower and number with at least 8 characters."),
    confirmPassword: z.string(),
    role: z.string().optional(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Password confirmation does not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().regex(passwordRegex),
    confirmNewPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmNewPassword, {
    message: "Password confirmation does not match",
    path: ["confirmNewPassword"],
  });
