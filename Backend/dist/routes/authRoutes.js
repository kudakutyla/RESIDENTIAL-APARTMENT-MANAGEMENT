"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const asyncHandler_1 = require("../middleware/asyncHandler");
const authenticate_1 = require("../middleware/authenticate");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../utils/schemas");
const authController_1 = require("../controllers/authController");
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/register", limiter, (0, validate_1.validateBody)(schemas_1.registerSchema), (0, asyncHandler_1.asyncHandler)(authController_1.register));
exports.authRouter.post("/login", limiter, (0, validate_1.validateBody)(schemas_1.loginSchema), (0, asyncHandler_1.asyncHandler)(authController_1.login));
exports.authRouter.post("/logout", authenticate_1.authenticateToken, (0, asyncHandler_1.asyncHandler)(authController_1.logout));
exports.authRouter.get("/me", authenticate_1.authenticateToken, (0, asyncHandler_1.asyncHandler)(authController_1.me));
exports.authRouter.post("/change-password", authenticate_1.authenticateToken, (0, validate_1.validateBody)(schemas_1.changePasswordSchema), (0, asyncHandler_1.asyncHandler)(authController_1.updatePassword));
