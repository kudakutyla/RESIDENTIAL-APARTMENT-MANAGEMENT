import type { Request, Response } from "express";
import path from "path";
import { HttpError } from "../utils/httpError";
import { listDocumentsForUser, updateDocumentStatus, uploadDocument } from "../services/documentService";

export async function listDocuments(req: Request, res: Response) {
  const documents = await listDocumentsForUser(req.user!);
  res.status(200).json({ documents });
}

export async function postDocument(req: Request, res: Response) {
  if (!req.file) throw new HttpError(400, "File is required");
  const document = await uploadDocument({
    user: req.user!,
    tenantId: req.body.tenantId || req.user!.id,
    documentName: req.body.documentName,
    documentType: req.body.documentType,
    filePath: path.resolve(req.file.path),
    fileName: req.file.filename,
  });
  res.status(201).json({ document });
}

export async function patchDocumentStatus(req: Request, res: Response) {
  const document = await updateDocumentStatus({
    actorUser: req.user!,
    documentId: String(req.params.id),
    status: req.body.status,
  });
  res.status(200).json({ document });
}
