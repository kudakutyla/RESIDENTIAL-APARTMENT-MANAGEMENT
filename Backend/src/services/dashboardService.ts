import { query } from "../db/client";

export async function tenantDashboard(userId: string) {
  const apartment = await query(
    `SELECT a.*, b.name as building_name, b.address as building_address
     FROM apartments a
     JOIN buildings b ON b.id = a.building_id
     WHERE a.tenant_id = $1
     LIMIT 1`,
    [userId],
  );
  const maintenance = await query(
    `SELECT status, COUNT(*)::int as count FROM maintenance_requests WHERE tenant_id = $1 GROUP BY status`,
    [userId],
  );
  const payments = await query(
    `SELECT status, COUNT(*)::int as count FROM payments WHERE tenant_id = $1 GROUP BY status`,
    [userId],
  );
  const docs = await query<{ count: number }>(`SELECT COUNT(*)::int as count FROM documents WHERE tenant_id = $1`, [userId]);

  return {
    apartment: apartment.rows[0] ?? null,
    maintenanceByStatus: maintenance.rows,
    paymentByStatus: payments.rows,
    documentCount: docs.rows[0]?.count ?? 0,
  };
}

export async function managerDashboard(userId: string) {
  const kpis = await query(
    `SELECT
      (SELECT COUNT(*)::int FROM buildings WHERE manager_id = $1) as buildings,
      (SELECT COUNT(*)::int FROM apartments a JOIN buildings b ON b.id = a.building_id WHERE b.manager_id = $1) as apartments,
      (SELECT COUNT(*)::int FROM apartments a JOIN buildings b ON b.id = a.building_id WHERE b.manager_id = $1 AND a.status = 'OCCUPIED') as occupied,
      (SELECT COUNT(*)::int FROM maintenance_requests mr JOIN buildings b ON b.id = mr.building_id WHERE b.manager_id = $1 AND mr.status <> 'Completed') as open_maintenance,
      (SELECT COUNT(*)::int FROM security_reports sr JOIN buildings b ON b.id = sr.building_id WHERE b.manager_id = $1 AND sr.status <> 'Resolved') as open_security`,
    [userId],
  );
  return kpis.rows[0];
}

export async function contractorDashboard(userId: string) {
  const contractor = await query<{ id: string }>(`SELECT id FROM contractors WHERE user_id = $1`, [userId]);
  const contractorId = contractor.rows[0]?.id;
  if (!contractorId) {
    return { assigned: 0, active: 0, completed: 0, highPriority: 0 };
  }
  const stats = await query(
    `SELECT
      COUNT(*)::int as assigned,
      COUNT(*) FILTER (WHERE status IN ('Assigned', 'In Progress'))::int as active,
      COUNT(*) FILTER (WHERE status = 'Completed')::int as completed,
      COUNT(*) FILTER (WHERE priority IN ('High','Emergency'))::int as high_priority
     FROM maintenance_requests
     WHERE assigned_contractor_id = $1`,
    [contractorId],
  );
  return stats.rows[0];
}

export async function adminDashboard() {
  const summary = await query(
    `SELECT
      (SELECT COUNT(*)::int FROM buildings) as total_buildings,
      (SELECT COUNT(*)::int FROM users WHERE role = 'TENANT') as total_tenants,
      (SELECT COUNT(*)::int FROM apartments WHERE status = 'OCCUPIED') as occupied_apartments,
      (SELECT COUNT(*)::int FROM maintenance_requests WHERE status <> 'Completed') as open_maintenance,
      (SELECT COUNT(*)::int FROM contractors) as active_contractors,
      (SELECT COUNT(*)::int FROM payments WHERE status = 'Pending') as pending_payments,
      (SELECT COUNT(*)::int FROM security_reports WHERE status <> 'Resolved') as open_security_reports`,
  );

  const maintenanceByStatus = await query(
    `SELECT status, COUNT(*)::int as count FROM maintenance_requests GROUP BY status ORDER BY status`,
  );
  const maintenanceByCategory = await query(
    `SELECT category, COUNT(*)::int as count FROM maintenance_requests GROUP BY category ORDER BY category`,
  );
  const paymentByStatus = await query(
    `SELECT status, COUNT(*)::int as count FROM payments GROUP BY status ORDER BY status`,
  );

  return {
    summary: summary.rows[0],
    maintenanceByStatus: maintenanceByStatus.rows,
    maintenanceByCategory: maintenanceByCategory.rows,
    paymentByStatus: paymentByStatus.rows,
  };
}
