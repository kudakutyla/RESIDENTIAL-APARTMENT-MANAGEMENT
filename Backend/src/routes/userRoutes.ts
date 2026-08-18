import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { createStaffSchema, userStatusSchema } from "../utils/domainSchemas";
import { createStaff, getUsers, updateUserStatus } from "../controllers/userController";

export const userRouter = Router();

userRouter.use(authenticateToken, authorizeRoles("ADMIN"));
userRouter.get("/", asyncHandler(getUsers));
userRouter.post("/", validateBody(createStaffSchema), asyncHandler(createStaff));
userRouter.patch("/:id/status", validateBody(userStatusSchema), asyncHandler(updateUserStatus));
