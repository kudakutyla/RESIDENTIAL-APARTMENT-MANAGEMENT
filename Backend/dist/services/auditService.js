"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditLogs = listAuditLogs;
const client_1 = require("../db/client");
async function listAuditLogs() {
    const { rows } = await (0, client_1.query)(`SELECT a.*, u.full_name as actor_name
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.actor_user_id
     ORDER BY a.created_at DESC
     LIMIT 500`);
    return rows;
}
