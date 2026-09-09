"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = authorizeRoles;
const httpError_1 = require("../utils/httpError");
function authorizeRoles(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new httpError_1.HttpError(401, "Unauthorized"));
        }
        if (!roles.includes(req.user.role)) {
            return next(new httpError_1.HttpError(403, "Forbidden"));
        }
        return next();
    };
}
