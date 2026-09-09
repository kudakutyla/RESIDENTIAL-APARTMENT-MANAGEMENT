import { query } from "../db/client";
import { HttpError } from "../utils/httpError";
import { createUser, findUserByEmail } from "../repositories/userRepository";
import { hashPassword } from "../utils/password";
import { logAuditEvent } from "../utils/audit";
import { sanitizeUser } from "./authService";

export async function listContractors() {
  const { rows } = await query(
    `SELECT c.*, u.full_name, u.email FROM contractors c JOIN users u ON u.id = c.user_id ORDER BY u.full_name`,
  );
  return rows;
}

export async function registerContractor(input: {
  actorUserId: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new HttpError(409, "Email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    passwordHash,
    role: "CONTRACTOR",
  });

  const { rows } = await query(
    `INSERT INTO contractors (user_id, phone) VALUES ($1,$2) RETURNING *`,
    [user.id, input.phone],
  );

  await logAuditEvent({
    actorUserId: input.actorUserId,
    action: "CONTRACTOR_REGISTERED",
    entityType: "USER",
    entityId: user.id,
  });

  return { user: sanitizeUser(user), contractor: rows[0] };
}

export async function getContractorByUser(userId: string) {
  const { rows } = await query(`SELECT * FROM contractors WHERE user_id = $1`, [userId]);
  if (!rows.length) throw new HttpError(404, "Contractor profile not found");
  return rows[0];
}

