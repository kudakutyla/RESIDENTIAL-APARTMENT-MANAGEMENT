import type { Request, Response } from "express";
import { listNotifications, markNotificationRead } from "../services/notificationService";

export async function getNotifications(req: Request, res: Response) {
  const notifications = await listNotifications(req.user!.id);
  res.status(200).json({ notifications });
}

export async function markRead(req: Request, res: Response) {
  const notification = await markNotificationRead(req.user!.id, req.params.id);
  res.status(200).json({ notification });
}
