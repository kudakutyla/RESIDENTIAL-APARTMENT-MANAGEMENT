import type { Request, Response } from "express";
import { createAnnouncement, listAnnouncementsForUser } from "../services/announcementService";

export async function listAnnouncements(req: Request, res: Response) {
  const announcements = await listAnnouncementsForUser(req.user!);
  res.status(200).json({ announcements });
}

export async function postAnnouncement(req: Request, res: Response) {
  const announcement = await createAnnouncement({ createdBy: req.user!.id, ...req.body });
  res.status(201).json({ announcement });
}
