import { apiClient } from "./apiClient";

type DashboardPoint = { category?: string; status?: string; count: number | string };
type DashboardData = {
  apartment?: { apartment_number?: string; building_name?: string };
  documentCount?: number;
  maintenanceByStatus: DashboardPoint[];
  maintenanceByCategory: DashboardPoint[];
  buildings?: number;
  apartments?: number;
  occupied?: number;
  open_maintenance?: number;
  assigned?: number;
  active?: number;
  completed?: number;
  high_priority?: number;
  summary?: { total_buildings?: number; total_tenants?: number; open_maintenance?: number; pending_payments?: number };
};
type MaintenanceRequest = { id: string; title: string; status: string; priority: string };
type Apartment = { id: string; building_id?: string; apartment_number: string; building_name?: string; floor: number; bedrooms: number; monthly_rent: number; status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" };
type Payment = { id: string; month_label: string; amount: number; status: string };
type Document = { id: string; document_name: string; document_type: string; status: string };
type SecurityReport = { id: string; title: string; status: string };
type Announcement = { id: string; title: string; message: string };
type Notification = { id: string; title: string; message: string; is_read: boolean };
type AuditLog = { id: string; action: string; entity_type: string };
type UserRecord = { id: string; full_name?: string; fullName?: string; email: string; role: string };
type ApiEntity = Record<string, unknown>;

export const platformService = {
  dashboard: () => apiClient.get<{ dashboard: DashboardData }>("/dashboard"),
  maintenanceList: () => apiClient.get<{ requests: MaintenanceRequest[] }>("/maintenance"),
  maintenanceCreate: (payload: {
    apartmentId: string;
    title: string;
    description: string;
    category: string;
    priority: string;
  }) => apiClient.post<{ request: ApiEntity }>("/maintenance", payload),
  buildings: () => apiClient.get<{ buildings: ApiEntity[] }>("/buildings"),
  apartments: () => apiClient.get<{ apartments: Apartment[] }>("/apartments"),
  updateApartment: (id: string, payload: {
    buildingId?: string;
    apartmentNumber: string;
    floor: number;
    bedrooms: number;
    monthlyRent: number;
    status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
    tenantId?: string;
  }) => apiClient.put<{ apartment: Apartment }>(`/apartments/${id}`, payload),
  payments: () => apiClient.get<{ payments: Payment[] }>("/payments"),
  documents: () => apiClient.get<{ documents: Document[] }>("/documents"),
  uploadPaymentProof: (paymentId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<{ payment: Payment }>(`/payments/${paymentId}/proof`, formData);
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
    return apiClient.post<{ document: Document }>("/documents", formData);
  },
  securityReports: () => apiClient.get<{ reports: SecurityReport[] }>("/security-reports"),
  createSecurityReport: (payload: {
    title: string;
    description: string;
    location: string;
    priority: string;
  }) => apiClient.post<{ report: SecurityReport }>("/security-reports", payload),
  announcements: () => apiClient.get<{ announcements: Announcement[] }>("/announcements"),
  notifications: () => apiClient.get<{ notifications: Notification[] }>("/notifications"),
  markNotificationRead: (id: string) => apiClient.post<{ notification: Notification }>(`/notifications/${id}/read`),
  reports: () => apiClient.get<{ reports: Record<string, unknown> }>("/reports"),
  auditLogs: () => apiClient.get<{ logs: AuditLog[] }>("/audit-logs"),
  users: () => apiClient.get<{ users: UserRecord[] }>("/users"),
  createStaff: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: "MANAGER" | "CONTRACTOR" | "ADMIN";
  }) => apiClient.post<{ user: UserRecord }>("/users", payload),
  updateProfile: (payload: { fullName: string; phone: string }) =>
    apiClient.patch<{ profile: UserRecord }>("/profile", payload),
};
