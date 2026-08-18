import type { Request, Response } from "express";
import { getSystemReports } from "../services/reportService";

export async function getReports(_req: Request, res: Response) {
  const reports = await getSystemReports();
  res.status(200).json({ reports });
}
