import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { getDashboard } from "../controllers/dashboardController";

export const dashboardRouter = Router();

dashboardRouter.use(authenticateToken);
dashboardRouter.get("/", asyncHandler(getDashboard));
