"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMaintenanceRequest = createMaintenanceRequest;
exports.listMaintenanceForUser = listMaintenanceForUser;
exports.getMaintenanceById = getMaintenanceById;
exports.assignContractor = assignContractor;
exports.addMaintenanceUpdate = addMaintenanceUpdate;
const client_1 = require("../db/client");
const httpError_1 = require("../utils/httpError");
const audit_1 = require("../utils/audit");
async function createMaintenanceRequest(input) {
    const apartment = await (0, client_1.query)(`SELECT building_id, tenant_id FROM apartments WHERE id = $1`, [input.apartmentId]);
    if (!apartment.rows.length)
        throw new httpError_1.HttpError(404, "Apartment not found");
    if (apartment.rows[0].tenant_id !== input.userId)
        throw new httpError_1.HttpError(403, "Forbidden");
    const { rows } = await (0, client_1.query)(`INSERT INTO maintenance_requests
     (tenant_id, building_id, apartment_id, title, description, category, priority, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'Submitted') RETURNING *`, [
        input.userId,
        apartment.rows[0].building_id,
        input.apartmentId,
        input.title,
        input.description,
        input.category,
        input.priority,
    ]);
    await (0, client_1.query)(`INSERT INTO maintenance_updates (maintenance_request_id, user_id, message, status)
     VALUES ($1,$2,$3,$4)`, [rows[0].id, input.userId, "Maintenance request submitted.", "Submitted"]);
    await (0, audit_1.logAuditEvent)({ actorUserId: input.userId, action: "MAINTENANCE_CREATED", entityType: "MAINTENANCE_REQUEST", entityId: rows[0].id });
    return rows[0];
}
async function listMaintenanceForUser(user) {
    if (user.role === "ADMIN") {
        const { rows } = await (0, client_1.query)(`SELECT * FROM maintenance_requests ORDER BY created_at DESC`);
        return rows;
    }
    if (user.role === "TENANT") {
        const { rows } = await (0, client_1.query)(`SELECT * FROM maintenance_requests WHERE tenant_id = $1 ORDER BY created_at DESC`, [user.id]);
        return rows;
    }
    if (user.role === "MANAGER") {
        const { rows } = await (0, client_1.query)(`SELECT mr.*
       FROM maintenance_requests mr
       JOIN buildings b ON b.id = mr.building_id
       WHERE b.manager_id = $1
       ORDER BY mr.created_at DESC`, [user.id]);
        return rows;
    }
    const contractor = await (0, client_1.query)(`SELECT id FROM contractors WHERE user_id = $1`, [user.id]);
    const { rows } = await (0, client_1.query)(`SELECT * FROM maintenance_requests WHERE assigned_contractor_id = $1 ORDER BY created_at DESC`, [contractor.rows[0]?.id || ""]);
    return rows;
}
async function getMaintenanceById(user, requestId) {
    const { rows } = await (0, client_1.query)(`SELECT * FROM maintenance_requests WHERE id = $1`, [requestId]);
    if (!rows.length)
        throw new httpError_1.HttpError(404, "Maintenance request not found");
    const item = rows[0];
    if (user.role === "TENANT" && item.tenant_id !== user.id) {
        throw new httpError_1.HttpError(403, "Forbidden");
    }
    if (user.role === "MANAGER") {
        const access = await (0, client_1.query)(`SELECT 1 FROM buildings WHERE id = $1 AND manager_id = $2`, [item.building_id, user.id]);
        if (!access.rows.length)
            throw new httpError_1.HttpError(403, "Forbidden");
    }
    if (user.role === "CONTRACTOR") {
        const contractor = await (0, client_1.query)(`SELECT id FROM contractors WHERE user_id = $1`, [user.id]);
        if (!contractor.rows.length || item.assigned_contractor_id !== contractor.rows[0].id) {
            throw new httpError_1.HttpError(403, "Forbidden");
        }
    }
    const updates = await (0, client_1.query)(`SELECT mu.*, u.full_name FROM maintenance_updates mu JOIN users u ON u.id = mu.user_id WHERE maintenance_request_id = $1 ORDER BY mu.created_at ASC`, [requestId]);
    return { ...item, updates: updates.rows };
}
async function assignContractor(input) {
    if (!["ADMIN", "MANAGER"].includes(input.actorUser.role))
        throw new httpError_1.HttpError(403, "Forbidden");
    if (input.actorUser.role === "MANAGER") {
        const access = await (0, client_1.query)(`SELECT 1
       FROM maintenance_requests mr
       JOIN buildings b ON b.id = mr.building_id
       WHERE mr.id = $1 AND b.manager_id = $2`, [input.requestId, input.actorUser.id]);
        if (!access.rows.length)
            throw new httpError_1.HttpError(403, "Forbidden");
    }
    const { rows } = await (0, client_1.query)(`UPDATE maintenance_requests SET assigned_contractor_id = $2, status = 'Assigned', updated_at = NOW() WHERE id = $1 RETURNING *`, [input.requestId, input.contractorId]);
    if (!rows.length)
        throw new httpError_1.HttpError(404, "Maintenance request not found");
    await (0, client_1.query)(`INSERT INTO maintenance_updates (maintenance_request_id, user_id, message, status)
     VALUES ($1,$2,$3,$4)`, [input.requestId, input.actorUser.id, "Contractor assigned.", "Assigned"]);
    await (0, audit_1.logAuditEvent)({ actorUserId: input.actorUser.id, action: "CONTRACTOR_ASSIGNED", entityType: "MAINTENANCE_REQUEST", entityId: input.requestId });
    return rows[0];
}
async function addMaintenanceUpdate(input) {
    const details = await getMaintenanceById(input.actorUser, input.requestId);
    const status = input.status ?? details.status;
    const resolvedAt = status === "Completed" ? new Date() : null;
    const { rows } = await (0, client_1.query)(`UPDATE maintenance_requests
     SET status = $2, updated_at = NOW(), resolved_at = COALESCE($3, resolved_at)
     WHERE id = $1 RETURNING *`, [input.requestId, status, resolvedAt]);
    await (0, client_1.query)(`INSERT INTO maintenance_updates (maintenance_request_id, user_id, message, status) VALUES ($1,$2,$3,$4)`, [input.requestId, input.actorUser.id, input.message, status]);
    await (0, audit_1.logAuditEvent)({ actorUserId: input.actorUser.id, action: "MAINTENANCE_UPDATED", entityType: "MAINTENANCE_REQUEST", entityId: input.requestId, details: { status } });
    return rows[0];
}
