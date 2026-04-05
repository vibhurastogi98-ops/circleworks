"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  FileText,
  ExternalLink,
  TrendingUp,
} from "lucide-react";

export type RunStatus = "paid" | "processing" | "draft";

export interface PayrollRun {
  id: string;
  date: string;
  payPeriod: string;
  employees: number;
  gross: number;
  net: number;
  status: RunStatus;
}

const STATUS_BADGE: Record<
  RunStatus,
  { label: string; classes: string; icon: React.ElementType; animate?: boolean }
> = {
  paid: {
    label: "Paid",
    classes:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    classes:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
    icon: Loader2,
    animate: true,
  },
  draft: {
    label: "Draft",
    classes:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    icon: FileText,
  },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface RecentRunsTableProps {
  runs: PayrollRun[];
  onViewRun: (runId: string) => void;
}

export default function RecentRunsTable({ runs, onViewRun }: RecentRunsTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-slate-950/30 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Payroll Runs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Last {runs.length} completed runs
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Date
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Pay Period
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">
                Employees
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">
                Gross
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">
                Net
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {runs.map((run, idx) => {
              const badge = STATUS_BADGE[run.status];
              const BadgeIcon = badge.icon;
              return (
                <motion.tr
                  key={run.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {run.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {run.payPeriod}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 text-center">
                    {run.employees}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white text-right tabular-nums">
                    {formatCurrency(run.gross)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white text-right tabular-nums">
                    {formatCurrency(run.net)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badge.classes}`}
                    >
                      <BadgeIcon
                        size={12}
                        className={badge.animate ? "animate-spin" : ""}
                      />
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onViewRun(run.id)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group/link"
                    >
                      View
                      <ExternalLink
                        size={13}
                        className="opacity-0 group-hover/link:opacity-100 transition-opacity"
                      />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {runs.map((run) => {
          const badge = STATUS_BADGE[run.status];
          const BadgeIcon = badge.icon;
          return (
            <div key={run.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {run.date}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.classes}`}
                >
                  <BadgeIcon size={10} className={badge.animate ? "animate-spin" : ""} />
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {run.payPeriod} · {run.employees} employees
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Gross
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(run.gross)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Net
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(run.net)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onViewRun(run.id)}
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400"
                >
                  View →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
