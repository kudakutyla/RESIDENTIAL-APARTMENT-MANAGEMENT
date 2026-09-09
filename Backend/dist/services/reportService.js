"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemReports = getSystemReports;
const client_1 = require("../db/client");
async function getSystemReports() {
    const occupancy = await (0, client_1.query)(`SELECT status, COUNT(*)::int as count FROM apartments GROUP BY status ORDER BY status`);
    const maintenanceOverTime = await (0, client_1.query)(`SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') as month, COUNT(*)::int as count
     FROM maintenance_requests
     GROUP BY date_trunc('month', created_at)
     ORDER BY date_trunc('month', created_at)`);
    return {
        occupancy: occupancy.rows,
        maintenanceOverTime: maintenanceOverTime.rows,
    };
}
