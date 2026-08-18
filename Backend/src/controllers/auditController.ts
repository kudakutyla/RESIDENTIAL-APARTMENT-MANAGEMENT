import type { Request, Response } from "express";
import { listAuditLogs } from "../services/auditService";

export async function getAuditLogs(_req: Request, res: Response) {
  const logs = await listAuditLogs();
  res.status(200).json({ logs });
}
