export type Role = "TENANT" | "MANAGER" | "CONTRACTOR" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  status: "ACTIVE" | "DISABLED";
}

export interface ApiError {
  message: string;
  details?: unknown;
}
