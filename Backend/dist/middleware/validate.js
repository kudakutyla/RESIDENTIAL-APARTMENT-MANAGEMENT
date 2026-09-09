"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const httpError_1 = require("../utils/httpError");
function validateBody(schema) {
    return (req, _res, next) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            return next(new httpError_1.HttpError(400, "Validation failed", parsed.error.flatten()));
        }
        req.body = parsed.data;
        return next();
    };
}
