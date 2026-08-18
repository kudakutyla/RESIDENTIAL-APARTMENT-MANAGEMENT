import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { securityReportCreateSchema, securityReportStatusSchema } from "../utils/domainSchemas";
import { listSecurity, patchSecurity, postSecurity } from "../controllers/securityController";

export const securityRouter = Router();

securityRouter.use(authenticateToken);
securityRouter.get("/", asyncHandler(listSecurity));
securityRouter.post("/", authorizeRoles("TENANT"), validateBody(securityReportCreateSchema), asyncHandler(postSecurity));
securityRouter.patch("/:id", authorizeRoles("ADMIN", "MANAGER"), validateBody(securityReportStatusSchema), asyncHandler(patchSecurity));
