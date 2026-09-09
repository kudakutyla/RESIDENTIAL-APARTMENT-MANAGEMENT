"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.markRead = markRead;
const notificationService_1 = require("../services/notificationService");
async function getNotifications(req, res) {
    const notifications = await (0, notificationService_1.listNotifications)(req.user.id);
    res.status(200).json({ notifications });
}
async function markRead(req, res) {
    const notification = await (0, notificationService_1.markNotificationRead)(req.user.id, String(req.params.id));
    res.status(200).json({ notification });
}
