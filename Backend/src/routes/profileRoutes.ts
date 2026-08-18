import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import { profileUpdateSchema } from "../utils/domainSchemas";
import { patchProfile } from "../controllers/profileController";

export const profileRouter = Router();

profileRouter.use(authenticateToken);
profileRouter.patch("/", validateBody(profileUpdateSchema), asyncHandler(patchProfile));
