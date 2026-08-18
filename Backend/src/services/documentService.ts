import { query } from "../db/client";
import { HttpError } from "../utils/httpError";

export async function listDocumentsForUser(user: { id: string; role: string }) {
  if (user.role === "ADMIN" || user.role === "MANAGER") {
    const sql = user.role === "ADMIN"
      ? `SELECT d.*, u.full_name as tenant_name FROM documents d JOIN users u ON u.id = d.tenant_id ORDER BY d.created_at DESC`
      : `SELECT d.*, u.full_name as tenant_name
         FROM documents d
         JOIN users u ON u.id = d.tenant_id
         JOIN apartments a ON a.tenant_id = d.tenant_id
         JOIN buildings b ON b.id = a.building_id
         WHERE b.manager_id = $1
         ORDER BY d.created_at DESC`;
    const result = await query(sql, user.role === "MANAGER" ? [user.id] : []);
    return result.rows;
  }
  const { rows } = await query(`SELECT * FROM documents WHERE tenant_id = $1 ORDER BY created_at DESC`, [user.id]);
  return rows;
}

export async function uploadDocument(input: {
  user: { id: string; role: string };
  tenantId: string;
  documentName: string;
  documentType: string;
  filePath: string;
  fileName: string;
}) {
  if (input.user.role === "TENANT" && input.user.id !== input.tenantId) {
    throw new HttpError(403, "Forbidden");
  }

  const { rows } = await query(
    `INSERT INTO documents (tenant_id, uploaded_by, document_name, document_type, file_path, file_name)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [input.tenantId, input.user.id, input.documentName, input.documentType, input.filePath, input.fileName],
  );

  return rows[0];
}
