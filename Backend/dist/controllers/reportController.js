"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReports = getReports;
const reportService_1 = require("../services/reportService");
async function getReports(_req, res) {
    const reports = await (0, reportService_1.getSystemReports)();
    res.status(200).json({ reports });
}
