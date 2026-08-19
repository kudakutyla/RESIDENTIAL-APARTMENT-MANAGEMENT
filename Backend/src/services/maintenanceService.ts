import { query } from "../db/client";
import { HttpError } from "../utils/httpError";
import { logAuditEvent } from "../utils/audit";

export async function createMaintenanceRequest(input: {
  userId: string;
  apartmentId: string;
  title: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
}) {
  const apartment = await query<{ building_id: string; tenant_id: string }>(
    `SELECT building_id, tenant_id FROM apartments WHERE id = $1`,
    [input.apartmentId],
  );
  if (!apartment.rows.length) throw new HttpError(404, "Apartment not found");
  if (apartment.rows[0].tenant_id !== input.userId) throw new HttpError(403, "Forbidden");

  const { rows } = await query<{ id: string }>(
    `INSERT INTO maintenance_requests
     (tenant_id, building_id, apartment_id, title, description, category, priority, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'Submitted') RETURNING *`,
    [
      input.userId,
      apartment.rows[0].building_id,
      input.apartmentId,
      input.title,
      input.description,
      input.category,
      input.priority,
    ],
  );

  await query(
    `INSERT INTO maintenance_updates (maintenance_request_id, user_id, message, status)
     VALUES ($1,$2,$3,$4)`,
    [rows[0].id, input.userId, "Maintenance request submitted.", "Submitted"],
  );

  await logAuditEvent({ actorUserId: input.userId, action: "MAINTENANCE_CREATED", entityType: "MAINTENANCE_REQUEST", entityId: rows[0].id });
  return rows[0];
}

export async function listMaintenanceForUser(user: { id: string; role: string }) {
  if (user.role === "ADMIN") {
    const { rows } = await query(`SELECT * FROM maintenance_requests ORDER BY created_at DESC`);
    return rows;
  }
  if (user.role === "TENANT") {
    const { rows } = await query(`SELECT * FROM maintenance_requests WHERE tenant_id = $1 ORDER BY created_at DESC`, [user.id]);
    return rows;
  }
  if (user.role === "MANAGER") {
    const { rows } = await query(
      `SELECT mr.*
       FROM maintenance_requests mr
       JOIN buildings b ON b.id = mr.building_id
       WHERE b.manager_id = $1
       ORDER BY mr.created_at DESC`,
      [user.id],
    );
    return rows;
  }
  const contractor = await query<{ id: string }>(`SELECT id FROM contractors WHERE user_id = $1`, [user.id]);
  const { rows } = await query(
    `SELECT * FROM maintenance_requests WHERE assigned_contractor_id = $1 ORDER BY created_at DESC`,
    [contractor.rows[0]?.id || ""],
  );
  return rows;
}

export async function getMaintenanceById(user: { id: string; role: string }, requestId: string) {
  const { rows } = await query(`SELECT * FROM maintenance_requests WHERE id = $1`, [requestId]);
  if (!rows.length) throw new HttpError(404, "Maintenance request not found");
  const item = rows[0] as any;

  if (user.role === "TENANT" && item.tenant_id !== user.id) {
    throw new HttpError(403, "Forbidden");
  }

  if (user.role === "MANAGER") {
    const access = await query(
      `SELECT 1 FROM buildings WHERE id = $1 AND manager_id = $2`,
      [item.building_id, user.id],
    );
    if (!access.rows.length) throw new HttpError(403, "Forbidden");
  }

  if (user.role === "CONTRACTOR") {
    const contractor = await query<{ id: string }>(`SELECT id FROM contractors WHERE user_id = $1`, [user.id]);
    if (!contractor.rows.length || item.assigned_contractor_id !== contractor.rows[0].id) {
      throw new HttpError(403, "Forbidden");
    }
  }

  const updates = await query(
    `SELECT mu.*, u.full_name FROM maintenance_updates mu JOIN users u ON u.id = mu.user_id WHERE maintenance_request_id = $1 ORDER BY mu.created_at ASC`,
    [requestId],
  );

  return { ...item, updates: updates.rows };
}

export async function assignContractor(input: {
  actorUser: { id: string; role: string };
  requestId: string;
  contractorId: string;
}) {
  if (!["ADMIN", "MANAGER"].includes(input.actorUser.role)) throw new HttpError(403, "Forbidden");

  if (input.actorUser.role === "MANAGER") {
    const access = await query(
      `SELECT 1
       FROM maintenance_requests mr
       JOIN buildings b ON b.id = mr.building_id
       WHERE mr.id = $1 AND b.manager_id = $2`,
      [input.requestId, input.actorUser.id],
    );
    if (!access.rows.length) throw new HttpError(403, "Forbidden");
  }

  const { rows } = await query(
    `UPDATE maintenance_requests SET assigned_contractor_id = $2, status = 'Assigned', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [input.requestId, input.contractorId],
  );
  if (!rows.length) throw new HttpError(404, "Maintenance request not found");

  await query(
    `INSERT INTO maintenance_updates (maintenance_request_id, user_id, message, status)
     VALUES ($1,$2,$3,$4)`,
    [input.requestId, input.actorUser.id, "Contractor assigned.", "Assigned"],
  );

  await logAuditEvent({ actorUserId: input.actorUser.id, action: "CONTRACTOR_ASSIGNED", entityType: "MAINTENANCE_REQUEST", entityId: input.requestId });
  return rows[0];
}

export async function addMaintenanceUpdate(input: {
  actorUser: { id: string; role: string };
  requestId: string;
  message: string;
  status?: "Submitted" | "Under Review" | "Assigned" | "In Progress" | "Completed" | "Cancelled";
}) {
  const details = await getMaintenanceById(input.actorUser, input.requestId);

  const status = input.status ?? details.status;
  const resolvedAt = status === "Completed" ? new Date() : null;

  const { rows } = await query(
    `UPDATE maintenance_requests
     SET status = $2, updated_at = NOW(), resolved_at = COALESCE($3, resolved_at)
     WHERE id = $1 RETURNING *`,
    [input.requestId, status, resolvedAt],
  );

  await query(
    `INSERT INTO maintenance_updates (maintenance_request_id, user_id, message, status) VALUES ($1,$2,$3,$4)`,
    [input.requestId, input.actorUser.id, input.message, status],
  );

  await logAuditEvent({ actorUserId: input.actorUser.id, action: "MAINTENANCE_UPDATED", entityType: "MAINTENANCE_REQUEST", entityId: input.requestId, details: { status } });
  return rows[0];
}
