"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";

import QueryProvider from "@/components/QueryProvider";
import AppSidebar from "@/components/AppSidebar";
import AppTopBar from "@/components/AppTopBar";
import GreetingRow from "@/components/dashboard/GreetingRow";
import KpiCards from "@/components/dashboard/KpiCards";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import QuickActions from "@/components/dashboard/QuickActions";
import NewHires from "@/components/dashboard/NewHires";
import TeamCalendar from "@/components/dashboard/TeamCalendar";
import { Loader2 } from "lucide-react";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import OnboardingTour from "@/components/OnboardingTour";
import { useDashboardData } from "@/hooks/useDashboardData";
import CirceWidget from "@/components/CirceWidget";

// Recharts client-only
const PayrollChart = dynamic(
  () => import("@/components/dashboard/PayrollChart"),
  { ssr: false }
);

export default function DashboardPage() {
  const { isLoading, currentUser } = useDashboardData();
  const { user } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    if (user?.publicMetadata?.role === "accountant") {
      router.push("/accountant-portal");
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120]">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[72px] xl:ml-[240px]">
          <AppTopBar />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium animate-pulse">Syncing your workspace...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120]">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[72px] xl:ml-[240px]">

          {/* Topbar */}
          <AppTopBar />

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <div id="tour-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
              <OnboardingTour />

              {/* Existing Layout */}
              <GreetingRow />
              <KpiCards />
              <AlertsPanel />

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                  <PayrollChart />
                </div>
                <div className="lg:col-span-2">
                  <QuickActions />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <NewHires />
                <TeamCalendar />
              </div>

              <ActivityFeed />
              <CirceWidget />
            </div>
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}