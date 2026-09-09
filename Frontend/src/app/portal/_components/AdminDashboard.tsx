"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { User } from "@/types";
import { platformService } from "@/services/platformService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";
import { AnnouncementsCard, NotificationsCard, ProfileCard, StatCards } from "./shared";

const PIE_COLORS = ["#c76b4a", "#4f5d45", "#d9b98c", "#8f5b3d", "#6f7f63"];

export function AdminDashboard({ user, onProfileUpdated }: { user: User; onProfileUpdated: () => Promise<void> }) {
  const queryClient = useQueryClient();
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
  const [assignSelection, setAssignSelection] = useState<Record<string, string>>({});

  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: () => platformService.dashboard() });
  const maintenance = useQuery({ queryKey: ["maintenance"], queryFn: () => platformService.maintenanceList() });
  const apartments = useQuery({ queryKey: ["apartments"], queryFn: () => platformService.apartments() });
  const payments = useQuery({ queryKey: ["payments"], queryFn: () => platformService.payments() });
  const reports = useQuery({ queryKey: ["reports"], queryFn: () => platformService.reports() });
  const users = useQuery({ queryKey: ["users"], queryFn: () => platformService.users() });
  const audits = useQuery({ queryKey: ["audits"], queryFn: () => platformService.auditLogs() });
  const contractors = useQuery({ queryKey: ["contractors"], queryFn: () => platformService.contractors() });

  const cards = useMemo(() => {
    const data = dashboard.data?.dashboard;
    if (!data) return [];
    return [
      { title: "Buildings", value: String(data.summary?.total_buildings ?? 0) },
      { title: "Tenants", value: String(data.summary?.total_tenants ?? 0) },
      { title: "Open Maintenance", value: String(data.summary?.open_maintenance ?? 0) },
      { title: "Pending Payments", value: String(data.summary?.pending_payments ?? 0) },
    ];
  }, [dashboard.data]);

  const pendingPayments = useMemo(
    () => (payments.data?.payments || []).filter((p) => p.status === "Pending"),
    [payments.data],
  );

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

  const assignContractor = async (requestId: string) => {
    const contractorId = assignSelection[requestId];
    if (!contractorId) {
      toast.error("Select a contractor first.");
      return;
    }
    try {
      await platformService.assignContractor(requestId, contractorId);
      await queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Contractor assigned successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to assign contractor."));
    }
  };

  const verifyPayment = async (paymentId: string, status: "Verified" | "Rejected") => {
    try {
      await platformService.verifyPayment(paymentId, status);
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success(`Payment ${status.toLowerCase()}.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update payment."));
    }
  };

  return (
    <>
      <StatCards cards={cards} />

      {dashboard.data?.dashboard?.maintenanceByStatus && (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl bg-white p-4">
            <h2 className="mb-3 text-lg">Maintenance by Status</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dashboard.data.dashboard.maintenanceByStatus} dataKey="count" nameKey="status" outerRadius={100}>
                    {dashboard.data.dashboard.maintenanceByStatus.map((_, i) => (
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
          <h2 className="text-lg">Maintenance Requests</h2>
          {maintenance.isLoading ? (
            <p className="mt-3 text-sm">Loading...</p>
          ) : maintenance.data?.requests.length ? (
            <ul className="mt-3 space-y-3 text-sm">
              {maintenance.data.requests.slice(0, 10).map((item) => (
                <li key={item.id} className="rounded border border-brand-sand/40 p-2">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-brand-charcoal/70">{item.status} - {item.priority}</p>
                  {!item.assigned_contractor_id && (
                    <div className="mt-2 flex gap-2">
                      <select
                        className="h-9 flex-1 rounded-md border border-brand-sand/70 bg-white px-2 text-sm"
                        value={assignSelection[item.id] || ""}
                        onChange={(e) => setAssignSelection((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      >
                        <option value="">Select contractor</option>
                        {(contractors.data?.contractors || []).map((c) => (
                          <option key={c.id} value={c.id}>{c.full_name} - {c.phone}</option>
                        ))}
                      </select>
                      <Button onClick={() => assignContractor(item.id)}>Assign</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm">No maintenance requests yet.</p>
          )}
        </article>

        <NotificationsCard />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Payments Awaiting Verification</h2>
          {pendingPayments.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {pendingPayments.slice(0, 10).map((p) => (
                <li key={p.id} className="rounded border border-brand-sand/40 p-2">
                  <p className="font-medium">{p.tenant_name || "Tenant"} - {p.month_label} - ${p.amount}</p>
                  <div className="mt-2 flex gap-2">
                    <Button onClick={() => verifyPayment(p.id, "Verified")}>Verify</Button>
                    <Button variant="secondary" onClick={() => verifyPayment(p.id, "Rejected")}>Reject</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm">No payments pending verification.</p>
          )}
        </article>

        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Reports</h2>
          <pre className="mt-3 overflow-x-auto rounded bg-brand-cream p-3 text-xs">{JSON.stringify(reports.data?.reports || {}, null, 2)}</pre>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Users</h2>
          {users.data?.users.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {users.data.users.slice(0, 15).map((u) => (
                <li key={u.id} className="rounded border border-brand-sand/40 p-2">{u.full_name || u.fullName} - {u.email} - {u.role}</li>
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

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Assign Apartment To Tenant</h2>
          <div className="mt-3 grid gap-2">
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
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-4">
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
        </article>
        <ProfileCard user={user} onUpdated={onProfileUpdated} />
      </section>

      <section className="mt-6">
        <AnnouncementsCard />
      </section>
    </>
  );
}
