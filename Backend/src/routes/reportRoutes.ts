import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorize";
import { getReports } from "../controllers/reportController";

export const reportRouter = Router();

reportRouter.use(authenticateToken, authorizeRoles("ADMIN", "MANAGER"));
reportRouter.get("/", asyncHandler(getReports));
