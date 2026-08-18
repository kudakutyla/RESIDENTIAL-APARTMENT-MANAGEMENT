import { query } from "../db/client";

export async function createAnnouncement(input: {
  createdBy: string;
  title: string;
  message: string;
  audienceType: "All Tenants" | "Specific Building" | "Specific Tenant";
  audienceBuildingId?: string;
  audienceTenantId?: string;
}) {
  const { rows } = await query(
    `INSERT INTO announcements (title, message, audience_type, audience_building_id, audience_tenant_id, created_by)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [
      input.title,
      input.message,
      input.audienceType,
      input.audienceBuildingId ?? null,
      input.audienceTenantId ?? null,
      input.createdBy,
    ],
  );
  return rows[0];
}

export async function listAnnouncementsForUser(user: { id: string; role: string }) {
  if (user.role === "ADMIN" || user.role === "MANAGER") {
    const { rows } = await query(`SELECT * FROM announcements ORDER BY created_at DESC`);
    return rows;
  }

  const { rows } = await query(
    `SELECT an.*
     FROM announcements an
     LEFT JOIN apartments a ON a.tenant_id = $1
     WHERE an.audience_type = 'All Tenants'
        OR an.audience_tenant_id = $1
        OR (an.audience_type = 'Specific Building' AND an.audience_building_id = a.building_id)
     ORDER BY an.created_at DESC`,
    [user.id],
  );
  return rows;
}
