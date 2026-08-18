import type { Request, Response } from "express";
import { createBuilding, deactivateBuilding, listBuildingsForUser, updateBuilding } from "../services/buildingService";

export async function listBuildings(req: Request, res: Response) {
  const buildings = await listBuildingsForUser(req.user!);
  res.status(200).json({ buildings });
}

export async function postBuilding(req: Request, res: Response) {
  const building = await createBuilding({ ...req.body, actorUserId: req.user!.id });
  res.status(201).json({ building });
}

export async function putBuilding(req: Request, res: Response) {
  const building = await updateBuilding({ id: req.params.id, actorUserId: req.user!.id, ...req.body });
  res.status(200).json({ building });
}

export async function deleteBuilding(req: Request, res: Response) {
  const building = await deactivateBuilding(req.user!.id, req.params.id);
  res.status(200).json({ building });
}
