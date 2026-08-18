import fs from "fs";
import path from "path";
import multer from "multer";
import { env } from "../config/env";
import { HttpError } from "./httpError";

const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    cb(null, safeName);
  },
});

const allowedMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new HttpError(400, "Unsupported file type"));
    }
    cb(null, true);
  },
});
