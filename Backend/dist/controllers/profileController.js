"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchProfile = patchProfile;
const profileService_1 = require("../services/profileService");
async function patchProfile(req, res) {
    const profile = await (0, profileService_1.updateProfile)({
        userId: req.user.id,
        fullName: req.body.fullName,
        phone: req.body.phone,
    });
    res.status(200).json({ profile });
}
