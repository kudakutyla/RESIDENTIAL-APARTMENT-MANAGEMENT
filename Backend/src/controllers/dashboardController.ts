import type { Request, Response } from "express";
import { adminDashboard, contractorDashboard, managerDashboard, tenantDashboard } from "../services/dashboardService";

export async function getDashboard(req: Request, res: Response) {
  const role = req.user!.role;
  if (role === "TENANT") {
    return res.status(200).json({ dashboard: await tenantDashboard(req.user!.id) });
  }
  if (role === "MANAGER") {
    return res.status(200).json({ dashboard: await managerDashboard(req.user!.id) });
  }
  if (role === "CONTRACTOR") {
    return res.status(200).json({ dashboard: await contractorDashboard(req.user!.id) });
  }
  return res.status(200).json({ dashboard: await adminDashboard() });
}
