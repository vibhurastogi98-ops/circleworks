"use client";
import React from "react";
import EmployeeSidebar from "@/components/EmployeeSidebar";
import EmployeeTopBar from "@/components/EmployeeTopBar";
import { useAuth } from "@/context/AuthContext";

const employeePortalRoles = new Set([
  "admin",
  "administrator",
  "employee",
  "manager",
  "owner",
  "people manager",
  "staff",
  "super admin",
  "worker",
]);

function canAccessEmployeePortal(role?: string | null) {
  const normalized = (role ?? "employee").trim().toLowerCase().replace(/_/g, " ");
  return employeePortalRoles.has(normalized);
}

export default function EmployeePortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useAuth();
  const isBlocked = isLoaded && user && !canAccessEmployeePortal(user.role);

  if (isBlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-[#0B1120]">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Employee portal
          </p>
          <h1 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            Employee access required
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            This self-service portal is only available to users with employee
            self-service access.
          </p>
        </div>
      </div>
    );
  }

  return (
    
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120]">
        <EmployeeSidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[72px] xl:ml-[240px]">
          <EmployeeTopBar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    
  );
}
