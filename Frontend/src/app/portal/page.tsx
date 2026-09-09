"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "./_components/shared";
import { TenantDashboard } from "./_components/TenantDashboard";
import { ManagerDashboard } from "./_components/ManagerDashboard";
import { ContractorDashboard } from "./_components/ContractorDashboard";
import { AdminDashboard } from "./_components/AdminDashboard";

export default function PortalPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading, logout, refresh } = useAuth();

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
    queryClient.clear();
    router.push("/login");
  };

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <DashboardHeader user={user} onLogout={onLogout} />

      {user.role === "TENANT" && <TenantDashboard user={user} onProfileUpdated={refresh} />}
      {user.role === "MANAGER" && <ManagerDashboard user={user} onProfileUpdated={refresh} />}
      {user.role === "CONTRACTOR" && <ContractorDashboard user={user} onProfileUpdated={refresh} />}
      {user.role === "ADMIN" && <AdminDashboard user={user} onProfileUpdated={refresh} />}
    </main>
  );
}

