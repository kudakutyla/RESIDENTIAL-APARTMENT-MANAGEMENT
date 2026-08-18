import { query } from "../db/client";
import { HttpError } from "../utils/httpError";

export async function listContractors() {
  const { rows } = await query(
    `SELECT c.*, u.full_name, u.email FROM contractors c JOIN users u ON u.id = c.user_id ORDER BY u.full_name`,
  );
  return rows;
}

export async function createContractor(input: {
  userId: string;
  companyName: string;
  phone: string;
  specialization: string;
}) {
  const { rows } = await query(
    `INSERT INTO contractors (user_id, company_name, phone, specialization)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [input.userId, input.companyName, input.phone, input.specialization],
  );
  return rows[0];
}

export async function getContractorByUser(userId: string) {
  const { rows } = await query(`SELECT * FROM contractors WHERE user_id = $1`, [userId]);
  if (!rows.length) throw new HttpError(404, "Contractor profile not found");
  return rows[0];
}
