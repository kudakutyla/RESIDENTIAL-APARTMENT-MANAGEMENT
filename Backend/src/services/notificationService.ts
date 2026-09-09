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

export async function sendNotification(input: {
  actorUser: { id: string; role: string };
  userId: string;
  title: string;
  message: string;
}) {
  const recipient = await query<{ role: string }>(`SELECT role FROM users WHERE id = $1`, [input.userId]);
  if (!recipient.rows.length) throw new HttpError(404, "Recipient not found");
  const recipientRole = recipient.rows[0].role;
  if (recipientRole !== "TENANT" && recipientRole !== "CONTRACTOR") {
    throw new HttpError(400, "Notifications can only be sent to tenants or contractors");
  }

  if (input.actorUser.role === "MANAGER" && recipientRole === "TENANT") {
    const access = await query(
      `SELECT 1 FROM apartments a JOIN buildings b ON b.id = a.building_id
       WHERE a.tenant_id = $1 AND b.manager_id = $2`,
      [input.userId, input.actorUser.id],
    );
    if (!access.rows.length) throw new HttpError(403, "Forbidden");
  }

  const { rows } = await query(
    `INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,'MANAGER_MESSAGE') RETURNING *`,
    [input.userId, input.title, input.message],
  );
  return rows[0];
}
