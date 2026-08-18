import type { Request, Response } from "express";
import { adminCreateStaff, adminListUsers, adminSetUserStatus } from "../services/userService";

export async function createStaff(req: Request, res: Response) {
  const user = await adminCreateStaff({ ...req.body, actorUserId: req.user!.id });
  res.status(201).json({ user });
}

export async function getUsers(req: Request, res: Response) {
  const users = await adminListUsers({
    role: req.query.role as any,
    q: req.query.q as string | undefined,
  });
  res.status(200).json({ users });
}

export async function updateUserStatus(req: Request, res: Response) {
  const user = await adminSetUserStatus({
    actorUserId: req.user!.id,
    userId: req.params.id,
    status: req.body.status,
  });
  res.status(200).json({ user });
}
