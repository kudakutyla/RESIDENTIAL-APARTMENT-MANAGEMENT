import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { announcementSchema } from "../utils/domainSchemas";
import { listAnnouncements, postAnnouncement } from "../controllers/announcementController";

export const announcementRouter = Router();

announcementRouter.use(authenticateToken);
announcementRouter.get("/", asyncHandler(listAnnouncements));
announcementRouter.post("/", authorizeRoles("ADMIN", "MANAGER"), validateBody(announcementSchema), asyncHandler(postAnnouncement));
