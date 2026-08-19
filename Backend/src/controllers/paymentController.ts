import type { Request, Response } from "express";
import path from "path";
import { listPaymentsForUser, uploadPaymentProof, verifyPayment } from "../services/paymentService";
import { HttpError } from "../utils/httpError";

export async function listPayments(req: Request, res: Response) {
  const payments = await listPaymentsForUser(req.user!);
  res.status(200).json({ payments });
}

export async function uploadProof(req: Request, res: Response) {
  if (!req.file) throw new HttpError(400, "File is required");
  const payment = await uploadPaymentProof({
    user: req.user!,
    paymentId: String(req.params.id),
    filePath: path.resolve(req.file.path),
    fileName: req.file.filename,
  });
  res.status(200).json({ payment });
}

export async function patchVerifyPayment(req: Request, res: Response) {
  const payment = await verifyPayment({
    actorUserId: req.user!.id,
    paymentId: String(req.params.id),
    status: req.body.status,
  });
  res.status(200).json({ payment });
}
