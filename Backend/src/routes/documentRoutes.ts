import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticateToken } from "../middleware/authenticate";
import { upload } from "../utils/upload";
import { listDocuments, postDocument } from "../controllers/documentController";

export const documentRouter = Router();

documentRouter.use(authenticateToken);
documentRouter.get("/", asyncHandler(listDocuments));
documentRouter.post("/", upload.single("file"), asyncHandler(postDocument));
