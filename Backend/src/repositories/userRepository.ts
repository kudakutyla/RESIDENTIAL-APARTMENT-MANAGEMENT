import { query } from "../db/client";
import type { Role } from "../types/auth";

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: Role;
  status: "ACTIVE" | "DISABLED";
  created_at: string;
  updated_at: string;
}

export async function findUserByEmail(email: string) {
  const result = await query<UserRow>("SELECT * FROM users WHERE lower(email) = lower($1)", [email]);
  return result.rows[0] ?? null;
}

export async function findUserById(id: string) {
  const result = await query<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}

export async function createUser(input: {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
}) {
  const result = await query<UserRow>(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [input.fullName, input.email, input.phone, input.passwordHash, input.role],
  );
  return result.rows[0];
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  await query(`UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`, [userId, passwordHash]);
}

export async function listUsers(filters: { role?: Role; q?: string }) {
  const values: unknown[] = [];
  const where: string[] = [];

  if (filters.role) {
    values.push(filters.role);
    where.push(`role = $${values.length}`);
  }
  if (filters.q) {
    values.push(`%${filters.q.toLowerCase()}%`);
    where.push(`(lower(full_name) LIKE $${values.length} OR lower(email) LIKE $${values.length})`);
  }

  const sql = `SELECT id, full_name, email, phone, role, status, created_at, updated_at FROM users
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY created_at DESC`;

  const result = await query(sql, values);
  return result.rows;
}

export async function setUserStatus(userId: string, status: "ACTIVE" | "DISABLED") {
  const result = await query(
    `UPDATE users SET status = $2, updated_at = NOW() WHERE id = $1
     RETURNING id, full_name, email, phone, role, status, created_at, updated_at`,
    [userId, status],
  );
  return result.rows[0] ?? null;
}
