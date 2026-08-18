import { Pool } from "pg";
import { env } from "../config/env";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.isProduction ? { rejectUnauthorized: false } : false,
});

export async function query<T>(text: string, params: unknown[] = []) {
  return pool.query<T>(text, params);
}
