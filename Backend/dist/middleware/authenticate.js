"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const client_1 = require("../db/client");
const env_1 = require("../config/env");
const httpError_1 = require("../utils/httpError");
const jwt_1 = require("../utils/jwt");
async function authenticateToken(req, _res, next) {
    const token = req.cookies?.[env_1.env.COOKIE_NAME] || req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
        return next(new httpError_1.HttpError(401, "Unauthorized"));
    }
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const { rows } = await (0, client_1.query)("SELECT id, full_name, email, role, status FROM users WHERE id = $1", [payload.userId]);
        if (!rows.length || rows[0].status !== "ACTIVE") {
            return next(new httpError_1.HttpError(401, "Unauthorized"));
        }
        req.user = {
            id: rows[0].id,
            email: rows[0].email,
            role: rows[0].role,
            fullName: rows[0].full_name,
            status: rows[0].status,
        };
        return next();
    }
    catch {
        return next(new httpError_1.HttpError(401, "Unauthorized"));
    }
}
