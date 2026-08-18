import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorize";
import { getContractors, postContractor } from "../controllers/contractorController";

export const contractorRouter = Router();

contractorRouter.use(authenticateToken);
contractorRouter.get("/", authorizeRoles("ADMIN", "MANAGER"), asyncHandler(getContractors));
contractorRouter.post("/", authorizeRoles("ADMIN"), asyncHandler(postContractor));
