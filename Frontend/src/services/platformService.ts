import { apiClient } from "./apiClient";

type DashboardPoint = { category?: string; status?: string; count: number | string };
type DashboardData = {
  apartment?: { apartment_number?: string; building_name?: string };
  documentCount?: number;
  maintenanceByStatus?: DashboardPoint[];
  maintenanceByCategory?: DashboardPoint[];
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
type MaintenanceRequest = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: string;
  priority: string;
  apartment_id?: string;
  building_id?: string;
  tenant_id?: string;
  assigned_contractor_id?: string | null;
};
type MaintenanceUpdateEntry = { id: string; message: string; status?: string | null; created_at: string; full_name: string };
type MaintenanceDetail = MaintenanceRequest & { updates: MaintenanceUpdateEntry[] };
type Apartment = { id: string; building_id?: string; apartment_number: string; building_name?: string; floor: number; bedrooms: number; monthly_rent: number; status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"; tenant_id?: string | null; tenant_name?: string | null; tenant_email?: string | null };
type Building = { id: string; name: string; address: string; description?: string | null; manager_id?: string | null; is_active: boolean };
type Payment = { id: string; month_label: string; amount: number; status: string; tenant_name?: string };
type Document = { id: string; document_name: string; document_type: string; status: string; tenant_name?: string };
type SecurityReport = { id: string; title: string; status: string };
type Announcement = { id: string; title: string; message: string };
type Notification = { id: string; title: string; message: string; is_read: boolean };
type AuditLog = { id: string; action: string; entity_type: string };
type UserRecord = { id: string; full_name?: string; fullName?: string; email: string; role: string };
type Contractor = { id: string; user_id: string; full_name: string; email: string; company_name?: string | null; phone: string; specialization?: string | null; status: string };
type ApiEntity = Record<string, unknown>;

export const platformService = {
  dashboard: () => apiClient.get<{ dashboard: DashboardData }>("/dashboard"),
  maintenanceList: () => apiClient.get<{ requests: MaintenanceRequest[] }>("/maintenance"),
  maintenanceGet: (id: string) => apiClient.get<{ request: MaintenanceDetail }>(`/maintenance/${id}`),
  maintenanceCreate: (payload: {
    apartmentId: string;
    title: string;
    description: string;
    category: string;
    priority: string;
  }) => apiClient.post<{ request: ApiEntity }>("/maintenance", payload),
  assignContractor: (requestId: string, contractorId: string) =>
    apiClient.post<{ request: ApiEntity }>(`/maintenance/${requestId}/assign`, { contractorId }),
  addMaintenanceUpdate: (requestId: string, payload: { message: string; status?: string }) =>
    apiClient.post<{ request: ApiEntity }>(`/maintenance/${requestId}/updates`, payload),
  contractors: () => apiClient.get<{ contractors: Contractor[] }>("/contractors"),
  createContractor: (payload: { fullName: string; email: string; phone: string; password: string }) =>
    apiClient.post<{ user: UserRecord; contractor: Contractor }>("/contractors", payload),
  buildings: () => apiClient.get<{ buildings: Building[] }>("/buildings"),
  createBuilding: (payload: { name: string; address: string; description?: string; managerId?: string }) =>
    apiClient.post<{ building: Building }>("/buildings", payload),
  updateBuilding: (id: string, payload: { name: string; address: string; description?: string; managerId?: string }) =>
    apiClient.put<{ building: Building }>(`/buildings/${id}`, payload),
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
  verifyPayment: (paymentId: string, status: "Verified" | "Rejected") =>
    apiClient.patch<{ payment: Payment }>(`/payments/${paymentId}/verify`, { status }),
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
  updateDocumentStatus: (documentId: string, status: "Approved" | "Rejected") =>
    apiClient.patch<{ document: Document }>(`/documents/${documentId}/status`, { status }),
  securityReports: () => apiClient.get<{ reports: SecurityReport[] }>("/security-reports"),
  createSecurityReport: (payload: {
    title: string;
    description: string;
    location: string;
    priority: string;
  }) => apiClient.post<{ report: SecurityReport }>("/security-reports", payload),
  announcements: () => apiClient.get<{ announcements: Announcement[] }>("/announcements"),
  notifications: () => apiClient.get<{ notifications: Notification[] }>("/notifications"),
  sendNotification: (payload: { userId: string; title: string; message: string }) =>
    apiClient.post<{ notification: Notification }>("/notifications", payload),
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
