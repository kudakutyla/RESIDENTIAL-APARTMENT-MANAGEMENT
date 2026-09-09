"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPayments = listPayments;
exports.uploadProof = uploadProof;
exports.patchVerifyPayment = patchVerifyPayment;
const path_1 = __importDefault(require("path"));
const paymentService_1 = require("../services/paymentService");
const httpError_1 = require("../utils/httpError");
async function listPayments(req, res) {
    const payments = await (0, paymentService_1.listPaymentsForUser)(req.user);
    res.status(200).json({ payments });
}
async function uploadProof(req, res) {
    if (!req.file)
        throw new httpError_1.HttpError(400, "File is required");
    const payment = await (0, paymentService_1.uploadPaymentProof)({
        user: req.user,
        paymentId: String(req.params.id),
        filePath: path_1.default.resolve(req.file.path),
        fileName: req.file.filename,
    });
    res.status(200).json({ payment });
}
async function patchVerifyPayment(req, res) {
    const payment = await (0, paymentService_1.verifyPayment)({
        actorUserId: req.user.id,
        paymentId: String(req.params.id),
        status: req.body.status,
    });
    res.status(200).json({ payment });
}
