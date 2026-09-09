"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCreateStaff = adminCreateStaff;
exports.adminListUsers = adminListUsers;
exports.adminSetUserStatus = adminSetUserStatus;
const userRepository_1 = require("../repositories/userRepository");
const password_1 = require("../utils/password");
const audit_1 = require("../utils/audit");
async function adminCreateStaff(input) {
    const passwordHash = await (0, password_1.hashPassword)(input.password);
    const user = await (0, userRepository_1.createUser)({
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: input.role,
    });
    await (0, audit_1.logAuditEvent)({
        actorUserId: input.actorUserId,
        action: "STAFF_CREATED",
        entityType: "USER",
        entityId: user.id,
        details: { role: user.role },
    });
    return user;
}
async function adminListUsers(filters) {
    return (0, userRepository_1.listUsers)(filters);
}
async function adminSetUserStatus(input) {
    const updated = await (0, userRepository_1.setUserStatus)(input.userId, input.status);
    if (updated) {
        await (0, audit_1.logAuditEvent)({
            actorUserId: input.actorUserId,
            action: "USER_STATUS_UPDATED",
            entityType: "USER",
            entityId: input.userId,
            details: { status: input.status },
        });
    }
    return updated;
}
