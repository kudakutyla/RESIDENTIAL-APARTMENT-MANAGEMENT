import { findUserByEmail, findUserById, createUser, updateUserPassword } from "../repositories/userRepository";
import { HttpError } from "../utils/httpError";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAccessToken } from "../utils/jwt";
import { logAuditEvent } from "../utils/audit";

export function sanitizeUser(user: {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}) {
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

export async function registerTenant(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new HttpError(409, "Email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({ ...input, passwordHash, role: "TENANT" });
  await logAuditEvent({
    actorUserId: user.id,
    action: "USER_REGISTERED",
    entityType: "USER",
    entityId: user.id,
  });

  const token = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  return { user: sanitizeUser(user), token };
}

export async function loginUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new HttpError(401, "Incorrect email or password.");
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    throw new HttpError(401, "Incorrect email or password.");
  }

  if (user.status !== "ACTIVE") {
    throw new HttpError(403, "Account is disabled.");
  }

  const token = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  return { user: sanitizeUser(user), token };
}

export async function getCurrentUser(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return sanitizeUser(user);
}

export async function changePassword(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  const user = await findUserById(input.userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const ok = await verifyPassword(input.currentPassword, user.password_hash);
  if (!ok) {
    throw new HttpError(401, "Current password is incorrect.");
  }

  const newHash = await hashPassword(input.newPassword);
  await updateUserPassword(user.id, newHash);
  await logAuditEvent({
    actorUserId: user.id,
    action: "PASSWORD_CHANGED",
    entityType: "USER",
    entityId: user.id,
  });
}
