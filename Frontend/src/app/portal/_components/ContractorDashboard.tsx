"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "@/types";
import { platformService } from "@/services/platformService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";
import { NotificationsCard, ProfileCard, StatCards } from "./shared";

const STATUS_OPTIONS = ["Assigned", "In Progress", "Completed", "Cancelled"];

export function ContractorDashboard({ user, onProfileUpdated }: { user: User; onProfileUpdated: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const [updateForms, setUpdateForms] = useState<Record<string, { message: string; status: string }>>({});

  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: () => platformService.dashboard() });
  const maintenance = useQuery({ queryKey: ["maintenance"], queryFn: () => platformService.maintenanceList() });

  const cards = useMemo(() => {
    const data = dashboard.data?.dashboard;
    if (!data) return [];
    return [
      { title: "Assigned", value: String(data.assigned ?? 0) },
      { title: "Active Jobs", value: String(data.active ?? 0) },
      { title: "Completed", value: String(data.completed ?? 0) },
      { title: "High Priority", value: String(data.high_priority ?? 0) },
    ];
  }, [dashboard.data]);

  const formFor = (id: string) => updateForms[id] || { message: "", status: "In Progress" };

  const submitUpdate = async (requestId: string) => {
    const form = formFor(requestId);
    if (!form.message) {
      toast.error("Enter an update message.");
      return;
    }
    try {
      await platformService.addMaintenanceUpdate(requestId, { message: form.message, status: form.status });
      setUpdateForms((prev) => ({ ...prev, [requestId]: { message: "", status: form.status } }));
      await queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Job update submitted.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to submit update."));
    }
  };

  const quickMarkStatus = async (requestId: string, status: "In Progress" | "Completed") => {
    try {
      await platformService.addMaintenanceUpdate(requestId, { message: `Marked as ${status}.`, status });
      await queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success(`Job marked as ${status}.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update job status."));
    }
  };

  return (
    <>
      <StatCards cards={cards} />

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-4 lg:col-span-2">
          <h2 className="text-lg">Assigned Jobs</h2>
          {maintenance.isLoading ? (
            <p className="mt-3 text-sm">Loading...</p>
          ) : maintenance.data?.requests.length ? (
            <ul className="mt-3 space-y-3 text-sm">
              {maintenance.data.requests.map((item) => {
                const form = formFor(item.id);
                return (
                  <li key={item.id} className="rounded border border-brand-sand/40 p-3">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-brand-charcoal/70">{item.status} - {item.priority}{item.category ? ` - ${item.category}` : ""}</p>
                    {item.description && <p className="mt-1 text-brand-charcoal/70">{item.description}</p>}
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant={item.status === "In Progress" ? "secondary" : "primary"}
                        onClick={() => quickMarkStatus(item.id, "In Progress")}
                      >
                        Mark In Progress
                      </Button>
                      <Button
                        variant={item.status === "Completed" ? "secondary" : "primary"}
                        onClick={() => quickMarkStatus(item.id, "Completed")}
                      >
                        Mark Completed
                      </Button>
                    </div>
                    <div className="mt-3 space-y-2 border-t border-brand-sand/50 pt-3">
                      <Input
                        placeholder="Update message"
                        value={form.message}
                        onChange={(e) => setUpdateForms((prev) => ({ ...prev, [item.id]: { ...form, message: e.target.value } }))}
                      />
                      <div className="flex gap-2">
                        <select
                          className="h-10 flex-1 rounded-md border border-brand-sand/70 bg-white px-3"
                          value={form.status}
                          onChange={(e) => setUpdateForms((prev) => ({ ...prev, [item.id]: { ...form, status: e.target.value } }))}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <Button onClick={() => submitUpdate(item.id)}>Post Update</Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm">No jobs assigned to you yet.</p>
          )}
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <NotificationsCard />
        <ProfileCard user={user} onUpdated={onProfileUpdated} />
      </section>
    </>
  );
}
