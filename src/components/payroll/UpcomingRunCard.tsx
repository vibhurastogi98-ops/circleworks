"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  Play,
  Eye,
  CheckCircle2,
  Loader2,
  FileText,
} from "lucide-react";

export type PayrollRunStatus = "draft" | "processing" | "paid";

interface UpcomingRunCardProps {
  payPeriodStart: string;
  payPeriodEnd: string;
  checkDate: string;
  estimatedTotal: number;
  employeeCount: number;
  status: PayrollRunStatus;
  onPreviewRun: () => void;
  onRunPayroll: () => void;
}

const STATUS_CONFIG: Record<
  PayrollRunStatus,
  { label: string; color: string; bg: string; border: string; icon: React.ElementType; animate?: boolean }
> = {
  draft: {
    label: "Draft",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
    icon: FileText,
  },
  processing: {
    label: "Processing",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/30",
    icon: Loader2,
    animate: true,
  },
  paid: {
    label: "Paid",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
    icon: CheckCircle2,
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function UpcomingRunCard({
  payPeriodStart,
  payPeriodEnd,
  checkDate,
  estimatedTotal,
  employeeCount,
  status,
  onPreviewRun,
  onRunPayroll,
}: UpcomingRunCardProps) {
  const statusCfg = STATUS_CONFIG[status];
  const StatusIcon = statusCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-slate-950/30"
    >
      {/* Subtle gradient accent at top */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600" />

      <div className="p-6 sm:p-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              Upcoming Payroll Run
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-12">
              Next scheduled payroll for your organization
            </p>
          </div>

          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
          >
            <StatusIcon
              size={14}
              className={statusCfg.animate ? "animate-spin" : ""}
            />
            {statusCfg.label}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Pay Period */}
          <div className="group rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-4 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
              <Calendar size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Pay Period
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {formatDate(payPeriodStart)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              to {formatDate(payPeriodEnd)}
            </p>
          </div>

          {/* Check Date */}
          <div className="group rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-4 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
              <Clock size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Check Date
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {formatDate(checkDate)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Direct deposit</p>
          </div>

          {/* Estimated Total */}
          <div className="group rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-4 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
              <DollarSign size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Estimated Total
              </span>
            </div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(estimatedTotal)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Gross pay</p>
          </div>

          {/* Employee Count */}
          <div className="group rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-4 hover:border-cyan-200 dark:hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
              <Users size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Employees
              </span>
            </div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {employeeCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active employees</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={onRunPayroll}
            disabled={status === "processing"}
            id="payroll-run-cta"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {status === "processing" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Play size={16} />
                Run Payroll
              </>
            )}
          </button>

          <button
            onClick={onPreviewRun}
            id="payroll-preview-cta"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-slate-700 transition-all hover:-translate-y-0.5"
          >
            <Eye size={16} />
            Preview Run
          </button>
        </div>
      </div>
    </motion.div>
  );
}
