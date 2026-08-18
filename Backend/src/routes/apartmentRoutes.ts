import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { apartmentSchema } from "../utils/domainSchemas";
import { listApartments, postApartment, putApartment } from "../controllers/apartmentController";

export const apartmentRouter = Router();

apartmentRouter.use(authenticateToken);
apartmentRouter.get("/", asyncHandler(listApartments));
apartmentRouter.post("/", authorizeRoles("ADMIN"), validateBody(apartmentSchema), asyncHandler(postApartment));
apartmentRouter.put("/:id", authorizeRoles("ADMIN"), validateBody(apartmentSchema), asyncHandler(putApartment));
