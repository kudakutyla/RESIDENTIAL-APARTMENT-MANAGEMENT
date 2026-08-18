import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { paymentVerifySchema } from "../utils/domainSchemas";
import { upload } from "../utils/upload";
import { listPayments, patchVerifyPayment, uploadProof } from "../controllers/paymentController";

export const paymentRouter = Router();

paymentRouter.use(authenticateToken);
paymentRouter.get("/", asyncHandler(listPayments));
paymentRouter.post("/:id/proof", upload.single("file"), asyncHandler(uploadProof));
paymentRouter.patch("/:id/verify", authorizeRoles("ADMIN", "MANAGER"), validateBody(paymentVerifySchema), asyncHandler(patchVerifyPayment));
