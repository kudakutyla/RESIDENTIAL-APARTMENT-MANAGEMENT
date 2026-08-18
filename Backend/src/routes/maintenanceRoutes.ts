import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import { maintenanceAssignSchema, maintenanceCreateSchema, maintenanceUpdateSchema } from "../utils/domainSchemas";
import {
  getMaintenance,
  listMaintenance,
  postAssignContractor,
  postMaintenance,
  postMaintenanceUpdate,
} from "../controllers/maintenanceController";

export const maintenanceRouter = Router();

maintenanceRouter.use(authenticateToken);
maintenanceRouter.get("/", asyncHandler(listMaintenance));
maintenanceRouter.post("/", validateBody(maintenanceCreateSchema), asyncHandler(postMaintenance));
maintenanceRouter.get("/:id", asyncHandler(getMaintenance));
maintenanceRouter.post("/:id/assign", validateBody(maintenanceAssignSchema), asyncHandler(postAssignContractor));
maintenanceRouter.post("/:id/updates", validateBody(maintenanceUpdateSchema), asyncHandler(postMaintenanceUpdate));
