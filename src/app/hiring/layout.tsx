"use client";

import React from "react";
import AppSidebar from "@/components/AppSidebar";
import AppTopBar from "@/components/AppTopBar";
import QueryProvider from "@/components/QueryProvider";

export default function HiringLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120]">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[72px] xl:ml-[240px]">
          <AppTopBar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}
