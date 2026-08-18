import type { Request, Response } from "express";
import { createContractor, listContractors } from "../services/contractorService";

export async function getContractors(_req: Request, res: Response) {
  const contractors = await listContractors();
  res.status(200).json({ contractors });
}

export async function postContractor(req: Request, res: Response) {
  const contractor = await createContractor(req.body);
  res.status(201).json({ contractor });
}
