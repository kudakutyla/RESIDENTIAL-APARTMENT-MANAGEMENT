"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotifications = listNotifications;
exports.markNotificationRead = markNotificationRead;
const client_1 = require("../db/client");
const httpError_1 = require("../utils/httpError");
async function listNotifications(userId) {
    const { rows } = await (0, client_1.query)(`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
    return rows;
}
async function markNotificationRead(userId, notificationId) {
    const { rows } = await (0, client_1.query)(`UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`, [notificationId, userId]);
    if (!rows.length)
        throw new httpError_1.HttpError(404, "Notification not found");
    return rows[0];
}
