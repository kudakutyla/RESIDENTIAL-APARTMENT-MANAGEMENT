import { query } from "../db/client";
import { HttpError } from "../utils/httpError";

export async function updateProfile(input: { userId: string; fullName: string; phone: string }) {
  const { rows } = await query(
    `UPDATE users SET full_name = $2, phone = $3, updated_at = NOW() WHERE id = $1
     RETURNING id, full_name, email, phone, role, status, created_at, updated_at`,
    [input.userId, input.fullName, input.phone],
  );
  if (!rows.length) throw new HttpError(404, "User not found");
  return rows[0];
}
