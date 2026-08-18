import type { Request, Response } from "express";
import { env } from "../config/env";
import { changePassword, getCurrentUser, loginUser, registerTenant } from "../services/authService";

function setAuthCookie(res: Response, token: string) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export async function register(req: Request, res: Response) {
  const result = await registerTenant(req.body);
  setAuthCookie(res, result.token);
  res.status(201).json({ user: result.user });
}

export async function login(req: Request, res: Response) {
  const result = await loginUser(req.body.email, req.body.password);
  setAuthCookie(res, result.token);
  res.status(200).json({ user: result.user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(env.COOKIE_NAME, { path: "/" });
  res.status(200).json({ message: "Logged out" });
}

export async function me(req: Request, res: Response) {
  const user = await getCurrentUser(req.user!.id);
  res.status(200).json({ user });
}

export async function updatePassword(req: Request, res: Response) {
  await changePassword({
    userId: req.user!.id,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
  });
  res.status(200).json({ message: "Password changed successfully" });
}
