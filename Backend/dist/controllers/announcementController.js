"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAnnouncements = listAnnouncements;
exports.postAnnouncement = postAnnouncement;
const announcementService_1 = require("../services/announcementService");
async function listAnnouncements(req, res) {
    const announcements = await (0, announcementService_1.listAnnouncementsForUser)(req.user);
    res.status(200).json({ announcements });
}
async function postAnnouncement(req, res) {
    const announcement = await (0, announcementService_1.createAnnouncement)({ createdBy: req.user.id, ...req.body });
    res.status(201).json({ announcement });
}
