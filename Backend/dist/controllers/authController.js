"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.me = me;
exports.updatePassword = updatePassword;
const env_1 = require("../config/env");
const authService_1 = require("../services/authService");
function setAuthCookie(res, token) {
    res.cookie(env_1.env.COOKIE_NAME, token, {
        httpOnly: true,
        secure: env_1.env.isProduction,
        sameSite: env_1.env.isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
    });
}
async function register(req, res) {
    const result = await (0, authService_1.registerTenant)(req.body);
    setAuthCookie(res, result.token);
    res.status(201).json({ user: result.user });
}
async function login(req, res) {
    const result = await (0, authService_1.loginUser)(req.body.email, req.body.password);
    setAuthCookie(res, result.token);
    res.status(200).json({ user: result.user });
}
async function logout(_req, res) {
    res.clearCookie(env_1.env.COOKIE_NAME, { path: "/" });
    res.status(200).json({ message: "Logged out" });
}
async function me(req, res) {
    const user = await (0, authService_1.getCurrentUser)(req.user.id);
    res.status(200).json({ user });
}
async function updatePassword(req, res) {
    await (0, authService_1.changePassword)({
        userId: req.user.id,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
    });
    res.status(200).json({ message: "Password changed successfully" });
}
