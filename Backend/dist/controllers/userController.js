"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStaff = createStaff;
exports.getUsers = getUsers;
exports.updateUserStatus = updateUserStatus;
const userService_1 = require("../services/userService");
async function createStaff(req, res) {
    const user = await (0, userService_1.adminCreateStaff)({ ...req.body, actorUserId: req.user.id });
    res.status(201).json({ user });
}
async function getUsers(req, res) {
    const users = await (0, userService_1.adminListUsers)({
        role: req.query.role,
        q: req.query.q,
    });
    res.status(200).json({ users });
}
async function updateUserStatus(req, res) {
    const user = await (0, userService_1.adminSetUserStatus)({
        actorUserId: req.user.id,
        userId: String(req.params.id),
        status: req.body.status,
    });
    res.status(200).json({ user });
}
