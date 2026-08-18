import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import { changePasswordSchema, loginSchema, registerSchema } from "../utils/schemas";
import { login, logout, me, register, updatePassword } from "../controllers/authController";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRouter = Router();

authRouter.post("/register", limiter, validateBody(registerSchema), asyncHandler(register));
authRouter.post("/login", limiter, validateBody(loginSchema), asyncHandler(login));
authRouter.post("/logout", authenticateToken, asyncHandler(logout));
authRouter.get("/me", authenticateToken, asyncHandler(me));
authRouter.post("/change-password", authenticateToken, validateBody(changePasswordSchema), asyncHandler(updatePassword));
