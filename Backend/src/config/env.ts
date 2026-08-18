import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("4000"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  COOKIE_NAME: z.string().default("homenest_token"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_UPLOAD_MB: z.string().default("8"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment: ${parsed.error.message}`);
}

export const env = {
  ...parsed.data,
  PORT: Number(parsed.data.PORT),
  MAX_UPLOAD_MB: Number(parsed.data.MAX_UPLOAD_MB),
  isProduction: parsed.data.NODE_ENV === "production",
};
