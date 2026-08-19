"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { platformService } from "@/services/platformService";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/brand-mark";
import { getErrorMessage } from "@/lib/utils";

const PIE_COLORS = ["#c76b4a", "#4f5d45", "#d9b98c", "#8f5b3d", "#6f7f63"];

export default function PortalPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading, logout, refresh } = useAuth();
  const [maintenanceForm, setMaintenanceForm] = useState({
    apartmentId: "",
    title: "",
    description: "",
    category: "Plumbing",
    priority: "Medium",
  });
  const [securityForm, setSecurityForm] = useState({ title: "", description: "", location: "", priority: "Medium" });
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "" });
  const [paymentUpload, setPaymentUpload] = useState<{ paymentId: string; file: File | null }>({ paymentId: "", file: null });
  const [documentUpload, setDocumentUpload] = useState<{ documentName: string; documentType: string; file: File | null }>({
    documentName: "",
    documentType: "ID Document",
    file: null,
  });
  const [staffForm, setStaffForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "MANAGER" as "MANAGER" | "CONTRACTOR" | "ADMIN",
  });
  const [apartmentAssignment, setApartmentAssignment] = useState<{ apartmentId: string; tenantId: string }>({
    apartmentId: "",
    tenantId: "",
  });

  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: () => platformService.dashboard(), enabled: !!user });
  const maintenance = useQuery({ queryKey: ["maintenance"], queryFn: () => platformService.maintenanceList(), enabled: !!user });
  const apartments = useQuery({ queryKey: ["apartments"], queryFn: () => platformService.apartments(), enabled: !!user });
  const payments = useQuery({ queryKey: ["payments"], queryFn: () => platformService.payments(), enabled: !!user });
  const documents = useQuery({ queryKey: ["documents"], queryFn: () => platformService.documents(), enabled: !!user });
  const security = useQuery({ queryKey: ["security"], queryFn: () => platformService.securityReports(), enabled: !!user });
  const announcements = useQuery({ queryKey: ["announcements"], queryFn: () => platformService.announcements(), enabled: !!user });
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: () => platformService.notifications(), enabled: !!user });
  const reports = useQuery({ queryKey: ["reports"], queryFn: () => platformService.reports(), enabled: user?.role === "ADMIN" || user?.role === "MANAGER" });
  const users = useQuery({ queryKey: ["users"], queryFn: () => platformService.users(), enabled: user?.role === "ADMIN" });
  const audits = useQuery({ queryKey: ["audits"], queryFn: () => platformService.auditLogs(), enabled: user?.role === "ADMIN" });

  const tenantApartment = useMemo(() => {
    if (user?.role !== "TENANT") return null;
    return apartments.data?.apartments?.[0] ?? null;
  }, [apartments.data, user?.role]);

  useEffect(() => {
    if (user?.role === "TENANT" && tenantApartment && !maintenanceForm.apartmentId) {
      setMaintenanceForm((prev) => ({ ...prev, apartmentId: tenantApartment.id }));
    }
  }, [user?.role, tenantApartment, maintenanceForm.apartmentId]);

  const cards = useMemo(() => {
    const data = dashboard.data?.dashboard;
    if (!data) return [];
    if (user?.role === "TENANT") {
      return [
        { title: "Apartment", value: data.apartment?.apartment_number || "Not assigned" },
        { title: "Building", value: data.apartment?.building_name || "N/A" },
        { title: "Documents", value: String(data.documentCount || 0) },
        { title: "Maintenance Entries", value: String((data.maintenanceByStatus || []).reduce((sum: number, x) => sum + Number(x.count), 0)) },
      ];
    }
    if (user?.role === "MANAGER") {
      return [
        { title: "Buildings", value: String(data.buildings) },
        { title: "Apartments", value: String(data.apartments) },
        { title: "Occupied", value: String(data.occupied) },
        { title: "Open Maintenance", value: String(data.open_maintenance) },
      ];
    }
    if (user?.role === "CONTRACTOR") {
      return [
        { title: "Assigned", value: String(data.assigned) },
        { title: "Active Jobs", value: String(data.active) },
        { title: "Completed", value: String(data.completed) },
        { title: "High Priority", value: String(data.high_priority) },
      ];
    }
    return [
      { title: "Buildings", value: String(data.summary?.total_buildings ?? 0) },
      { title: "Tenants", value: String(data.summary?.total_tenants ?? 0) },
      { title: "Open Maintenance", value: String(data.summary?.open_maintenance ?? 0) },
      { title: "Pending Payments", value: String(data.summary?.pending_payments ?? 0) },
    ];
  }, [dashboard.data, user?.role]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return <main className="p-8">Loading session...</main>;
  }

  if (!user) {
    return null;
  }

  const onLogout = async () => {
    await logout();
    router.push("/login");
  };

  const submitMaintenance = async () => {
    if (!tenantApartment) {
      toast.error("No apartment is assigned to this tenant yet. Ask an admin to assign your apartment first.");
      return;
    }
    try {
      await platformService.maintenanceCreate(maintenanceForm);
      setMaintenanceForm({ apartmentId: "", title: "", description: "", category: "Plumbing", priority: "Medium" });
      await queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Maintenance request submitted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to submit maintenance request."));
    }
  };

  const submitSecurity = async () => {
    try {
      await platformService.createSecurityReport(securityForm);
      setSecurityForm({ title: "", description: "", location: "", priority: "Medium" });
      await queryClient.invalidateQueries({ queryKey: ["security"] });
      toast.success("Security report submitted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to submit security report."));
    }
  };

  const updateProfile = async () => {
    try {
      await platformService.updateProfile(profileForm);
      await refresh();
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update profile."));
    }
  };

  const createStaff = async () => {
    if (!staffForm.fullName || !staffForm.email || !staffForm.phone || !staffForm.password || !staffForm.role) {
      toast.error("Fill in all staff account fields.");
      return;
    }
    try {
      await platformService.createStaff(staffForm);
      setStaffForm({ fullName: "", email: "", phone: "", password: "", role: "MANAGER" });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Staff account created successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create staff account."));
    }
  };

  const assignApartment = async () => {
    if (!apartmentAssignment.apartmentId || !apartmentAssignment.tenantId) {
      toast.error("Select an apartment and tenant first.");
      return;
    }

    const apartment = apartments.data?.apartments?.find((item) => item.id === apartmentAssignment.apartmentId);
    if (!apartment) {
      toast.error("Apartment not found.");
      return;
    }

    try {
      await platformService.updateApartment(apartment.id, {
        buildingId: apartment.building_id,
        apartmentNumber: apartment.apartment_number,
        floor: Number(apartment.floor),
        bedrooms: Number(apartment.bedrooms),
        monthlyRent: Number(apartment.monthly_rent),
        status: "OCCUPIED",
        tenantId: apartmentAssignment.tenantId,
      });
      setApartmentAssignment({ apartmentId: "", tenantId: "" });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["apartments"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      toast.success("Apartment assigned successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to assign apartment."));
    }
  };

  const uploadPaymentProof = async () => {
    if (!paymentUpload.paymentId || !paymentUpload.file) {
      toast.error("Select a payment and file before uploading.");
      return;
    }
    try {
      await platformService.uploadPaymentProof(paymentUpload.paymentId, paymentUpload.file);
      setPaymentUpload({ paymentId: "", file: null });
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment proof uploaded successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to upload payment proof."));
    }
  };

  const uploadDocument = async () => {
    if (!documentUpload.documentName || !documentUpload.documentType || !documentUpload.file) {
      toast.error("Provide a document name, type, and file.");
      return;
    }
    try {
      await platformService.uploadDocument({
        documentName: documentUpload.documentName,
        documentType: documentUpload.documentType,
        file: documentUpload.file,
        tenantId: user.role === "TENANT" ? user.id : undefined,
      });
      setDocumentUpload({ documentName: "", documentType: "ID Document", file: null });
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to upload document."));
    }
  };

  const changePassword = async () => {
    const currentPassword = window.prompt("Current password");
    const newPassword = window.prompt("New password (8+ chars, upper/lower/number)");
    if (!currentPassword || !newPassword) return;
    try {
      await authService.changePassword({ currentPassword, newPassword, confirmNewPassword: newPassword });
      toast.success("Password changed successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to change password."));
    }
  };

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div>
          <BrandMark />
          <p className="mt-2 text-sm text-brand-charcoal/70">Welcome back, {user.fullName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-olive/10 px-3 py-1 text-xs font-semibold text-brand-olive">{user.role}</span>
          <Button variant="ghost" onClick={onLogout}>Logout</Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.title} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-brand-charcoal/60">{card.title}</p>
            <p className="mt-2 text-2xl">{card.value}</p>
          </article>
        ))}
      </section>

      {user.role === "ADMIN" && dashboard.data?.dashboard && (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl bg-white p-4">
            <h2 className="mb-3 text-lg">Maintenance by Status</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dashboard.data.dashboard.maintenanceByStatus} dataKey="count" nameKey="status" outerRadius={100}>
                    {dashboard.data.dashboard.maintenanceByStatus.map((_, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>
          <article className="rounded-xl bg-white p-4">
            <h2 className="mb-3 text-lg">Maintenance by Category</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.data.dashboard.maintenanceByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#c76b4a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>
      )}

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Maintenance</h2>
          {maintenance.isLoading ? (
            <p className="mt-3 text-sm">Loading...</p>
          ) : maintenance.data?.requests.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {maintenance.data.requests.slice(0, 8).map((item) => (
                <li key={item.id} className="rounded border border-brand-sand/40 p-2">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-brand-charcoal/70">{item.status} - {item.priority}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm">No maintenance requests yet.</p>
          )}

          {user.role === "TENANT" && tenantApartment && (
            <div className="mt-4 space-y-2 border-t border-brand-sand/50 pt-4">
              <h3 className="text-sm font-semibold">Report Maintenance</h3>
              <div className="rounded-md border border-brand-sand/50 bg-brand-cream px-3 py-2 text-sm text-brand-charcoal/80">
                Submitting for apartment {tenantApartment.apartment_number} - {tenantApartment.building_name}
              </div>
              <Input placeholder="Title" value={maintenanceForm.title} onChange={(e) => setMaintenanceForm((p) => ({ ...p, title: e.target.value }))} />
              <Input placeholder="Description" value={maintenanceForm.description} onChange={(e) => setMaintenanceForm((p) => ({ ...p, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <select className="h-10 rounded-md border border-brand-sand/70 bg-white px-3" value={maintenanceForm.category} onChange={(e) => setMaintenanceForm((p) => ({ ...p, category: e.target.value }))}>
                  <option>Plumbing</option><option>Electrical</option><option>HVAC</option><option>Appliance</option><option>Structural</option><option>Cleaning</option><option>Other</option>
                </select>
                <select className="h-10 rounded-md border border-brand-sand/70 bg-white px-3" value={maintenanceForm.priority} onChange={(e) => setMaintenanceForm((p) => ({ ...p, priority: e.target.value }))}>
                  <option>Low</option><option>Medium</option><option>High</option><option>Emergency</option>
                </select>
              </div>
              <Button onClick={submitMaintenance}>Submit Maintenance Request</Button>
            </div>
          )}
          {user.role === "TENANT" && !tenantApartment && (
            <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No apartment is assigned to this tenant yet. Ask an admin to assign your apartment before submitting maintenance requests.
            </p>
          )}
        </article>

        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Notifications</h2>
          {notifications.data?.notifications.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {notifications.data.notifications.slice(0, 10).map((n) => (
                <li key={n.id} className="flex items-center justify-between rounded border border-brand-sand/40 p-2">
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-brand-charcoal/70">{n.message}</p>
                  </div>
                  {!n.is_read && <Button variant="ghost" onClick={async () => {
                    await platformService.markNotificationRead(n.id);
                    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
                  }}>Mark Read</Button>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm">No notifications.</p>
          )}
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Payments</h2>
          {payments.data?.payments.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {payments.data.payments.slice(0, 8).map((p) => (
                <li key={p.id} className="rounded border border-brand-sand/40 p-2">
                  {p.month_label} - ${p.amount} - {p.status}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm">No payments recorded.</p>
          )}

          <div className="mt-4 space-y-2 border-t border-brand-sand/50 pt-4">
            <h3 className="text-sm font-semibold">Upload Payment Proof</h3>
            <select
              className="h-10 w-full rounded-md border border-brand-sand/70 bg-white px-3"
              value={paymentUpload.paymentId}
              onChange={(e) => setPaymentUpload((prev) => ({ ...prev, paymentId: e.target.value }))}
            >
              <option value="">Select payment</option>
              {(payments.data?.payments || []).map((payment) => (
                <option key={payment.id} value={payment.id}>
                  {payment.month_label} - {payment.status} - ${payment.amount}
                </option>
              ))}
            </select>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={(e) => setPaymentUpload((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))}
            />
            <Button onClick={uploadPaymentProof}>Upload Payment Proof</Button>
          </div>
        </article>

        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Documents</h2>
          {documents.data?.documents.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {documents.data.documents.slice(0, 8).map((doc) => (
                <li key={doc.id} className="rounded border border-brand-sand/40 p-2">
                  {doc.document_name} - {doc.document_type} - {doc.status}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm">No documents uploaded.</p>
          )}

          <div className="mt-4 space-y-2 border-t border-brand-sand/50 pt-4">
            <h3 className="text-sm font-semibold">Upload Document</h3>
            <Input
              placeholder="Document name"
              value={documentUpload.documentName}
              onChange={(e) => setDocumentUpload((prev) => ({ ...prev, documentName: e.target.value }))}
            />
            <select
              className="h-10 w-full rounded-md border border-brand-sand/70 bg-white px-3"
              value={documentUpload.documentType}
              onChange={(e) => setDocumentUpload((prev) => ({ ...prev, documentType: e.target.value }))}
            >
              <option>ID Document</option>
              <option>Proof of Payment</option>
              <option>Lease Document</option>
              <option>Moving-in Document</option>
              <option>Other</option>
            </select>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={(e) => setDocumentUpload((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))}
            />
            <Button onClick={uploadDocument}>Upload Document</Button>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Security Reports</h2>
          {security.data?.reports.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {security.data.reports.slice(0, 8).map((report) => (
                <li key={report.id} className="rounded border border-brand-sand/40 p-2">
                  {report.title} - {report.status}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm">No security reports.</p>
          )}
          {user.role === "TENANT" && (
            <div className="mt-4 space-y-2 border-t border-brand-sand/50 pt-4">
              <h3 className="text-sm font-semibold">Report Security Issue</h3>
              <Input placeholder="Title" value={securityForm.title} onChange={(e) => setSecurityForm((p) => ({ ...p, title: e.target.value }))} />
              <Input placeholder="Description" value={securityForm.description} onChange={(e) => setSecurityForm((p) => ({ ...p, description: e.target.value }))} />
              <Input placeholder="Location" value={securityForm.location} onChange={(e) => setSecurityForm((p) => ({ ...p, location: e.target.value }))} />
              <select className="h-10 rounded-md border border-brand-sand/70 bg-white px-3" value={securityForm.priority} onChange={(e) => setSecurityForm((p) => ({ ...p, priority: e.target.value }))}>
                <option>Low</option><option>Medium</option><option>High</option><option>Emergency</option>
              </select>
              <Button onClick={submitSecurity}>Submit Security Report</Button>
            </div>
          )}
        </article>

        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Profile</h2>
          <div className="mt-3 space-y-2">
            <Input placeholder={user.fullName} value={profileForm.fullName} onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))} />
            <Input placeholder={user.phone} value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
            <div className="flex gap-2">
              <Button onClick={updateProfile}>Update Profile</Button>
              <Button variant="secondary" onClick={changePassword}>Change Password</Button>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Announcements</h2>
          {announcements.data?.announcements.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {announcements.data.announcements.slice(0, 8).map((item) => (
                <li key={item.id} className="rounded border border-brand-sand/40 p-2">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-brand-charcoal/70">{item.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm">No announcements.</p>
          )}
        </article>

        {(user.role === "ADMIN" || user.role === "MANAGER") && (
          <article className="rounded-xl bg-white p-4">
            <h2 className="text-lg">Reports</h2>
            <pre className="mt-3 overflow-x-auto rounded bg-brand-cream p-3 text-xs">{JSON.stringify(reports.data?.reports || {}, null, 2)}</pre>
          </article>
        )}
      </section>

      {user.role === "ADMIN" && (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl bg-white p-4">
            <h2 className="text-lg">Users</h2>
            {users.data?.users.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {users.data.users.slice(0, 15).map((u) => (
                  <li key={u.id} className="rounded border border-brand-sand/40 p-2">{u.full_name} - {u.email} - {u.role}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm">No users found.</p>
            )}
          </article>
          <article className="rounded-xl bg-white p-4">
            <h2 className="text-lg">Create Staff Account</h2>
            <div className="mt-3 space-y-2">
              <Input placeholder="Full name" value={staffForm.fullName} onChange={(e) => setStaffForm((prev) => ({ ...prev, fullName: e.target.value }))} />
              <Input placeholder="Email" type="email" value={staffForm.email} onChange={(e) => setStaffForm((prev) => ({ ...prev, email: e.target.value }))} />
              <Input placeholder="Phone" value={staffForm.phone} onChange={(e) => setStaffForm((prev) => ({ ...prev, phone: e.target.value }))} />
              <Input placeholder="Temporary password" type="password" value={staffForm.password} onChange={(e) => setStaffForm((prev) => ({ ...prev, password: e.target.value }))} />
              <select
                className="h-10 w-full rounded-md border border-brand-sand/70 bg-white px-3"
                value={staffForm.role}
                onChange={(e) => setStaffForm((prev) => ({ ...prev, role: e.target.value as "MANAGER" | "CONTRACTOR" | "ADMIN" }))}
              >
                <option value="MANAGER">MANAGER</option>
                <option value="CONTRACTOR">CONTRACTOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <Button onClick={createStaff}>Create Account</Button>
            </div>
          </article>
        </section>
      )}

      {user.role === "ADMIN" && (
        <section className="mt-6 rounded-xl bg-white p-4">
          <h2 className="text-lg">Assign Apartment To Tenant</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <select
              className="h-10 rounded-md border border-brand-sand/70 bg-white px-3"
              value={apartmentAssignment.apartmentId}
              onChange={(e) => setApartmentAssignment((prev) => ({ ...prev, apartmentId: e.target.value }))}
            >
              <option value="">Select apartment</option>
              {(apartments.data?.apartments || []).map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.apartment_number} - {apt.building_name} ({apt.status})
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border border-brand-sand/70 bg-white px-3"
              value={apartmentAssignment.tenantId}
              onChange={(e) => setApartmentAssignment((prev) => ({ ...prev, tenantId: e.target.value }))}
            >
              <option value="">Select tenant</option>
              {(users.data?.users || [])
                .filter((item) => item.role === "TENANT")
                .map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.full_name || tenant.fullName} - {tenant.email}
                  </option>
                ))}
            </select>
            <Button onClick={assignApartment}>Assign</Button>
          </div>
        </section>
      )}

      {user.role === "ADMIN" && (
        <section className="mt-6 rounded-xl bg-white p-4">
          <h2 className="text-lg">Audit Logs</h2>
          {audits.data?.logs.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {audits.data.logs.slice(0, 15).map((log) => (
                <li key={log.id} className="rounded border border-brand-sand/40 p-2">{log.action} - {log.entity_type}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm">No audit logs.</p>
          )}
        </section>
      )}
    </main>
  );
}
