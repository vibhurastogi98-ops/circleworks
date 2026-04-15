"use client";

import React from "react";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";
import AppTopBar from "@/components/AppTopBar";
import QueryProvider from "@/components/QueryProvider";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
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
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Internal Settings Nav */}
                <aside className="w-full md:w-64 flex-shrink-0">
                  <div className="sticky top-8 flex flex-col gap-1">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 px-3">Organization</h2>
                    <Link href="/settings/company" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Company Profile</Link>
                    <Link href="/settings/locations" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Locations</Link>
                    <Link href="/settings/departments" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Departments</Link>
                    
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mt-4 mb-2 px-3">Access & Security</h2>
                    <Link href="/settings/users" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Admin Users</Link>
                    <Link href="/settings/roles" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Roles & Permissions</Link>
                    <Link href="/settings/sso" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">SSO & Provisioning</Link>

                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mt-4 mb-2 px-3">Finance</h2>
                    <Link href="/settings/pay-schedules" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Pay Schedules</Link>
                    <Link href="/settings/bank" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Bank Accounts</Link>
                    <Link href="/settings/billing" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Billing & Plans</Link>
                    
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mt-4 mb-2 px-3">Agency</h2>
                    <Link href="/settings/agency/clients" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Client Billing Setup</Link>

                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mt-4 mb-2 px-3">Operations</h2>
                    <Link href="/settings/assets" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Equipment & Assets</Link>
                    <Link href="/settings/time" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Time & Projects</Link>

                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mt-4 mb-2 px-3">Communication</h2>
                    <Link href="/settings/announcements" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Announcements</Link>

                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mt-4 mb-2 px-3">System</h2>
                    <Link href="/settings/integrations" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Integrations</Link>
                    <Link href="/settings/workflows" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Workflows</Link>
                    <Link href="/settings/notifications" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Notifications</Link>
                    <Link href="/settings/api" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">API & Webhooks</Link>
                    
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mt-4 mb-2 px-3">Data</h2>
                    <Link href="/settings/import" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Import Data</Link>
                    <Link href="/settings/custom-fields" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Custom Fields</Link>
                    <Link href="/settings/audit-log" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Audit Log</Link>
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
    </QueryProvider>
  );
}
