import type { NextFunction, Request, Response } from "express";
import { query } from "../db/client";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";
import { verifyAccessToken } from "../utils/jwt";

export async function authenticateToken(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.COOKIE_NAME] || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return next(new HttpError(401, "Unauthorized"));
  }

  try {
    const payload = verifyAccessToken(token);
    const { rows } = await query<{
      id: string;
      full_name: string;
      email: string;
      role: "TENANT" | "MANAGER" | "CONTRACTOR" | "ADMIN";
      status: "ACTIVE" | "DISABLED";
    }>(
      "SELECT id, full_name, email, role, status FROM users WHERE id = $1",
      [payload.userId],
    );

    if (!rows.length || rows[0].status !== "ACTIVE") {
      return next(new HttpError(401, "Unauthorized"));
    }

    req.user = {
      id: rows[0].id,
      email: rows[0].email,
      role: rows[0].role,
      fullName: rows[0].full_name,
      status: rows[0].status,
    };

    return next();
  } catch {
    return next(new HttpError(401, "Unauthorized"));
  }
}
