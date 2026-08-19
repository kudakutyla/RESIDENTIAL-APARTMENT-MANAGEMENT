import type { Request, Response } from "express";
import { createSecurityReport, listSecurityReports, updateSecurityReportStatus } from "../services/securityReportService";

export async function listSecurity(req: Request, res: Response) {
  const reports = await listSecurityReports(req.user!);
  res.status(200).json({ reports });
}

export async function postSecurity(req: Request, res: Response) {
  const report = await createSecurityReport({ userId: req.user!.id, ...req.body });
  res.status(201).json({ report });
}

export async function patchSecurity(req: Request, res: Response) {
  const report = await updateSecurityReportStatus({ id: String(req.params.id), status: req.body.status });
  res.status(200).json({ report });
}
