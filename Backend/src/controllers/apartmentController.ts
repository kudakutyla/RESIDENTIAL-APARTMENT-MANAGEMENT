import type { Request, Response } from "express";
import { createApartment, listApartmentsForUser, updateApartment } from "../services/apartmentService";

export async function listApartments(req: Request, res: Response) {
  const apartments = await listApartmentsForUser(req.user!);
  res.status(200).json({ apartments });
}

export async function postApartment(req: Request, res: Response) {
  const apartment = await createApartment({ actorUserId: req.user!.id, ...req.body });
  res.status(201).json({ apartment });
}

export async function putApartment(req: Request, res: Response) {
  const apartment = await updateApartment({ id: req.params.id, actorUserId: req.user!.id, ...req.body });
  res.status(200).json({ apartment });
}
