export type Role = "TENANT" | "MANAGER" | "CONTRACTOR" | "ADMIN";

export type AccountStatus = "ACTIVE" | "DISABLED";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  status: AccountStatus;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}
