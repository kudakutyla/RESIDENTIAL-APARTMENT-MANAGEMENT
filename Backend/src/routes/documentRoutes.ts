import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { documentStatusSchema } from "../utils/domainSchemas";
import { upload } from "../utils/upload";
import { listDocuments, patchDocumentStatus, postDocument } from "../controllers/documentController";

export const documentRouter = Router();

documentRouter.use(authenticateToken);
documentRouter.get("/", asyncHandler(listDocuments));
documentRouter.post("/", upload.single("file"), asyncHandler(postDocument));
documentRouter.patch("/:id/status", authorizeRoles("ADMIN", "MANAGER"), validateBody(documentStatusSchema), asyncHandler(patchDocumentStatus));
