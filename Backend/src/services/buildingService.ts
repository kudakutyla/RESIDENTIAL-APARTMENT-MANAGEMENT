import { query } from "../db/client";
import { HttpError } from "../utils/httpError";
import { logAuditEvent } from "../utils/audit";

export async function listBuildingsForUser(user: { id: string; role: string }) {
  if (user.role === "ADMIN") {
    const { rows } = await query(`SELECT * FROM buildings ORDER BY name`);
    return rows;
  }
  if (user.role === "MANAGER") {
    const { rows } = await query(`SELECT * FROM buildings WHERE manager_id = $1 ORDER BY name`, [user.id]);
    return rows;
  }
  const { rows } = await query<{ id: string }>(
    `SELECT b.* FROM buildings b
     JOIN apartments a ON a.building_id = b.id
     WHERE a.tenant_id = $1
     ORDER BY b.name`,
    [user.id],
  );
  return rows;
}

export async function createBuilding(input: {
  actorUserId: string;
  name: string;
  address: string;
  description?: string;
  managerId?: string;
}) {
  const { rows } = await query(
    `INSERT INTO buildings (name, address, description, manager_id)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [input.name, input.address, input.description ?? null, input.managerId ?? null],
  );
  await logAuditEvent({ actorUserId: input.actorUserId, action: "BUILDING_CREATED", entityType: "BUILDING", entityId: rows[0].id });
  return rows[0];
}

export async function updateBuilding(input: {
  actorUserId: string;
  id: string;
  name: string;
  address: string;
  description?: string;
  managerId?: string;
}) {
  const { rows } = await query(
    `UPDATE buildings
     SET name = $2, address = $3, description = $4, manager_id = $5, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [input.id, input.name, input.address, input.description ?? null, input.managerId ?? null],
  );
  if (!rows.length) throw new HttpError(404, "Building not found");
  await logAuditEvent({ actorUserId: input.actorUserId, action: "BUILDING_UPDATED", entityType: "BUILDING", entityId: input.id });
  return rows[0];
}

export async function deactivateBuilding(actorUserId: string, id: string) {
  const { rows } = await query(`UPDATE buildings SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *`, [id]);
  if (!rows.length) throw new HttpError(404, "Building not found");
  await logAuditEvent({ actorUserId, action: "BUILDING_DEACTIVATED", entityType: "BUILDING", entityId: id });
  return rows[0];
}
