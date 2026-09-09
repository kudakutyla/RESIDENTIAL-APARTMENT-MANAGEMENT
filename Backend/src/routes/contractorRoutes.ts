import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { registerContractorSchema } from "../utils/domainSchemas";
import { getContractors, postContractor } from "../controllers/contractorController";

export const contractorRouter = Router();

contractorRouter.use(authenticateToken);
contractorRouter.get("/", authorizeRoles("ADMIN", "MANAGER"), asyncHandler(getContractors));
contractorRouter.post("/", authorizeRoles("ADMIN", "MANAGER"), validateBody(registerContractorSchema), asyncHandler(postContractor));
