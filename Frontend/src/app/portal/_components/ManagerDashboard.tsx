"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "@/types";
import { platformService } from "@/services/platformService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";
import { AnnouncementsCard, NotificationsCard, ProfileCard, StatCards } from "./shared";

export function ManagerDashboard({ user, onProfileUpdated }: { user: User; onProfileUpdated: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const [assignSelection, setAssignSelection] = useState<Record<string, string>>({});
  const [contractorForm, setContractorForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [notificationForm, setNotificationForm] = useState({ recipientType: "TENANT" as "TENANT" | "CONTRACTOR", userId: "", title: "", message: "" });

  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: () => platformService.dashboard() });
  const maintenance = useQuery({ queryKey: ["maintenance"], queryFn: () => platformService.maintenanceList() });
  const contractors = useQuery({ queryKey: ["contractors"], queryFn: () => platformService.contractors() });
  const payments = useQuery({ queryKey: ["payments"], queryFn: () => platformService.payments() });
  const documents = useQuery({ queryKey: ["documents"], queryFn: () => platformService.documents() });
  const apartments = useQuery({ queryKey: ["apartments"], queryFn: () => platformService.apartments() });
  const reports = useQuery({ queryKey: ["reports"], queryFn: () => platformService.reports() });

  const cards = useMemo(() => {
    const data = dashboard.data?.dashboard;
    if (!data) return [];
    return [
      { title: "Buildings", value: String(data.buildings ?? 0) },
      { title: "Apartments", value: String(data.apartments ?? 0) },
      { title: "Occupied", value: String(data.occupied ?? 0) },
      { title: "Open Maintenance", value: String(data.open_maintenance ?? 0) },
    ];
  }, [dashboard.data]);

  const pendingPayments = useMemo(
    () => (payments.data?.payments || []).filter((p) => p.status === "Pending"),
    [payments.data],
  );

  const pendingDocuments = useMemo(
    () => (documents.data?.documents || []).filter((d) => d.status === "Uploaded"),
    [documents.data],
  );

  const tenantOptions = useMemo(() => {
    const seen = new Set<string>();
    return (apartments.data?.apartments || [])
      .filter((a) => a.tenant_id && !seen.has(a.tenant_id) && seen.add(a.tenant_id))
      .map((a) => ({ id: a.tenant_id as string, label: `${a.tenant_name || "Tenant"} - ${a.apartment_number}` }));
  }, [apartments.data]);

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

  const reviewDocument = async (documentId: string, status: "Approved" | "Rejected") => {
    try {
      await platformService.updateDocumentStatus(documentId, status);
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success(`Document ${status.toLowerCase()}.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update document."));
    }
  };

  const sendNotification = async () => {
    if (!notificationForm.userId || !notificationForm.title || !notificationForm.message) {
      toast.error("Select a recipient and fill in the title and message.");
      return;
    }
    try {
      await platformService.sendNotification({
        userId: notificationForm.userId,
        title: notificationForm.title,
        message: notificationForm.message,
      });
      setNotificationForm((prev) => ({ ...prev, userId: "", title: "", message: "" }));
      toast.success("Notification sent successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send notification."));
    }
  };

  const createContractor = async () => {
    if (!contractorForm.fullName || !contractorForm.email || !contractorForm.phone || !contractorForm.password) {
      toast.error("Fill in all contractor fields.");
      return;
    }
    try {
      await platformService.createContractor(contractorForm);
      setContractorForm({ fullName: "", email: "", phone: "", password: "" });
      await queryClient.invalidateQueries({ queryKey: ["contractors"] });
      toast.success("Contractor registered successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to register contractor."));
    }
  };

  return (
    <>
      <StatCards cards={cards} />

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
            <p className="mt-3 text-sm">No maintenance requests for your buildings.</p>
          )}
        </article>

        <NotificationsCard />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Send Notification</h2>
          <div className="mt-3 space-y-2">
            <select
              className="h-10 w-full rounded-md border border-brand-sand/70 bg-white px-3"
              value={notificationForm.recipientType}
              onChange={(e) =>
                setNotificationForm((prev) => ({ ...prev, recipientType: e.target.value as "TENANT" | "CONTRACTOR", userId: "" }))
              }
            >
              <option value="TENANT">Tenant</option>
              <option value="CONTRACTOR">Contractor</option>
            </select>
            <select
              className="h-10 w-full rounded-md border border-brand-sand/70 bg-white px-3"
              value={notificationForm.userId}
              onChange={(e) => setNotificationForm((prev) => ({ ...prev, userId: e.target.value }))}
            >
              <option value="">Select recipient</option>
              {(notificationForm.recipientType === "TENANT"
                ? tenantOptions
                : (contractors.data?.contractors || []).map((c) => ({ id: c.user_id, label: `${c.full_name} - ${c.phone}` }))
              ).map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <Input placeholder="Title" value={notificationForm.title} onChange={(e) => setNotificationForm((prev) => ({ ...prev, title: e.target.value }))} />
            <Input placeholder="Message" value={notificationForm.message} onChange={(e) => setNotificationForm((prev) => ({ ...prev, message: e.target.value }))} />
            <Button onClick={sendNotification}>Send Notification</Button>
          </div>
        </article>
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
          <h2 className="text-lg">Contractors</h2>
          {contractors.data?.contractors.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {contractors.data.contractors.slice(0, 10).map((c) => (
                <li key={c.id} className="rounded border border-brand-sand/40 p-2">{c.full_name} - {c.phone} - {c.status}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm">No contractors available.</p>
          )}
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Documents Awaiting Review</h2>
          {pendingDocuments.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {pendingDocuments.slice(0, 10).map((d) => (
                <li key={d.id} className="rounded border border-brand-sand/40 p-2">
                  <p className="font-medium">{d.tenant_name || "Tenant"} - {d.document_name}</p>
                  <p className="text-brand-charcoal/70">{d.document_type}</p>
                  <div className="mt-2 flex gap-2">
                    <Button onClick={() => reviewDocument(d.id, "Approved")}>Approve</Button>
                    <Button variant="secondary" onClick={() => reviewDocument(d.id, "Rejected")}>Reject</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm">No documents pending review.</p>
          )}
        </article>

        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Register Contractor</h2>
          <div className="mt-3 space-y-2">
            <Input placeholder="Full name" value={contractorForm.fullName} onChange={(e) => setContractorForm((prev) => ({ ...prev, fullName: e.target.value }))} />
            <Input placeholder="Email" type="email" value={contractorForm.email} onChange={(e) => setContractorForm((prev) => ({ ...prev, email: e.target.value }))} />
            <Input placeholder="Phone" value={contractorForm.phone} onChange={(e) => setContractorForm((prev) => ({ ...prev, phone: e.target.value }))} />
            <Input placeholder="Temporary password" type="password" value={contractorForm.password} onChange={(e) => setContractorForm((prev) => ({ ...prev, password: e.target.value }))} />
            <Button onClick={createContractor}>Register Contractor</Button>
          </div>
        </article>

        <article className="rounded-xl bg-white p-4">
          <h2 className="text-lg">Reports</h2>
          <pre className="mt-3 overflow-x-auto rounded bg-brand-cream p-3 text-xs">{JSON.stringify(reports.data?.reports || {}, null, 2)}</pre>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <ProfileCard user={user} onUpdated={onProfileUpdated} />
      </section>

      <section className="mt-6">
        <AnnouncementsCard />
      </section>
    </>
  );
}
