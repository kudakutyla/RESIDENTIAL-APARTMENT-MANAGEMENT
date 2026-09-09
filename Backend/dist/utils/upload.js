"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const env_1 = require("../config/env");
const httpError_1 = require("./httpError");
const isServerlessRuntime = env_1.env.isProduction || process.env.VERCEL === "1";
const uploadRoot = isServerlessRuntime
    ? path_1.default.join(os_1.default.tmpdir(), "homenest-uploads")
    : path_1.default.resolve(process.cwd(), env_1.env.UPLOAD_DIR);
if (!fs_1.default.existsSync(uploadRoot)) {
    fs_1.default.mkdirSync(uploadRoot, { recursive: true });
}
const storage = multer_1.default.diskStorage({
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
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: env_1.env.MAX_UPLOAD_MB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return cb(new httpError_1.HttpError(400, "Unsupported file type"));
        }
        cb(null, true);
    },
});
