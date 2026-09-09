"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "@/types";
import { platformService } from "@/services/platformService";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/brand-mark";
import { getErrorMessage } from "@/lib/utils";

export function DashboardHeader({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
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
  );
}

export function StatCards({ cards }: { cards: { title: string; value: string }[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <article key={card.title} className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-brand-charcoal/60">{card.title}</p>
          <p className="mt-2 text-2xl">{card.value}</p>
        </article>
      ))}
    </section>
  );
}

export function NotificationsCard() {
  const queryClient = useQueryClient();
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: () => platformService.notifications() });

  return (
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
              {!n.is_read && (
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await platformService.markNotificationRead(n.id);
                    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
                  }}
                >
                  Mark Read
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm">No notifications.</p>
      )}
    </article>
  );
}

export function AnnouncementsCard() {
  const announcements = useQuery({ queryKey: ["announcements"], queryFn: () => platformService.announcements() });

  return (
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
  );
}

export function ProfileCard({ user, onUpdated }: { user: User; onUpdated: () => Promise<void> }) {
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "" });

  const updateProfile = async () => {
    try {
      await platformService.updateProfile(profileForm);
      await onUpdated();
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update profile."));
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
  );
}
