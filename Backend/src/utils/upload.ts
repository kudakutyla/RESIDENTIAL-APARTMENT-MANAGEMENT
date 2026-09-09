import fs from "fs";
import os from "os";
import path from "path";
import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { env } from "../config/env";
import { HttpError } from "./httpError";

const isServerlessRuntime = env.isProduction || process.env.VERCEL === "1";
const uploadRoot = isServerlessRuntime
  ? path.join(os.tmpdir(), "homenest-uploads")
  : path.resolve(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) =>
    cb(null, uploadRoot),
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
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
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new HttpError(400, "Unsupported file type"));
    }
    cb(null, true);
  },
});
