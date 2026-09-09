"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMaintenance = listMaintenance;
exports.postMaintenance = postMaintenance;
exports.getMaintenance = getMaintenance;
exports.postAssignContractor = postAssignContractor;
exports.postMaintenanceUpdate = postMaintenanceUpdate;
const maintenanceService_1 = require("../services/maintenanceService");
async function listMaintenance(req, res) {
    const requests = await (0, maintenanceService_1.listMaintenanceForUser)(req.user);
    res.status(200).json({ requests });
}
async function postMaintenance(req, res) {
    const request = await (0, maintenanceService_1.createMaintenanceRequest)({ userId: req.user.id, ...req.body });
    res.status(201).json({ request });
}
async function getMaintenance(req, res) {
    const request = await (0, maintenanceService_1.getMaintenanceById)(req.user, String(req.params.id));
    res.status(200).json({ request });
}
async function postAssignContractor(req, res) {
    const request = await (0, maintenanceService_1.assignContractor)({
        actorUser: req.user,
        requestId: String(req.params.id),
        contractorId: req.body.contractorId,
    });
    res.status(200).json({ request });
}
async function postMaintenanceUpdate(req, res) {
    const request = await (0, maintenanceService_1.addMaintenanceUpdate)({
        actorUser: req.user,
        requestId: String(req.params.id),
        message: req.body.message,
        status: req.body.status,
    });
    res.status(200).json({ request });
}
