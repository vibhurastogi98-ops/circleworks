"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, AlertTriangle, DollarSign, Users,
  ChevronDown, ChevronUp, Clock, Shield, Zap, Check,
  Loader2, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";

interface PayrollRun {
  id: string;
  clientId: string;
  client: string;
  clientSlug: string;
  payPeriod: string;
  employeeCount: number;
  grossAmount: number;
  netAmount: number;
  taxes: number;
  deductions: number;
  status: string;
  submittedAt: string;
  submittedBy: string;
  flags: string[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

export default function BatchApprovalsPage() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approving, setApproving] = useState<Set<string>>(new Set());
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [showConfirmAll, setShowConfirmAll] = useState(false);

  useEffect(() => {
    fetch("/api/accountant/clients/summary")
      .then((r) => r.json())
      .then((data) => {
        setRuns(data.pendingPayrollRuns || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const pendingRuns = runs.filter((r) => !approved.has(r.id));
  const allSelected = pendingRuns.length > 0 && pendingRuns.every((r) => selectedIds.has(r.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingRuns.map((r) => r.id)));
    }
  };

  const approveRun = async (id: string) => {
    setApproving((p) => new Set(p).add(id));
    await new Promise((r) => setTimeout(r, 1200));
    setApproving((p) => {
      const next = new Set(p);
      next.delete(id);
      return next;
    });
    setApproved((p) => new Set(p).add(id));
    setSelectedIds((p) => {
      const next = new Set(p);
      next.delete(id);
      return next;
    });
    const run = runs.find((r) => r.id === id);
    toast.success(`Approved: ${run?.client} — ${run?.payPeriod}`);
  };

  const batchApprove = async () => {
    setShowConfirmAll(false);
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await approveRun(id);
    }
    toast.success(`${ids.length} payroll runs approved!`);
  };

  const totalSelectedGross = pendingRuns
    .filter((r) => selectedIds.has(r.id))
    .reduce((sum, r) => sum + r.grossAmount, 0);

  const totalSelectedEmp = pendingRuns
    .filter((r) => selectedIds.has(r.id))
    .reduce((sum, r) => sum + r.employeeCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-slate-400 animate-pulse">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-extrabold text-slate-900 dark:text-white">
          Batch Payroll Approval
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
          Review and approve payroll runs across all your client companies in one place.
        </p>
      </div>

      {/* Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-[1px]"
      >
        <div className="rounded-[15px] bg-white dark:bg-slate-900 px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Pending Runs
              </p>
              <p className="text-[28px] font-extrabold text-slate-900 dark:text-white leading-none">
                {pendingRuns.length}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Selected
              </p>
              <p className="text-[28px] font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">
                {selectedIds.size}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Total Gross
              </p>
              <p className="text-[28px] font-extrabold text-slate-900 dark:text-white leading-none">
                {formatCurrency(totalSelectedGross)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Employees
              </p>
              <p className="text-[28px] font-extrabold text-slate-900 dark:text-white leading-none">
                {totalSelectedEmp}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Batch Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl px-5 py-3">
              <p className="text-[13px] font-bold text-indigo-700 dark:text-indigo-400">
                {selectedIds.size} payroll run{selectedIds.size > 1 ? "s" : ""} selected
              </p>
              <button
                onClick={() => setShowConfirmAll(true)}
                className="h-9 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold shadow-sm hover:shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                <Zap size={14} />
                Approve All Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowConfirmAll(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center">
                  <Shield size={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">
                    Confirm Batch Approval
                  </h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-5">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-[24px] font-extrabold text-slate-900 dark:text-white">{selectedIds.size}</p>
                    <p className="text-[11px] font-medium text-slate-500">Payroll Runs</p>
                  </div>
                  <div>
                    <p className="text-[24px] font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrency(totalSelectedGross)}</p>
                    <p className="text-[11px] font-medium text-slate-500">Total Gross</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmAll(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[13px] font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={batchApprove}
                  className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  Approve All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payroll Run List */}
      <div className="flex flex-col gap-3">
        {/* Select All Row */}
        {pendingRuns.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2">
            <button
              onClick={toggleSelectAll}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                allSelected
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-slate-300 dark:border-slate-600 hover:border-indigo-400"
              }`}
            >
              {allSelected && <Check size={12} strokeWidth={3} />}
            </button>
            <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400">
              Select all ({pendingRuns.length})
            </span>
          </div>
        )}

        {pendingRuns.map((run, i) => {
          const isSelected = selectedIds.has(run.id);
          const isExpanded = expandedId === run.id;
          const isApproving = approving.has(run.id);

          return (
            <motion.div
              key={run.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isSelected
                  ? "border-indigo-300 dark:border-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-500/5 shadow-md shadow-indigo-500/5"
                  : "border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/60"
              }`}
            >
              {/* Main Row */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(run.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-300 dark:border-slate-600 hover:border-indigo-400"
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </button>

                {/* Client Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">
                      {run.client}
                    </h3>
                    {run.flags.length > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                        <AlertTriangle size={10} />
                        {run.flags.length} flag{run.flags.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {run.payPeriod} · {run.employeeCount} people
                  </p>
                </div>

                {/* Amounts */}
                <div className="text-right hidden sm:block">
                  <p className="text-[16px] font-bold text-slate-900 dark:text-white">
                    {formatCurrency(run.grossAmount)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Net: {formatCurrency(run.netAmount)}
                  </p>
                </div>

                {/* Submitted */}
                <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 px-2">
                  <Clock size={12} />
                  {timeAgo(run.submittedAt)}
                </div>

                {/* Expand */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : run.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Approve */}
                <button
                  onClick={() => approveRun(run.id)}
                  disabled={isApproving}
                  className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-[12px] font-bold shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  {isApproving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Approving
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      Approve
                    </>
                  )}
                </button>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-700/40">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Gross Pay</p>
                          <p className="text-[18px] font-extrabold text-slate-900 dark:text-white">{formatCurrency(run.grossAmount)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Net Pay</p>
                          <p className="text-[18px] font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(run.netAmount)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Taxes</p>
                          <p className="text-[18px] font-extrabold text-red-600 dark:text-red-400">{formatCurrency(run.taxes)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Deductions</p>
                          <p className="text-[18px] font-extrabold text-slate-700 dark:text-slate-300">{formatCurrency(run.deductions)}</p>
                        </div>
                      </div>

                      {run.flags.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Review Flags</p>
                          <div className="flex flex-col gap-1.5">
                            {run.flags.map((flag, fi) => (
                              <div key={fi} className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/5 border border-amber-200/60 dark:border-amber-500/15 rounded-lg">
                                <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                                <span className="text-[12px] font-medium text-amber-800 dark:text-amber-300">{flag}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Submitted by <strong className="text-slate-600 dark:text-slate-300">{run.submittedBy}</strong></span>
                        <span>·</span>
                        <span>{timeAgo(run.submittedAt)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Approved Runs */}
        {approved.size > 0 && (
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-2">
              Recently Approved ({approved.size})
            </p>
            {runs
              .filter((r) => approved.has(r.id))
              .map((run) => (
                <div
                  key={run.id}
                  className="flex items-center gap-4 px-5 py-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/5 border border-emerald-200/50 dark:border-emerald-500/15 mb-2 opacity-70"
                >
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-emerald-800 dark:text-emerald-300">{run.client}</p>
                    <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/60">{run.payPeriod}</p>
                  </div>
                  <p className="text-[14px] font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(run.grossAmount)}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* Empty State */}
        {pendingRuns.length === 0 && approved.size === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1">All caught up!</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">No payroll runs pending approval.</p>
          </div>
        )}
      </div>
    </div>
  );
}
