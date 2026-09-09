"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = updateProfile;
const client_1 = require("../db/client");
const httpError_1 = require("../utils/httpError");
async function updateProfile(input) {
    const { rows } = await (0, client_1.query)(`UPDATE users SET full_name = $2, phone = $3, updated_at = NOW() WHERE id = $1
     RETURNING id, full_name, email, phone, role, status, created_at, updated_at`, [input.userId, input.fullName, input.phone]);
    if (!rows.length)
        throw new httpError_1.HttpError(404, "User not found");
    return rows[0];
}
