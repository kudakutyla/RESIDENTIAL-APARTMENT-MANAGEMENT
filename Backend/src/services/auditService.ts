import { query } from "../db/client";

export async function listAuditLogs() {
  const { rows } = await query(
    `SELECT a.*, u.full_name as actor_name
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.actor_user_id
     ORDER BY a.created_at DESC
     LIMIT 500`,
  );
  return rows;
}
