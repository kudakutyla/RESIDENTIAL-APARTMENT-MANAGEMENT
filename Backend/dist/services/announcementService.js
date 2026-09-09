"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnnouncement = createAnnouncement;
exports.listAnnouncementsForUser = listAnnouncementsForUser;
const client_1 = require("../db/client");
async function createAnnouncement(input) {
    const { rows } = await (0, client_1.query)(`INSERT INTO announcements (title, message, audience_type, audience_building_id, audience_tenant_id, created_by)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [
        input.title,
        input.message,
        input.audienceType,
        input.audienceBuildingId ?? null,
        input.audienceTenantId ?? null,
        input.createdBy,
    ]);
    return rows[0];
}
async function listAnnouncementsForUser(user) {
    if (user.role === "ADMIN" || user.role === "MANAGER") {
        const { rows } = await (0, client_1.query)(`SELECT * FROM announcements ORDER BY created_at DESC`);
        return rows;
    }
    const { rows } = await (0, client_1.query)(`SELECT an.*
     FROM announcements an
     LEFT JOIN apartments a ON a.tenant_id = $1
     WHERE an.audience_type = 'All Tenants'
        OR an.audience_tenant_id = $1
        OR (an.audience_type = 'Specific Building' AND an.audience_building_id = a.building_id)
     ORDER BY an.created_at DESC`, [user.id]);
    return rows;
}
