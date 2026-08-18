import { createUser, listUsers, setUserStatus } from "../repositories/userRepository";
import { hashPassword } from "../utils/password";
import { logAuditEvent } from "../utils/audit";
import type { Role } from "../types/auth";

export async function adminCreateStaff(input: {
  actorUserId: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}) {
  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    passwordHash,
    role: input.role,
  });
  await logAuditEvent({
    actorUserId: input.actorUserId,
    action: "STAFF_CREATED",
    entityType: "USER",
    entityId: user.id,
    details: { role: user.role },
  });
  return user;
}

export async function adminListUsers(filters: { role?: Role; q?: string }) {
  return listUsers(filters);
}

export async function adminSetUserStatus(input: {
  actorUserId: string;
  userId: string;
  status: "ACTIVE" | "DISABLED";
}) {
  const updated = await setUserStatus(input.userId, input.status);
  if (updated) {
    await logAuditEvent({
      actorUserId: input.actorUserId,
      action: "USER_STATUS_UPDATED",
      entityType: "USER",
      entityId: input.userId,
      details: { status: input.status },
    });
  }
  return updated;
}
