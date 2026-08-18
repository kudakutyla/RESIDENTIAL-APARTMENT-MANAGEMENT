import { Router } from "express";
import { listBuildings, postBuilding, putBuilding, deleteBuilding } from "../controllers/buildingController";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { buildingSchema } from "../utils/domainSchemas";

export const buildingRouter = Router();

buildingRouter.use(authenticateToken);
buildingRouter.get("/", asyncHandler(listBuildings));
buildingRouter.post("/", authorizeRoles("ADMIN"), validateBody(buildingSchema), asyncHandler(postBuilding));
buildingRouter.put("/:id", authorizeRoles("ADMIN"), validateBody(buildingSchema), asyncHandler(putBuilding));
buildingRouter.delete("/:id", authorizeRoles("ADMIN"), asyncHandler(deleteBuilding));
