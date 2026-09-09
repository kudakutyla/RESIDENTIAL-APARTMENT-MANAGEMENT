"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBuildings = listBuildings;
exports.postBuilding = postBuilding;
exports.putBuilding = putBuilding;
exports.deleteBuilding = deleteBuilding;
const buildingService_1 = require("../services/buildingService");
async function listBuildings(req, res) {
    const buildings = await (0, buildingService_1.listBuildingsForUser)(req.user);
    res.status(200).json({ buildings });
}
async function postBuilding(req, res) {
    const building = await (0, buildingService_1.createBuilding)({ ...req.body, actorUserId: req.user.id });
    res.status(201).json({ building });
}
async function putBuilding(req, res) {
    const building = await (0, buildingService_1.updateBuilding)({ id: String(req.params.id), actorUserId: req.user.id, ...req.body });
    res.status(200).json({ building });
}
async function deleteBuilding(req, res) {
    const building = await (0, buildingService_1.deactivateBuilding)(req.user.id, String(req.params.id));
    res.status(200).json({ building });
}
