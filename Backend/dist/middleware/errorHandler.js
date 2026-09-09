"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const env_1 = require("../config/env");
const httpError_1 = require("../utils/httpError");
function notFoundHandler(_req, res) {
    res.status(404).json({ message: "Route not found" });
}
function errorHandler(error, _req, res, _next) {
    if (error instanceof httpError_1.HttpError) {
        return res.status(error.statusCode).json({ message: error.message, details: error.details ?? null });
    }
    console.error(error);
    if (!env_1.env.isProduction) {
        return res.status(500).json({
            message: error.message || "Internal server error",
            details: error.stack ?? null,
        });
    }
    return res.status(500).json({ message: "Internal server error" });
}
