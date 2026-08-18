import { apiClient } from "./apiClient";

export const platformService = {
  dashboard: () => apiClient.get<{ dashboard: any }>("/dashboard"),
  maintenanceList: () => apiClient.get<{ requests: any[] }>("/maintenance"),
  maintenanceCreate: (payload: {
    apartmentId: string;
    title: string;
    description: string;
    category: string;
    priority: string;
  }) => apiClient.post<{ request: any }>("/maintenance", payload),
  buildings: () => apiClient.get<{ buildings: any[] }>("/buildings"),
  apartments: () => apiClient.get<{ apartments: any[] }>("/apartments"),
  updateApartment: (id: string, payload: {
    buildingId?: string;
    apartmentNumber: string;
    floor: number;
    bedrooms: number;
    monthlyRent: number;
    status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
    tenantId?: string;
  }) => apiClient.put<{ apartment: any }>(`/apartments/${id}`, payload),
  payments: () => apiClient.get<{ payments: any[] }>("/payments"),
  documents: () => apiClient.get<{ documents: any[] }>("/documents"),
  uploadPaymentProof: (paymentId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<{ payment: any }>(`/payments/${paymentId}/proof`, formData);
  },
  uploadDocument: (payload: {
    documentName: string;
    documentType: string;
    file: File;
    tenantId?: string;
  }) => {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("documentName", payload.documentName);
    formData.append("documentType", payload.documentType);
    if (payload.tenantId) {
      formData.append("tenantId", payload.tenantId);
    }
    return apiClient.post<{ document: any }>("/documents", formData);
  },
  securityReports: () => apiClient.get<{ reports: any[] }>("/security-reports"),
  createSecurityReport: (payload: {
    title: string;
    description: string;
    location: string;
    priority: string;
  }) => apiClient.post<{ report: any }>("/security-reports", payload),
  announcements: () => apiClient.get<{ announcements: any[] }>("/announcements"),
  notifications: () => apiClient.get<{ notifications: any[] }>("/notifications"),
  markNotificationRead: (id: string) => apiClient.post<{ notification: any }>(`/notifications/${id}/read`),
  reports: () => apiClient.get<{ reports: any }>("/reports"),
  auditLogs: () => apiClient.get<{ logs: any[] }>("/audit-logs"),
  users: () => apiClient.get<{ users: any[] }>("/users"),
  createStaff: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: "MANAGER" | "CONTRACTOR" | "ADMIN";
  }) => apiClient.post<{ user: any }>("/users", payload),
  updateProfile: (payload: { fullName: string; phone: string }) =>
    apiClient.patch<{ profile: any }>("/profile", payload),
};
