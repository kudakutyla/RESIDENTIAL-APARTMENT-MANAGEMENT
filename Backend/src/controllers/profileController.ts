import type { Request, Response } from "express";
import { updateProfile } from "../services/profileService";

export async function patchProfile(req: Request, res: Response) {
  const profile = await updateProfile({
    userId: req.user!.id,
    fullName: req.body.fullName,
    phone: req.body.phone,
  });
  res.status(200).json({ profile });
}
