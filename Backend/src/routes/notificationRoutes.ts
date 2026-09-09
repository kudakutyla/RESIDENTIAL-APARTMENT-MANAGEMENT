import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { notificationCreateSchema } from "../utils/domainSchemas";
import { getNotifications, markRead, postNotification } from "../controllers/notificationController";

export const notificationRouter = Router();

notificationRouter.use(authenticateToken);
notificationRouter.get("/", asyncHandler(getNotifications));
notificationRouter.post("/", authorizeRoles("ADMIN", "MANAGER"), validateBody(notificationCreateSchema), asyncHandler(postNotification));
notificationRouter.post("/:id/read", asyncHandler(markRead));
