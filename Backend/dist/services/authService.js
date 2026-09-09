"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUser = sanitizeUser;
exports.registerTenant = registerTenant;
exports.loginUser = loginUser;
exports.getCurrentUser = getCurrentUser;
exports.changePassword = changePassword;
const userRepository_1 = require("../repositories/userRepository");
const httpError_1 = require("../utils/httpError");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const audit_1 = require("../utils/audit");
function sanitizeUser(user) {
    return {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
    };
}
async function registerTenant(input) {
    const existing = await (0, userRepository_1.findUserByEmail)(input.email);
    if (existing) {
        throw new httpError_1.HttpError(409, "Email already exists");
    }
    const passwordHash = await (0, password_1.hashPassword)(input.password);
    const user = await (0, userRepository_1.createUser)({ ...input, passwordHash, role: "TENANT" });
    await (0, audit_1.logAuditEvent)({
        actorUserId: user.id,
        action: "USER_REGISTERED",
        entityType: "USER",
        entityId: user.id,
    });
    const token = (0, jwt_1.signAccessToken)({ userId: user.id, email: user.email, role: user.role });
    return { user: sanitizeUser(user), token };
}
async function loginUser(email, password) {
    const user = await (0, userRepository_1.findUserByEmail)(email);
    if (!user) {
        throw new httpError_1.HttpError(401, "Incorrect email or password.");
    }
    const ok = await (0, password_1.verifyPassword)(password, user.password_hash);
    if (!ok) {
        throw new httpError_1.HttpError(401, "Incorrect email or password.");
    }
    if (user.status !== "ACTIVE") {
        throw new httpError_1.HttpError(403, "Account is disabled.");
    }
    const token = (0, jwt_1.signAccessToken)({ userId: user.id, email: user.email, role: user.role });
    return { user: sanitizeUser(user), token };
}
async function getCurrentUser(userId) {
    const user = await (0, userRepository_1.findUserById)(userId);
    if (!user) {
        throw new httpError_1.HttpError(404, "User not found");
    }
    return sanitizeUser(user);
}
async function changePassword(input) {
    const user = await (0, userRepository_1.findUserById)(input.userId);
    if (!user) {
        throw new httpError_1.HttpError(404, "User not found");
    }
    const ok = await (0, password_1.verifyPassword)(input.currentPassword, user.password_hash);
    if (!ok) {
        throw new httpError_1.HttpError(401, "Current password is incorrect.");
    }
    const newHash = await (0, password_1.hashPassword)(input.newPassword);
    await (0, userRepository_1.updateUserPassword)(user.id, newHash);
    await (0, audit_1.logAuditEvent)({
        actorUserId: user.id,
        action: "PASSWORD_CHANGED",
        entityType: "USER",
        entityId: user.id,
    });
}
