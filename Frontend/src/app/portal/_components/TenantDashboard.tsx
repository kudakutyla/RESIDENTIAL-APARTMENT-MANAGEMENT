"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "@/types";
import { platformService } from "@/services/platformService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";
import { AnnouncementsCard, NotificationsCard, ProfileCard, StatCards } from "./shared";

export function TenantDashboard({ user, onProfileUpdated }: { user: User; onProfileUpdated: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const [maintenanceForm, setMaintenanceForm] = useState({
    apartmentId: "",
    title: "",
    description: "",
    category: "Plumbing",
    priority: "Medium",
  });
  const [securityForm, setSecurityForm] = useState({ title: "", description: "", location: "", priority: "Medium" });
  const [paymentUpload, setPaymentUpload] = useState<{ paymentId: string; file: File | null }>({ paymentId: "", file: null });
  const [documentUpload, setDocumentUpload] = useState<{ documentName: string; documentType: string; file: File | null }>({
    documentName: "",
    documentType: "ID Document",
    file: null,
  });

  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: () => platformService.dashboard() });
  const maintenance = useQuery({ queryKey: ["maintenance"], queryFn: () => platformService.maintenanceList() });
  const apartments = useQuery({ queryKey: ["apartments"], queryFn: () => platformService.apartments() });
  const payments = useQuery({ queryKey: ["payments"], queryFn: () => platformService.payments() });
  const documents = useQuery({ queryKey: ["documents"], queryFn: () => platformService.documents() });
  const security = useQuery({ queryKey: ["security"], queryFn: () => platformService.securityReports() });

  const tenantApartment = useMemo(() => apartments.data?.apartments?.[0] ?? null, [apartments.data]);

  useEffect(() => {
    if (tenantApartment && !maintenanceForm.apartmentId) {
      setMaintenanceForm((prev) => ({ ...prev, apartmentId: tenantApartment.id }));
    }
  }, [tenantApartment, maintenanceForm.apartmentId]);

  const cards = useMemo(() => {
    const data = dashboard.data?.dashboard;
    if (!data) return [];
    return [
      { title: "Apartment", value: data.apartment?.apartment_number || "Not assigned" },
      { title: "Building", value: data.apartment?.building_name || "N/A" },
      { title: "Documents", value: String(data.documentCount || 0) },
      { title: "Maintenance Entries", value: String((data.maintenanceByStatus || []).reduce((sum, x) => sum + Number(x.count), 0)) },
    ];
  }, [dashboard.data]);

  const submitMaintenance = async () => {
    if (!tenantApartment) {
      toast.error("No apartment is assigned to this tenant yet. Ask an admin to assign your apartment first.");
      return;
    }
    try {
      await platformService.maintenanceCreate(maintenanceForm);
      setMaintenanceForm({ apartmentId: tenantApartment.id, title: "", description: "", category: "Plumbing", priority: "Medium" });
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
        tenantId: user.id,
      });
      setDocumentUpload({ documentName: "", documentType: "ID Document", file: null });
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to upload document."));
    }
  };

  return (
    <>
      <StatCards cards={cards} />

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

          {tenantApartment ? (
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
          ) : (
            <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No apartment is assigned to this tenant yet. Ask an admin to assign your apartment before submitting maintenance requests.
            </p>
          )}
        </article>

        <NotificationsCard />
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
        </article>

        <ProfileCard user={user} onUpdated={onProfileUpdated} />
      </section>

      <section className="mt-6">
        <AnnouncementsCard />
      </section>
    </>
  );
}
