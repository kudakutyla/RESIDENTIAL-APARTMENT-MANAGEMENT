import { query } from "../db/client";

export async function logAuditEvent(input: {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: unknown;
}) {
  await query(
    `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details)
     VALUES ($1,$2,$3,$4,$5)`,
    [
      input.actorUserId || null,
      input.action,
      input.entityType,
      input.entityId || null,
      input.details ? JSON.stringify(input.details) : null,
    ],
  );
}
