"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import AppTopBar from "@/components/AppTopBar";

const settingsTabs = [
  { label: "Company", href: "/settings/company" },
  { label: "Locations", href: "/settings/locations" },
  { label: "Departments", href: "/settings/departments" },
  { label: "Users", href: "/settings/users" },
  { label: "Roles", href: "/settings/roles" },
  { label: "Pay Schedules", href: "/settings/pay-schedules" },
  { label: "Bank", href: "/settings/bank" },
  { label: "Integrations", href: "/settings/integrations" },
  { label: "Notifications", href: "/settings/notifications" },
  { label: "Billing", href: "/settings/billing" },
  { label: "SSO", href: "/settings/sso" },
  { label: "API", href: "/settings/api" },
  { label: "Audit Log", href: "/settings/audit-log" },
  { label: "Import", href: "/settings/import" },
  { label: "Custom Fields", href: "/settings/custom-fields" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/settings/company";

  return (
    
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120]">
        
        {/* Sidebar */}
        <AppSidebar />

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[72px] xl:ml-[240px]">

          {/* Topbar */}
          <AppTopBar />

          {/* Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Internal Settings Nav */}
                <aside className="w-full md:w-64 flex-shrink-0">
                  <div className="sticky top-8 flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h2 className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400">Settings</h2>
                    {settingsTabs.map((tab) => {
                      const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

                      return (
                        <Link
                          key={tab.href}
                          href={tab.href}
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            active
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          {tab.label}
                        </Link>
                      );
                    })}
                  </div>
                </aside>

                {/* Main Settings Content */}
                <div className="flex-1 min-w-0">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    
  );
}
