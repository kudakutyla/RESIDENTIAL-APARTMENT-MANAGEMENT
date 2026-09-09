"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listContractors = listContractors;
exports.createContractor = createContractor;
exports.getContractorByUser = getContractorByUser;
const client_1 = require("../db/client");
const httpError_1 = require("../utils/httpError");
async function listContractors() {
    const { rows } = await (0, client_1.query)(`SELECT c.*, u.full_name, u.email FROM contractors c JOIN users u ON u.id = c.user_id ORDER BY u.full_name`);
    return rows;
}
async function createContractor(input) {
    const { rows } = await (0, client_1.query)(`INSERT INTO contractors (user_id, company_name, phone, specialization)
     VALUES ($1,$2,$3,$4) RETURNING *`, [input.userId, input.companyName, input.phone, input.specialization]);
    return rows[0];
}
async function getContractorByUser(userId) {
    const { rows } = await (0, client_1.query)(`SELECT * FROM contractors WHERE user_id = $1`, [userId]);
    if (!rows.length)
        throw new httpError_1.HttpError(404, "Contractor profile not found");
    return rows[0];
}
