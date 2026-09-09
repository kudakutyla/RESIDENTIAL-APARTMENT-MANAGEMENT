"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.string().default("4000"),
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.string().default("7d"),
    COOKIE_NAME: zod_1.z.string().default("homenest_token"),
    FRONTEND_URL: zod_1.z.string().default("http://localhost:3000"),
    UPLOAD_DIR: zod_1.z.string().default("uploads"),
    MAX_UPLOAD_MB: zod_1.z.string().default("8"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
}
exports.env = {
    ...parsed.data,
    PORT: Number(parsed.data.PORT),
    MAX_UPLOAD_MB: Number(parsed.data.MAX_UPLOAD_MB),
    isProduction: parsed.data.NODE_ENV === "production",
    FRONTEND_URLS: parsed.data.FRONTEND_URL.split(",")
        .map((url) => url.trim().replace(/\/$/, ""))
        .filter(Boolean),
};
