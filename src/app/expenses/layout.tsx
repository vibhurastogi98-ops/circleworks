"use client";

import React from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { QueryProvider } from "@/components/QueryProvider";

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}
