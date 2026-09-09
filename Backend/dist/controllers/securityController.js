"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSecurity = listSecurity;
exports.postSecurity = postSecurity;
exports.patchSecurity = patchSecurity;
const securityReportService_1 = require("../services/securityReportService");
async function listSecurity(req, res) {
    const reports = await (0, securityReportService_1.listSecurityReports)(req.user);
    res.status(200).json({ reports });
}
async function postSecurity(req, res) {
    const report = await (0, securityReportService_1.createSecurityReport)({ userId: req.user.id, ...req.body });
    res.status(201).json({ report });
}
async function patchSecurity(req, res) {
    const report = await (0, securityReportService_1.updateSecurityReportStatus)({ id: String(req.params.id), status: req.body.status });
    res.status(200).json({ report });
}
