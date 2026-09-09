"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecurityReport = createSecurityReport;
exports.listSecurityReports = listSecurityReports;
exports.updateSecurityReportStatus = updateSecurityReportStatus;
const client_1 = require("../db/client");
const httpError_1 = require("../utils/httpError");
async function createSecurityReport(input) {
    const apt = await (0, client_1.query)(`SELECT id, building_id FROM apartments WHERE tenant_id = $1 LIMIT 1`, [input.userId]);
    if (!apt.rows.length)
        throw new httpError_1.HttpError(400, "Tenant is not assigned to an apartment");
    const { rows } = await (0, client_1.query)(`INSERT INTO security_reports
     (tenant_id, building_id, apartment_id, title, description, location, priority)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`, [input.userId, apt.rows[0].building_id, apt.rows[0].id, input.title, input.description, input.location, input.priority]);
    return rows[0];
}
async function listSecurityReports(user) {
    if (user.role === "ADMIN") {
        const { rows } = await (0, client_1.query)(`SELECT * FROM security_reports ORDER BY created_at DESC`);
        return rows;
    }
    if (user.role === "MANAGER") {
        const { rows } = await (0, client_1.query)(`SELECT sr.* FROM security_reports sr
       JOIN buildings b ON b.id = sr.building_id
       WHERE b.manager_id = $1
       ORDER BY sr.created_at DESC`, [user.id]);
        return rows;
    }
    const { rows } = await (0, client_1.query)(`SELECT * FROM security_reports WHERE tenant_id = $1 ORDER BY created_at DESC`, [user.id]);
    return rows;
}
async function updateSecurityReportStatus(input) {
    const { rows } = await (0, client_1.query)(`UPDATE security_reports SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`, [input.id, input.status]);
    if (!rows.length)
        throw new httpError_1.HttpError(404, "Security report not found");
    return rows[0];
}
