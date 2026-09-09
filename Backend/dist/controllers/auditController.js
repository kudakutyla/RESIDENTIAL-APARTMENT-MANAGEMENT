"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = getAuditLogs;
const auditService_1 = require("../services/auditService");
async function getAuditLogs(_req, res) {
    const logs = await (0, auditService_1.listAuditLogs)();
    res.status(200).json({ logs });
}
