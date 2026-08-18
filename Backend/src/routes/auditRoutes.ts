import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorize";
import { getAuditLogs } from "../controllers/auditController";

export const auditRouter = Router();

auditRouter.use(authenticateToken, authorizeRoles("ADMIN"));
auditRouter.get("/", asyncHandler(getAuditLogs));
