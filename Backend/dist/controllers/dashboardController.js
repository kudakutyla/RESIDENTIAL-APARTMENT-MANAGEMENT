"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = getDashboard;
const dashboardService_1 = require("../services/dashboardService");
async function getDashboard(req, res) {
    const role = req.user.role;
    if (role === "TENANT") {
        return res.status(200).json({ dashboard: await (0, dashboardService_1.tenantDashboard)(req.user.id) });
    }
    if (role === "MANAGER") {
        return res.status(200).json({ dashboard: await (0, dashboardService_1.managerDashboard)(req.user.id) });
    }
    if (role === "CONTRACTOR") {
        return res.status(200).json({ dashboard: await (0, dashboardService_1.contractorDashboard)(req.user.id) });
    }
    return res.status(200).json({ dashboard: await (0, dashboardService_1.adminDashboard)() });
}
