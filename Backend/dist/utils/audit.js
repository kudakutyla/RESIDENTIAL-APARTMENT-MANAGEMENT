"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditEvent = logAuditEvent;
const client_1 = require("../db/client");
async function logAuditEvent(input) {
    await (0, client_1.query)(`INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details)
     VALUES ($1,$2,$3,$4,$5)`, [
        input.actorUserId || null,
        input.action,
        input.entityType,
        input.entityId || null,
        input.details ? JSON.stringify(input.details) : null,
    ]);
}
