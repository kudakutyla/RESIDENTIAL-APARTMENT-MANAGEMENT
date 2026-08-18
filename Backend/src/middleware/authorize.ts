import type { NextFunction, Request, Response } from "express";
import type { Role } from "../types/auth";
import { HttpError } from "../utils/httpError";

export function authorizeRoles(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, "Unauthorized"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "Forbidden"));
    }
    return next();
  };
}
