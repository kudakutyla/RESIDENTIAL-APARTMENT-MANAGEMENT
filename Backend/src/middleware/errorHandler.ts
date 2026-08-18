import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message, details: error.details ?? null });
  }

  console.error(error);
  if (!env.isProduction) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      details: error.stack ?? null,
    });
  }

  return res.status(500).json({ message: "Internal server error" });
}
