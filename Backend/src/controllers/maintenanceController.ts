import type { Request, Response } from "express";
import {
  addMaintenanceUpdate,
  assignContractor,
  createMaintenanceRequest,
  getMaintenanceById,
  listMaintenanceForUser,
} from "../services/maintenanceService";

export async function listMaintenance(req: Request, res: Response) {
  const requests = await listMaintenanceForUser(req.user!);
  res.status(200).json({ requests });
}

export async function postMaintenance(req: Request, res: Response) {
  const request = await createMaintenanceRequest({ userId: req.user!.id, ...req.body });
  res.status(201).json({ request });
}

export async function getMaintenance(req: Request, res: Response) {
  const request = await getMaintenanceById(req.user!, req.params.id);
  res.status(200).json({ request });
}

export async function postAssignContractor(req: Request, res: Response) {
  const request = await assignContractor({
    actorUser: req.user!,
    requestId: req.params.id,
    contractorId: req.body.contractorId,
  });
  res.status(200).json({ request });
}

export async function postMaintenanceUpdate(req: Request, res: Response) {
  const request = await addMaintenanceUpdate({
    actorUser: req.user!,
    requestId: req.params.id,
    message: req.body.message,
    status: req.body.status,
  });
  res.status(200).json({ request });
}
