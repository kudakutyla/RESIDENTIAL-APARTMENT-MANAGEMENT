"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
exports.registerSchema = zod_1.z
    .object({
    fullName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(6),
    password: zod_1.z.string().regex(passwordRegex, "Password must include upper, lower and number with at least 8 characters."),
    confirmPassword: zod_1.z.string(),
    role: zod_1.z.string().optional(),
})
    .refine((v) => v.password === v.confirmPassword, {
    message: "Password confirmation does not match",
    path: ["confirmPassword"],
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().regex(passwordRegex),
    confirmNewPassword: zod_1.z.string(),
})
    .refine((v) => v.newPassword === v.confirmNewPassword, {
    message: "Password confirmation does not match",
    path: ["confirmNewPassword"],
});
