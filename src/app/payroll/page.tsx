"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  RefreshCw,
  Download,
  ChevronDown,
} from "lucide-react";

import UpcomingRunCard from "@/components/payroll/UpcomingRunCard";
import RecentRunsTable, {
  type PayrollRun,
  type RunStatus,
} from "@/components/payroll/RecentRunsTable";
import QuickLinksRow from "@/components/payroll/QuickLinksRow";
import PayrollEmptyState from "@/components/payroll/EmptyState";

/* ──────────────────────────────────── Mock Data ──────────────────────────── */
const MOCK_UPCOMING = {
  payPeriodStart: "2026-03-16",
  payPeriodEnd: "2026-03-31",
  checkDate: "2026-04-05",
  estimatedTotal: 284_750,
  employeeCount: 47,
  status: "draft" as const,
};

const MOCK_RUNS: PayrollRun[] = [
  {
    id: "pr-001",
    date: "Mar 15, 2026",
    payPeriod: "Mar 1 – 15",
    employees: 47,
    gross: 278_420,
    net: 196_315,
    status: "paid",
  },
  {
    id: "pr-002",
    date: "Feb 28, 2026",
    payPeriod: "Feb 16 – 28",
    employees: 46,
    gross: 271_880,
    net: 191_710,
    status: "paid",
  },
  {
    id: "pr-003",
    date: "Feb 15, 2026",
    payPeriod: "Feb 1 – 15",
    employees: 46,
    gross: 270_100,
    net: 190_450,
    status: "paid",
  },
  {
    id: "pr-004",
    date: "Jan 31, 2026",
    payPeriod: "Jan 16 – 31",
    employees: 45,
    gross: 265_930,
    net: 187_540,
    status: "paid",
  },
  {
    id: "pr-005",
    date: "Jan 15, 2026",
    payPeriod: "Jan 1 – 15",
    employees: 44,
    gross: 260_100,
    net: 183_400,
    status: "paid",
  },
  {
    id: "pr-006",
    date: "Dec 31, 2025",
    payPeriod: "Dec 16 – 31",
    employees: 44,
    gross: 258_750,
    net: 182_300,
    status: "paid",
  },
];

/* ──────────────────────────────────── Fetcher ─────────────────────────────── */
async function fetchPayrollData(): Promise<{
  hasPayroll: boolean;
  upcoming: typeof MOCK_UPCOMING;
  runs: PayrollRun[];
}> {
  // Simulated network delay
  await new Promise((r) => setTimeout(r, 600));
  return {
    hasPayroll: true,
    upcoming: MOCK_UPCOMING,
    runs: MOCK_RUNS,
  };
}

/* ──────────────────────────────────── Skeleton ─────────────────────────────── */
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Upcoming card skeleton */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28 hidden sm:block" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────── Page ─────────────────────────────────── */
export default function PayrollPage() {
  const [runStatus, setRunStatus] = useState<"draft" | "processing" | "paid">(
    MOCK_UPCOMING.status
  );
  const router = useRouter();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["payroll-overview"],
    queryFn: fetchPayrollData,
  });

  const handleRunPayroll = useCallback(() => {
    router.push("/payroll/run");
  }, [router]);

  const handlePreviewRun = useCallback(() => {
    router.push("/payroll/run");
  }, [router]);

  const handleViewRun = useCallback((runId: string) => {
    console.log("View run:", runId);
  }, []);

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
              <DollarSign size={22} className="text-white" />
            </div>
            Payroll Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Manage, preview, and run payroll for your organization
          </p>
        </div>

        <div className="flex items-center gap-2 ml-[52px] sm:ml-0">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Download size={15} />
            Export
            <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSkeleton />
          </motion.div>
        ) : !data?.hasPayroll ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PayrollEmptyState />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Section 1: Upcoming Run Card */}
            <UpcomingRunCard
              payPeriodStart={data.upcoming.payPeriodStart}
              payPeriodEnd={data.upcoming.payPeriodEnd}
              checkDate={data.upcoming.checkDate}
              estimatedTotal={data.upcoming.estimatedTotal}
              employeeCount={data.upcoming.employeeCount}
              status={runStatus}
              onPreviewRun={handlePreviewRun}
              onRunPayroll={handleRunPayroll}
            />

            {/* Section 2: Recent Runs Table */}
            <RecentRunsTable runs={data.runs} onViewRun={handleViewRun} />

            {/* Section 3: Quick Links */}
            <QuickLinksRow />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
