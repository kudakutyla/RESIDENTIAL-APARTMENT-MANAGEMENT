import type { Request, Response } from "express";
import { listNotifications, markNotificationRead, sendNotification } from "../services/notificationService";

export async function getNotifications(req: Request, res: Response) {
  const notifications = await listNotifications(req.user!.id);
  res.status(200).json({ notifications });
}

export async function markRead(req: Request, res: Response) {
  const notification = await markNotificationRead(req.user!.id, String(req.params.id));
  res.status(200).json({ notification });
}

export async function postNotification(req: Request, res: Response) {
  const notification = await sendNotification({ actorUser: req.user!, ...req.body });
  res.status(201).json({ notification });
}
