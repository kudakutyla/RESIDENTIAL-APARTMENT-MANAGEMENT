"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listApartmentsForUser = listApartmentsForUser;
exports.createApartment = createApartment;
exports.updateApartment = updateApartment;
const client_1 = require("../db/client");
const httpError_1 = require("../utils/httpError");
const audit_1 = require("../utils/audit");
async function listApartmentsForUser(user) {
    if (user.role === "ADMIN") {
        const { rows } = await (0, client_1.query)(`SELECT a.*, b.name as building_name FROM apartments a JOIN buildings b ON b.id = a.building_id ORDER BY b.name, apartment_number`);
        return rows;
    }
    if (user.role === "MANAGER") {
        const { rows } = await (0, client_1.query)(`SELECT a.*, b.name as building_name FROM apartments a JOIN buildings b ON b.id = a.building_id
       WHERE b.manager_id = $1 ORDER BY b.name, apartment_number`, [user.id]);
        return rows;
    }
    const { rows } = await (0, client_1.query)(`SELECT a.*, b.name as building_name FROM apartments a JOIN buildings b ON b.id = a.building_id WHERE tenant_id = $1`, [user.id]);
    return rows;
}
async function createApartment(input) {
    const { rows } = await (0, client_1.query)(`INSERT INTO apartments (building_id, apartment_number, floor, bedrooms, monthly_rent, status, tenant_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [input.buildingId, input.apartmentNumber, input.floor, input.bedrooms, input.monthlyRent, input.status, input.tenantId ?? null]);
    await (0, audit_1.logAuditEvent)({ actorUserId: input.actorUserId, action: "APARTMENT_CREATED", entityType: "APARTMENT", entityId: rows[0].id });
    return rows[0];
}
async function updateApartment(input) {
    const { rows } = await (0, client_1.query)(`UPDATE apartments
     SET apartment_number = $2, floor = $3, bedrooms = $4, monthly_rent = $5, status = $6, tenant_id = $7, updated_at = NOW()
     WHERE id = $1 RETURNING *`, [input.id, input.apartmentNumber, input.floor, input.bedrooms, input.monthlyRent, input.status, input.tenantId ?? null]);
    if (!rows.length)
        throw new httpError_1.HttpError(404, "Apartment not found");
    await (0, audit_1.logAuditEvent)({ actorUserId: input.actorUserId, action: "APARTMENT_UPDATED", entityType: "APARTMENT", entityId: input.id });
    return rows[0];
}
