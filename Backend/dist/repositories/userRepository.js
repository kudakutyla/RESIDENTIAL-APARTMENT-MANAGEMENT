"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.createUser = createUser;
exports.updateUserPassword = updateUserPassword;
exports.listUsers = listUsers;
exports.setUserStatus = setUserStatus;
const client_1 = require("../db/client");
async function findUserByEmail(email) {
    const result = await (0, client_1.query)("SELECT * FROM users WHERE lower(email) = lower($1)", [email]);
    return result.rows[0] ?? null;
}
async function findUserById(id) {
    const result = await (0, client_1.query)("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] ?? null;
}
async function createUser(input) {
    const result = await (0, client_1.query)(`INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`, [input.fullName, input.email, input.phone, input.passwordHash, input.role]);
    return result.rows[0];
}
async function updateUserPassword(userId, passwordHash) {
    await (0, client_1.query)(`UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`, [userId, passwordHash]);
}
async function listUsers(filters) {
    const values = [];
    const where = [];
    if (filters.role) {
        values.push(filters.role);
        where.push(`role = $${values.length}`);
    }
    if (filters.q) {
        values.push(`%${filters.q.toLowerCase()}%`);
        where.push(`(lower(full_name) LIKE $${values.length} OR lower(email) LIKE $${values.length})`);
    }
    const sql = `SELECT id, full_name, email, phone, role, status, created_at, updated_at FROM users
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY created_at DESC`;
    const result = await (0, client_1.query)(sql, values);
    return result.rows;
}
async function setUserStatus(userId, status) {
    const result = await (0, client_1.query)(`UPDATE users SET status = $2, updated_at = NOW() WHERE id = $1
     RETURNING id, full_name, email, phone, role, status, created_at, updated_at`, [userId, status]);
    return result.rows[0] ?? null;
}
