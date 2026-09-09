import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { createStaffSchema, userStatusSchema } from "../utils/domainSchemas";
import { createStaff, getUsers, updateUserStatus } from "../controllers/userController";

export const userRouter = Router();

userRouter.use(authenticateToken);
userRouter.get("/", authorizeRoles("ADMIN", "MANAGER"), asyncHandler(getUsers));
userRouter.post("/", authorizeRoles("ADMIN"), validateBody(createStaffSchema), asyncHandler(createStaff));
userRouter.patch("/:id/status", authorizeRoles("ADMIN"), validateBody(userStatusSchema), asyncHandler(updateUserStatus));
