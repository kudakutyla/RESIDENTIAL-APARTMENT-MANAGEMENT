"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { platformService } from "@/services/platformService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";

const STATUS_OPTIONS = ["Submitted", "Under Review", "Assigned", "In Progress", "Completed", "Cancelled"];

export default function MaintenanceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const [selectedContractor, setSelectedContractor] = useState("");
  const [updateForm, setUpdateForm] = useState({ message: "", status: "In Progress" });

  const request = useQuery({
    queryKey: ["maintenance", id],
    queryFn: () => platformService.maintenanceGet(id),
    enabled: !!user && !!id,
  });
  const contractors = useQuery({
    queryKey: ["contractors"],
    queryFn: () => platformService.contractors(),
    enabled: user?.role === "ADMIN" || user?.role === "MANAGER",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const refreshRequest = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["maintenance", id] }),
      queryClient.invalidateQueries({ queryKey: ["maintenance"] }),
    ]);
  };

  const assign = async () => {
    if (!selectedContractor) {
      toast.error("Select a contractor first.");
      return;
    }
    try {
      await platformService.assignContractor(id, selectedContractor);
      await refreshRequest();
      toast.success("Contractor assigned successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to assign contractor."));
    }
  };

  const postUpdate = async () => {
    if (!updateForm.message) {
      toast.error("Enter an update message.");
      return;
    }
    try {
      await platformService.addMaintenanceUpdate(id, updateForm);
      setUpdateForm((prev) => ({ ...prev, message: "" }));
      await refreshRequest();
      toast.success("Update posted.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to post update."));
    }
  };

  const quickMark = async (status: "In Progress" | "Completed") => {
    try {
      await platformService.addMaintenanceUpdate(id, { message: `Marked as ${status}.`, status });
      await refreshRequest();
      toast.success(`Job marked as ${status}.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update job status."));
    }
  };

  if (loading || request.isLoading) {
    return <main className="p-8">Loading...</main>;
  }

  if (!user) {
    return null;
  }

  if (request.isError || !request.data?.request) {
    return (
      <main className="mx-auto max-w-3xl p-4 md:p-8">
        <Link href="/portal" className="text-sm text-brand-terracotta underline">&larr; Back to dashboard</Link>
        <p className="mt-6 text-sm">Maintenance request not found.</p>
      </main>
    );
  }

  const data = request.data.request;
  const canAssign = (user.role === "ADMIN" || user.role === "MANAGER") && !data.assigned_contractor_id;
  const canUpdate = user.role === "CONTRACTOR";

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-8">
      <Link href="/portal" className="text-sm text-brand-terracotta underline">&larr; Back to dashboard</Link>

      <header className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold">{data.title}</h1>
        <p className="mt-1 text-sm text-brand-charcoal/70">
          {data.status} - {data.priority}
          {data.category ? ` - ${data.category}` : ""}
        </p>
        {data.description && <p className="mt-3 text-sm text-brand-charcoal/80">{data.description}</p>}
      </header>

      {canAssign && (
        <section className="mt-6 rounded-xl bg-white p-4">
          <h2 className="text-lg">Assign Contractor</h2>
          <div className="mt-3 flex gap-2">
            <select
              className="h-10 flex-1 rounded-md border border-brand-sand/70 bg-white px-3"
              value={selectedContractor}
              onChange={(e) => setSelectedContractor(e.target.value)}
            >
              <option value="">Select contractor</option>
              {(contractors.data?.contractors || []).map((c) => (
                <option key={c.id} value={c.id}>{c.full_name} - {c.phone}</option>
              ))}
            </select>
            <Button onClick={assign}>Assign</Button>
          </div>
        </section>
      )}

      {canUpdate && (
        <section className="mt-6 rounded-xl bg-white p-4">
          <h2 className="text-lg">Update Job Status</h2>
          <div className="mt-3 flex gap-2">
            <Button variant={data.status === "In Progress" ? "secondary" : "primary"} onClick={() => quickMark("In Progress")}>
              Mark In Progress
            </Button>
            <Button variant={data.status === "Completed" ? "secondary" : "primary"} onClick={() => quickMark("Completed")}>
              Mark Completed
            </Button>
          </div>
          <div className="mt-4 space-y-2 border-t border-brand-sand/50 pt-4">
            <Input
              placeholder="Update message"
              value={updateForm.message}
              onChange={(e) => setUpdateForm((prev) => ({ ...prev, message: e.target.value }))}
            />
            <div className="flex gap-2">
              <select
                className="h-10 flex-1 rounded-md border border-brand-sand/70 bg-white px-3"
                value={updateForm.status}
                onChange={(e) => setUpdateForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Button onClick={postUpdate}>Post Update</Button>
            </div>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-white p-4">
        <h2 className="text-lg">Timeline</h2>
        {data.updates?.length ? (
          <ul className="mt-3 space-y-3 text-sm">
            {data.updates.map((u) => (
              <li key={u.id} className="rounded border border-brand-sand/40 p-2">
                <p className="font-medium">{u.full_name}{u.status ? ` - ${u.status}` : ""}</p>
                <p className="text-brand-charcoal/70">{u.message}</p>
                <p className="mt-1 text-xs text-brand-charcoal/50">{new Date(u.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm">No updates yet.</p>
        )}
      </section>
    </main>
  );
}
