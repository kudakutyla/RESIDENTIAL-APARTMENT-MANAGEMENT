"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBuildingsForUser = listBuildingsForUser;
exports.createBuilding = createBuilding;
exports.updateBuilding = updateBuilding;
exports.deactivateBuilding = deactivateBuilding;
const client_1 = require("../db/client");
const httpError_1 = require("../utils/httpError");
const audit_1 = require("../utils/audit");
async function listBuildingsForUser(user) {
    if (user.role === "ADMIN") {
        const { rows } = await (0, client_1.query)(`SELECT * FROM buildings ORDER BY name`);
        return rows;
    }
    if (user.role === "MANAGER") {
        const { rows } = await (0, client_1.query)(`SELECT * FROM buildings WHERE manager_id = $1 ORDER BY name`, [user.id]);
        return rows;
    }
    const { rows } = await (0, client_1.query)(`SELECT b.* FROM buildings b
     JOIN apartments a ON a.building_id = b.id
     WHERE a.tenant_id = $1
     ORDER BY b.name`, [user.id]);
    return rows;
}
async function createBuilding(input) {
    const { rows } = await (0, client_1.query)(`INSERT INTO buildings (name, address, description, manager_id)
     VALUES ($1,$2,$3,$4) RETURNING *`, [input.name, input.address, input.description ?? null, input.managerId ?? null]);
    await (0, audit_1.logAuditEvent)({ actorUserId: input.actorUserId, action: "BUILDING_CREATED", entityType: "BUILDING", entityId: rows[0].id });
    return rows[0];
}
async function updateBuilding(input) {
    const { rows } = await (0, client_1.query)(`UPDATE buildings
     SET name = $2, address = $3, description = $4, manager_id = $5, updated_at = NOW()
     WHERE id = $1
     RETURNING *`, [input.id, input.name, input.address, input.description ?? null, input.managerId ?? null]);
    if (!rows.length)
        throw new httpError_1.HttpError(404, "Building not found");
    await (0, audit_1.logAuditEvent)({ actorUserId: input.actorUserId, action: "BUILDING_UPDATED", entityType: "BUILDING", entityId: input.id });
    return rows[0];
}
async function deactivateBuilding(actorUserId, id) {
    const { rows } = await (0, client_1.query)(`UPDATE buildings SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *`, [id]);
    if (!rows.length)
        throw new httpError_1.HttpError(404, "Building not found");
    await (0, audit_1.logAuditEvent)({ actorUserId, action: "BUILDING_DEACTIVATED", entityType: "BUILDING", entityId: id });
    return rows[0];
}
