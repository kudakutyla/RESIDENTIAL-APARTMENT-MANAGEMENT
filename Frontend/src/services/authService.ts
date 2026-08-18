import { apiClient } from "./apiClient";
import type { User } from "@/types";

export interface AuthResponse {
  user: User;
}

export const authService = {
  register: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => apiClient.post<AuthResponse>("/auth/register", payload),
  login: (payload: { email: string; password: string }) => apiClient.post<AuthResponse>("/auth/login", payload),
  me: () => apiClient.get<AuthResponse>("/auth/me"),
  logout: () => apiClient.post<{ message: string }>("/auth/logout"),
  changePassword: (payload: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => apiClient.post<{ message: string }>("/auth/change-password", payload),
};
