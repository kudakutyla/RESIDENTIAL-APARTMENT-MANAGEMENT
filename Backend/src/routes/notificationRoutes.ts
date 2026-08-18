import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { getNotifications, markRead } from "../controllers/notificationController";

export const notificationRouter = Router();

notificationRouter.use(authenticateToken);
notificationRouter.get("/", asyncHandler(getNotifications));
notificationRouter.post("/:id/read", asyncHandler(markRead));
