import { query } from "../db/client";

export async function getSystemReports() {
  const occupancy = await query(
    `SELECT status, COUNT(*)::int as count FROM apartments GROUP BY status ORDER BY status`,
  );
  const maintenanceOverTime = await query(
    `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') as month, COUNT(*)::int as count
     FROM maintenance_requests
     GROUP BY date_trunc('month', created_at)
     ORDER BY date_trunc('month', created_at)`,
  );
  return {
    occupancy: occupancy.rows,
    maintenanceOverTime: maintenanceOverTime.rows,
  };
}
