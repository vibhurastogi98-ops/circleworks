"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import QueryProvider from "@/components/QueryProvider";
import AppSidebar from "@/components/AppSidebar";
import AppTopBar from "@/components/AppTopBar";
import GreetingRow from "@/components/dashboard/GreetingRow";
import KpiCards from "@/components/dashboard/KpiCards";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import QuickActions from "@/components/dashboard/QuickActions";
import NewHires from "@/components/dashboard/NewHires";
import TeamCalendar from "@/components/dashboard/TeamCalendar";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import OnboardingTour from "@/components/OnboardingTour";

// Recharts client-only
const PayrollChart = dynamic(
  () => import("@/components/dashboard/PayrollChart"),
  { ssr: false }
);

export default function DashboardPage() {
  const { getToken } = useAuth();

  const [stats, setStats] = useState({
    users: 0,
    employees: 0,
    messages: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getToken();

        if (!token) {
          console.warn("No Clerk token found");
          return;
        }

        const res = await fetch(
          "https://circleworks-worker.vibhurastogi98.workers.dev/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = (await res.json()) as {
          users: number;
          employees: number;
          messages: number;
        };
        setStats(data);
      } catch (err) {
        console.error("Stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [getToken]);

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

              {/* ✅ LIVE STATS (NEW) */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow">
                <h3 className="font-bold text-lg mb-2">Live Stats 🔥</h3>

                {loading ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-gray-500 text-sm">Users</p>
                      <p className="text-2xl font-bold">{stats.users}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Employees</p>
                      <p className="text-2xl font-bold">{stats.employees}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Messages</p>
                      <p className="text-2xl font-bold">{stats.messages}</p>
                    </div>
                  </div>
                )}
              </div>

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

            </div>
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}