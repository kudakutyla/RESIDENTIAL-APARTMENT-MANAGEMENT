import { query } from "../db/client";
import { HttpError } from "../utils/httpError";
import { logAuditEvent } from "../utils/audit";

export async function listPaymentsForUser(user: { id: string; role: string }) {
  if (user.role === "ADMIN" || user.role === "MANAGER") {
    const sql = user.role === "ADMIN"
      ? `SELECT p.*, u.full_name as tenant_name FROM payments p JOIN users u ON u.id = p.tenant_id ORDER BY p.created_at DESC`
      : `SELECT p.*, u.full_name as tenant_name
         FROM payments p
         JOIN users u ON u.id = p.tenant_id
         JOIN apartments a ON a.id = p.apartment_id
         JOIN buildings b ON b.id = a.building_id
         WHERE b.manager_id = $1
         ORDER BY p.created_at DESC`;
    const result = await query(sql, user.role === "MANAGER" ? [user.id] : []);
    return result.rows;
  }

  const { rows } = await query(`SELECT * FROM payments WHERE tenant_id = $1 ORDER BY created_at DESC`, [user.id]);
  return rows;
}

export async function uploadPaymentProof(input: {
  user: { id: string; role: string };
  paymentId: string;
  filePath: string;
  fileName: string;
}) {
  const payment = await query<{ tenant_id: string }>(`SELECT tenant_id FROM payments WHERE id = $1`, [input.paymentId]);
  if (!payment.rows.length) throw new HttpError(404, "Payment not found");
  if (input.user.role === "TENANT" && payment.rows[0].tenant_id !== input.user.id) throw new HttpError(403, "Forbidden");

  const { rows } = await query(
    `UPDATE payments
     SET proof_file_path = $2, proof_file_name = $3, status = 'Pending', updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [input.paymentId, input.filePath, input.fileName],
  );

  return rows[0];
}

export async function verifyPayment(input: {
  actorUserId: string;
  paymentId: string;
  status: "Verified" | "Rejected";
}) {
  const { rows } = await query(
    `UPDATE payments
     SET status = $2, verified_by = $3, verified_at = NOW(), updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [input.paymentId, input.status, input.actorUserId],
  );
  if (!rows.length) throw new HttpError(404, "Payment not found");

  await logAuditEvent({
    actorUserId: input.actorUserId,
    action: "PAYMENT_VERIFIED",
    entityType: "PAYMENT",
    entityId: input.paymentId,
    details: { status: input.status },
  });

  return rows[0];
}
