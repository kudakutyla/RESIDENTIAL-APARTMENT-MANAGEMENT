import { query } from "../db/client";
import { HttpError } from "../utils/httpError";
import { logAuditEvent } from "../utils/audit";

export async function listApartmentsForUser(user: { id: string; role: string }) {
  if (user.role === "ADMIN") {
    const { rows } = await query(`SELECT a.*, b.name as building_name FROM apartments a JOIN buildings b ON b.id = a.building_id ORDER BY b.name, apartment_number`);
    return rows;
  }
  if (user.role === "MANAGER") {
    const { rows } = await query(
      `SELECT a.*, b.name as building_name FROM apartments a JOIN buildings b ON b.id = a.building_id
       WHERE b.manager_id = $1 ORDER BY b.name, apartment_number`,
      [user.id],
    );
    return rows;
  }
  const { rows } = await query(
    `SELECT a.*, b.name as building_name FROM apartments a JOIN buildings b ON b.id = a.building_id WHERE tenant_id = $1`,
    [user.id],
  );
  return rows;
}

export async function createApartment(input: {
  actorUserId: string;
  buildingId: string;
  apartmentNumber: string;
  floor: number;
  bedrooms: number;
  monthlyRent: number;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  tenantId?: string;
}) {
  const { rows } = await query(
    `INSERT INTO apartments (building_id, apartment_number, floor, bedrooms, monthly_rent, status, tenant_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [input.buildingId, input.apartmentNumber, input.floor, input.bedrooms, input.monthlyRent, input.status, input.tenantId ?? null],
  );
  await logAuditEvent({ actorUserId: input.actorUserId, action: "APARTMENT_CREATED", entityType: "APARTMENT", entityId: rows[0].id });
  return rows[0];
}

export async function updateApartment(input: {
  actorUserId: string;
  id: string;
  apartmentNumber: string;
  floor: number;
  bedrooms: number;
  monthlyRent: number;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  tenantId?: string;
}) {
  const { rows } = await query(
    `UPDATE apartments
     SET apartment_number = $2, floor = $3, bedrooms = $4, monthly_rent = $5, status = $6, tenant_id = $7, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [input.id, input.apartmentNumber, input.floor, input.bedrooms, input.monthlyRent, input.status, input.tenantId ?? null],
  );
  if (!rows.length) throw new HttpError(404, "Apartment not found");
  await logAuditEvent({ actorUserId: input.actorUserId, action: "APARTMENT_UPDATED", entityType: "APARTMENT", entityId: input.id });
  return rows[0];
}
