import type { Request, Response } from "express";
import { listContractors, registerContractor } from "../services/contractorService";

export async function getContractors(_req: Request, res: Response) {
  const contractors = await listContractors();
  res.status(200).json({ contractors });
}

export async function postContractor(req: Request, res: Response) {
  const result = await registerContractor({ ...req.body, actorUserId: req.user!.id });
  res.status(201).json(result);
}
