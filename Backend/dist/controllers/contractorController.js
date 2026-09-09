"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractors = getContractors;
exports.postContractor = postContractor;
const contractorService_1 = require("../services/contractorService");
async function getContractors(_req, res) {
    const contractors = await (0, contractorService_1.listContractors)();
    res.status(200).json({ contractors });
}
async function postContractor(req, res) {
    const contractor = await (0, contractorService_1.createContractor)(req.body);
    res.status(201).json({ contractor });
}
