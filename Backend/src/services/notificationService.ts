import { query } from "../db/client";
import { HttpError } from "../utils/httpError";

export async function listNotifications(userId: string) {
  const { rows } = await query(`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
  return rows;
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const { rows } = await query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
    [notificationId, userId],
  );
  if (!rows.length) throw new HttpError(404, "Notification not found");
  return rows[0];
}
