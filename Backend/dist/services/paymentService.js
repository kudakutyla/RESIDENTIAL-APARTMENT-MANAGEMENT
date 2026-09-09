"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPaymentsForUser = listPaymentsForUser;
exports.uploadPaymentProof = uploadPaymentProof;
exports.verifyPayment = verifyPayment;
const client_1 = require("../db/client");
const httpError_1 = require("../utils/httpError");
const audit_1 = require("../utils/audit");
async function listPaymentsForUser(user) {
    if (user.role === "ADMIN" || user.role === "MANAGER") {
        const sql = user.role === "ADMIN"
            ? `SELECT p.*, u.full_name as tenant_name FROM payments p JOIN users u ON u.id = p.tenant_id ORDER BY p.created_at DESC`
            : `SELECT p.*, u.full_name as tenant_name
         FROM payments p
         JOIN users u ON u.id = p.tenant_id
         JOIN apartments a ON a.id = p.apartment_id
         JOIN buildings b ON b.id = a.building_id
         WHERE b.manager_id = $1
         ORDER BY p.created_at DESC`;
        const result = await (0, client_1.query)(sql, user.role === "MANAGER" ? [user.id] : []);
        return result.rows;
    }
    const { rows } = await (0, client_1.query)(`SELECT * FROM payments WHERE tenant_id = $1 ORDER BY created_at DESC`, [user.id]);
    return rows;
}
async function uploadPaymentProof(input) {
    const payment = await (0, client_1.query)(`SELECT tenant_id FROM payments WHERE id = $1`, [input.paymentId]);
    if (!payment.rows.length)
        throw new httpError_1.HttpError(404, "Payment not found");
    if (input.user.role === "TENANT" && payment.rows[0].tenant_id !== input.user.id)
        throw new httpError_1.HttpError(403, "Forbidden");
    const { rows } = await (0, client_1.query)(`UPDATE payments
     SET proof_file_path = $2, proof_file_name = $3, status = 'Pending', updated_at = NOW()
     WHERE id = $1 RETURNING *`, [input.paymentId, input.filePath, input.fileName]);
    return rows[0];
}
async function verifyPayment(input) {
    const { rows } = await (0, client_1.query)(`UPDATE payments
     SET status = $2, verified_by = $3, verified_at = NOW(), updated_at = NOW()
     WHERE id = $1
     RETURNING *`, [input.paymentId, input.status, input.actorUserId]);
    if (!rows.length)
        throw new httpError_1.HttpError(404, "Payment not found");
    await (0, audit_1.logAuditEvent)({
        actorUserId: input.actorUserId,
        action: "PAYMENT_VERIFIED",
        entityType: "PAYMENT",
        entityId: input.paymentId,
        details: { status: input.status },
    });
    return rows[0];
}
