"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDocuments = listDocuments;
exports.postDocument = postDocument;
const path_1 = __importDefault(require("path"));
const httpError_1 = require("../utils/httpError");
const documentService_1 = require("../services/documentService");
async function listDocuments(req, res) {
    const documents = await (0, documentService_1.listDocumentsForUser)(req.user);
    res.status(200).json({ documents });
}
async function postDocument(req, res) {
    if (!req.file)
        throw new httpError_1.HttpError(400, "File is required");
    const document = await (0, documentService_1.uploadDocument)({
        user: req.user,
        tenantId: req.body.tenantId || req.user.id,
        documentName: req.body.documentName,
        documentType: req.body.documentType,
        filePath: path_1.default.resolve(req.file.path),
        fileName: req.file.filename,
    });
    res.status(201).json({ document });
}
