"use client";

import dynamic from "next/dynamic";
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

// Recharts needs client-only rendering — lazy-load to avoid SSR issues
const PayrollChart = dynamic(
  () => import("@/components/dashboard/PayrollChart"),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120]">
        {/* Left Sidebar — 240px (72px on lg, 240px on xl) */}
        <AppSidebar />

        {/* Main panel (shifts right to account for sidebar) */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[72px] xl:ml-[240px]">
          {/* Sticky Topbar — 64px */}
          <AppTopBar />

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
              {/* ROW 1 — Greeting + Next Payroll */}
              <GreetingRow />

              {/* ROW 2 — KPI Cards */}
              <KpiCards />

              {/* ROW 3 — Alerts Panel */}
              <AlertsPanel />

              {/* ROW 4 — Payroll Chart + Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                  <PayrollChart />
                </div>
                <div className="lg:col-span-2">
                  <QuickActions />
                </div>
              </div>

              {/* ROW 5 — New Hires + Team Calendar */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <NewHires />
                <TeamCalendar />
              </div>

              {/* ROW 6 — Activity Feed */}
              <ActivityFeed />
            </div>
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}
