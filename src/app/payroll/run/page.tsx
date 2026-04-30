"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Flag,
  MoreHorizontal,
  Send,
  Save,
  Eye,
  Users,
  DollarSign,
  Receipt,
  Building2,
  X,
  Loader2,
  Sparkles,
  Gift,
  Check,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { usePayrollRunStore, type BenefitDeductionLine, type PayrollEmployee, type TimesheetHoursImport, type VerifyStatus } from "@/store/usePayrollRunStore";
import { MOCK_EMPLOYEES, MOCK_APPROVERS, PAY_PERIOD } from "@/data/payrollRunMocks";
import ProcessingOverlay from "@/components/payroll/run/ProcessingOverlay";
import ApprovalModal from "@/components/payroll/run/ApprovalModal";

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  HELPERS                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function fmtShort(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function roundHours(value: number) {
  return Math.round(value * 100) / 100;
}

function totalTaxesForEmployee(emp: PayrollEmployee) {
  return emp.taxes.federalIT + emp.taxes.ficaSS + emp.taxes.ficaMed + emp.taxes.stateIT + emp.taxes.localIT;
}

function totalDeductionsForEmployee(lines?: BenefitDeductionLine[]) {
  return roundCurrency((lines || []).reduce((sum, line) => sum + line.perPaycheckAmount, 0));
}

function calculateHourlyGross(emp: PayrollEmployee, hours: number) {
  const currentHours = emp.hours || hours || 1;
  const hourlyRate = emp.grossPay / currentHours;
  return roundCurrency(hourlyRate * hours);
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  HEADER                                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */
function RunHeader() {
  const { setShowApprovalModal, runState } = usePayrollRunStore();
  const [exporting, setExporting] = useState(false);
  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1500);
  };
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
            <DollarSign size={22} className="text-white" />
          </div>
          Run Payroll
        </h1>
        <div className="flex items-center gap-4 mt-2 ml-[52px] text-sm text-slate-500 dark:text-slate-400 flex-wrap">
          <span className="inline-flex items-center gap-1"><Calendar size={14} /> {fmtDate(PAY_PERIOD.start)} – {fmtDate(PAY_PERIOD.end)}</span>
          <span className="inline-flex items-center gap-1"><Clock size={14} /> Check: {fmtDate(PAY_PERIOD.checkDate)}</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
            <FileText size={11} /> DRAFT
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-[52px] lg:ml-0">
        <button onClick={handleExport} disabled={exporting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
          {exporting ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />} {exporting ? "Generating..." : "Preview Report"}
        </button>
        <button
          onClick={() => { setShowApprovalModal(true); }}
          disabled={runState !== "draft"}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 disabled:transform-none"
        >
          <Send size={15} /> Submit for Approval
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  VERIFICATION PANEL                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */
function VerificationPanel() {
  const { employees } = usePayrollRunStore();
  const verified = employees.filter((e) => e.verifyStatus === "verified").length;
  const flagged = employees.filter((e) => e.verifyStatus === "flagged").length;
  const errors = employees.filter((e) => e.verifyStatus === "error").length;
  const pending = employees.filter((e) => e.verifyStatus === "pending").length;
  const total = employees.length;
  const pct = total > 0 ? (verified / total) * 100 : 0;
  const [reminded, setReminded] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {verified} of {total} employees verified their pay ✓
          </span>
        </div>
        <button
          onClick={() => setReminded(true)}
          disabled={reminded}
          className={`text-sm font-semibold transition-colors ${reminded ? "text-emerald-500 cursor-default" : "text-blue-600 dark:text-blue-400 hover:text-blue-700"}`}
        >
          {reminded ? "✓ Reminders sent" : "Send Reminder"}
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" />
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={12} /> {verified} Verified
        </span>
        {flagged > 0 && <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400"><AlertTriangle size={12} /> {flagged} Flagged</span>}
        {errors > 0 && <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400"><AlertCircle size={12} /> {errors} Errors</span>}
        {pending > 0 && <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Clock size={12} /> {pending} Pending</span>}
      </div>
    </motion.div>
  );
}

function BenefitsChangedBanner({
  changedEmployeesCount,
  recalculating,
  onRecalculate,
}: {
  changedEmployeesCount: number;
  recalculating: boolean;
  onRecalculate: () => void;
}) {
  if (changedEmployeesCount <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" />
          <div>
            <p className="text-sm font-bold">
              Benefits changed for {changedEmployeesCount} {changedEmployeesCount === 1 ? "employee" : "employees"} since draft — recalculate?
            </p>
            <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
              Active enrollments were updated after this payroll draft was prepared.
            </p>
          </div>
        </div>
        <button
          onClick={onRecalculate}
          disabled={recalculating}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {recalculating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {recalculating ? "Recalculating..." : "Recalculate"}
        </button>
      </div>
    </motion.div>
  );
}

interface TimeImportSummary {
  hourlyEmployeeCount: number;
  approvedCount: number;
  missingCount: number;
  missingEmployees: string[];
  lateCount: number;
  cutoffHoursBeforeRun: number;
  periodStart: string;
  periodEnd: string;
}

interface TimeImportApiResult {
  summary: TimeImportSummary;
  imports: Array<TimesheetHoursImport & {
    employeeId: string | number;
    employeeName: string;
  }>;
}

function TimeImportPreflight({
  summary,
  importing,
  onImport,
  onUseScheduledHours,
}: {
  summary: TimeImportSummary | null;
  importing: boolean;
  onImport: () => void;
  onUseScheduledHours: () => void;
}) {
  if (!summary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-blue-950 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold">
            {summary.approvedCount} of {summary.hourlyEmployeeCount} hourly employees have approved timesheets
          </p>
          {summary.missingCount > 0 && (
            <p className="mt-1 text-xs text-blue-900/80 dark:text-blue-100/80">
              {summary.missingCount} employees missing timesheets: {summary.missingEmployees.slice(0, 5).join(", ")}
            </p>
          )}
          {summary.lateCount > 0 && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
              <AlertTriangle size={12} /> Submitted within cutoff window — may miss run
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onImport}
            disabled={importing}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {importing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {importing ? "Importing..." : `Continue with ${summary.approvedCount}`}
          </button>
          {summary.missingCount > 0 && (
            <>
              <button
                className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-500/30 dark:bg-slate-900 dark:text-blue-200"
                disabled={importing}
              >
                Wait for remaining {summary.missingCount}
              </button>
              <button
                onClick={onUseScheduledHours}
                disabled={importing}
                className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-500/30 dark:bg-slate-900 dark:text-blue-200"
              >
                Use scheduled hours
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SUMMARY CARDS                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */
function SummaryCards() {
  const { employees, setShowBreakdownModal } = usePayrollRunStore();
  const totalGross = employees.reduce((s, e) => s + e.grossPay, 0);
  const totalTaxes = employees.reduce((s, e) => s + e.taxes.federalIT + e.taxes.ficaSS + e.taxes.ficaMed + e.taxes.stateIT + e.taxes.localIT, 0);
  const totalNet = employees.reduce((s, e) => s + e.netPay, 0);
  // Employer cost = gross + employer FICA match
  const employerFICA = employees.reduce((s, e) => s + e.taxes.ficaSS + e.taxes.ficaMed, 0);
  const totalEmployerCost = totalGross + employerFICA;

  const cards = [
    { key: "gross", label: "Total Gross", value: totalGross, icon: DollarSign, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { key: "taxes", label: "Total Taxes", value: totalTaxes, icon: Building2, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { key: "net", label: "Total Net", value: totalNet, icon: Receipt, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { key: "employer", label: "Employer Cost", value: totalEmployerCost, icon: Users, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <button key={c.key} onClick={() => setShowBreakdownModal(c.key)}
          className="group text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-5 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-xl transition-all hover:-translate-y-0.5">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}><c.icon size={16} className={c.color} /></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{c.label}</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">{fmtShort(c.value)}</p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Click for breakdown <ChevronRight size={10} />
          </p>
        </button>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  BREAKDOWN MODAL                                                          */
/* ═══════════════════════════════════════════════════════════════════════════ */
function BreakdownModal() {
  const { showBreakdownModal, setShowBreakdownModal, employees } = usePayrollRunStore();
  if (!showBreakdownModal) return null;

  const totalFederalIT = employees.reduce((s, e) => s + e.taxes.federalIT, 0);
  const totalFICASS = employees.reduce((s, e) => s + e.taxes.ficaSS, 0);
  const totalFICAMed = employees.reduce((s, e) => s + e.taxes.ficaMed, 0);
  const totalStateIT = employees.reduce((s, e) => s + e.taxes.stateIT, 0);
  const totalLocalIT = employees.reduce((s, e) => s + e.taxes.localIT, 0);
  const totalGross = employees.reduce((s, e) => s + e.grossPay, 0);
  const totalDeductions = employees.reduce((s, e) => s + e.deductions, 0);
  const totalNet = employees.reduce((s, e) => s + e.netPay, 0);

  const titles: Record<string, string> = { gross: "Gross Pay Breakdown", taxes: "Tax Breakdown", net: "Net Pay Breakdown", employer: "Employer Cost Breakdown" };
  const rows: Record<string, [string, number][]> = {
    gross: [["Base Salaries", totalGross * 0.92], ["Hourly Wages", totalGross * 0.08]],
    taxes: [["Federal Income Tax", totalFederalIT], ["FICA Social Security", totalFICASS], ["FICA Medicare", totalFICAMed], ["State Income Tax", totalStateIT], ["Local Taxes", totalLocalIT]],
    net: [["Total Gross", totalGross], ["Total Deductions", -totalDeductions], ["Net Pay", totalNet]],
    employer: [["Employee Gross Pay", totalGross], ["Employer FICA SS Match", totalFICASS], ["Employer FICA Med Match", totalFICAMed], ["FUTA (est.)", totalGross * 0.006]],
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowBreakdownModal(null)} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-[71] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{titles[showBreakdownModal]}</h3>
            <button onClick={() => setShowBreakdownModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"><X size={18} /></button>
          </div>
          <div className="p-6 space-y-2">
            {(rows[showBreakdownModal] || []).map(([label, val]) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
                <span className={`text-sm font-bold tabular-nums ${val < 0 ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>{fmt(val)}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  FLAG REASON MODAL                                                        */
/* ═══════════════════════════════════════════════════════════════════════════ */
function FlagReasonModal() {
  const { showFlagModal, setShowFlagModal, employees, updateEmployee } = usePayrollRunStore();
  const [note, setNote] = useState("");
  const emp = employees.find((e) => e.id === showFlagModal);

  useEffect(() => { setNote(emp?.flagReason || ""); }, [emp]);

  if (!showFlagModal || !emp) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowFlagModal(null)} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-[71] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Flag: {emp.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{emp.title} · {emp.department}</p>
            </div>
            <button onClick={() => setShowFlagModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"><X size={18} /></button>
          </div>
          <div className="p-6">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Reason / Notes</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe the issue with this employee's pay…" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => { updateEmployee(emp.id, { verifyStatus: "flagged", flagReason: note }); setShowFlagModal(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors">Save Flag</button>
              <button onClick={() => { updateEmployee(emp.id, { verifyStatus: "verified", flagReason: undefined }); setShowFlagModal(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Clear Flag</button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  FILTER BAR                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */
function FilterBar() {
  const {
    searchQuery, setSearchQuery,
    filterDepartment, setFilterDepartment,
    filterPayType, setFilterPayType,
    filterStatus, setFilterStatus,
    showFlaggedOnly, setShowFlaggedOnly,
    employees,
  } = usePayrollRunStore();

  const departments = useMemo(() => [...new Set(employees.map((e) => e.department))].sort(), [employees]);
  const [exportingCsv, setExportingCsv] = useState(false);
  const handleExportCsv = () => {
    setExportingCsv(true);
    setTimeout(() => setExportingCsv(false), 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by employee name…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        {/* Department */}
        <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Pay Type */}
        <select value={filterPayType} onChange={(e) => setFilterPayType(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Pay Types</option>
          <option value="salary">Salary</option>
          <option value="hourly">Hourly</option>
        </select>

        {/* Status */}
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="flagged">Flagged</option>
          <option value="error">Error</option>
          <option value="pending">Pending</option>
        </select>

        {/* Export */}
        <button onClick={handleExportCsv} disabled={exportingCsv} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed">
          {exportingCsv ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} {exportingCsv ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Flagged toggle */}
      <div className="flex items-center gap-2 mt-3">
        <button onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
          className={`relative w-9 h-5 rounded-full transition-colors ${showFlaggedOnly ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showFlaggedOnly ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Show only flagged employees</span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  BULK ACTIONS BAR                                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */
function BulkActionsBar() {
  const { selectedIds, deselectAll, updateEmployee, employees } = usePayrollRunStore();
  const count = selectedIds.size;
  if (count === 0) return null;

  const handleMarkReviewed = () => {
    selectedIds.forEach((id) => updateEmployee(id, { verifyStatus: "verified", flagReason: undefined, errorMessage: undefined }));
    deselectAll();
  };

  const handleApplyBonus = () => {
    selectedIds.forEach((id) => {
      const emp = employees.find((e) => e.id === id);
      if (emp) {
        const bonus = 500;
        updateEmployee(id, { grossPay: emp.grossPay + bonus, netPay: emp.netPay + bonus * 0.7 });
      }
    });
    deselectAll();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 px-5 py-3 flex items-center gap-3 flex-wrap">
      <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{count} selected</span>
      <div className="w-px h-5 bg-blue-200 dark:bg-blue-500/30" />
      <button onClick={handleApplyBonus} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
        <Gift size={13} /> Apply $500 Bonus
      </button>
      <button onClick={handleMarkReviewed} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
        <Check size={13} /> Mark Reviewed
      </button>
      <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
        <Download size={13} /> Export Selected
      </button>
      <button onClick={deselectAll} className="ml-auto text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors">Clear</button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  EMPLOYEE TABLE ROW                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */
function EmployeeRow({ emp }: { emp: PayrollEmployee }) {
  const { selectedIds, toggleSelect, expandedRows, toggleExpandRow, updateEmployee, setShowFlagModal } = usePayrollRunStore();
  const isSelected = selectedIds.has(emp.id);
  const isExpanded = expandedRows.has(emp.id);
  const [editing, setEditing] = useState(false);
  const [grossVal, setGrossVal] = useState(emp.grossPay.toFixed(2));
  const inputRef = useRef<HTMLInputElement>(null);
  const pretaxDeductions = (emp.benefitDeductions || []).filter((line) => line.pretaxOrPosttax === "pre_tax");
  const posttaxDeductions = (emp.benefitDeductions || []).filter((line) => line.pretaxOrPosttax === "post_tax");
  const deductionTotal = totalDeductionsForEmployee(emp.benefitDeductions);
  const importedFromTimesheet = emp.timesheetImport?.source === "timesheet";

  useEffect(() => { setGrossVal(emp.grossPay.toFixed(2)); }, [emp.grossPay]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const rowBg = emp.verifyStatus === "flagged" ? "bg-amber-50/60 dark:bg-amber-500/5"
    : emp.verifyStatus === "error" ? "bg-red-50/60 dark:bg-red-500/5"
    : "bg-white dark:bg-slate-900";

  const statusIcon: Record<VerifyStatus, React.ReactNode> = {
    verified: <CheckCircle2 size={16} className="text-emerald-500" />,
    flagged: <AlertTriangle size={16} className="text-amber-500" />,
    error: <div className="relative group/err"><AlertCircle size={16} className="text-red-500" /><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover/err:opacity-100 group-hover/err:visible transition-all whitespace-nowrap shadow-xl z-[60]">{emp.errorMessage}</div></div>,
    pending: <Clock size={16} className="text-slate-400" />,
  };

  const handleSaveGross = () => {
    const v = parseFloat(grossVal);
    if (!isNaN(v) && v > 0) {
      updateEmployee(emp.id, {
        grossPay: v,
        netPay: roundCurrency(v - totalTaxesForEmployee(emp) - deductionTotal),
      });
    }
    setEditing(false);
  };

  const handleOverrideHours = () => {
    const currentHours = emp.hours ?? emp.timesheetImport?.totalHours ?? 0;
    const nextValue = window.prompt("Override hours for this payroll run", String(currentHours));
    if (nextValue === null) return;

    const overrideHours = parseFloat(nextValue);
    if (Number.isNaN(overrideHours) || overrideHours < 0) return;

    const grossPay = emp.payType === "hourly" ? calculateHourlyGross(emp, overrideHours) : emp.grossPay;

    updateEmployee(emp.id, {
      hours: overrideHours,
      grossPay,
      netPay: roundCurrency(grossPay - totalTaxesForEmployee(emp) - deductionTotal),
      hoursManuallyOverridden: true,
      timesheetImport: emp.timesheetImport
        ? {
            ...emp.timesheetImport,
            source: "manual",
            totalHours: overrideHours,
            regularHours: overrideHours,
            overtimeHours: 0,
            doubleTimeHours: 0,
          }
        : undefined,
      hoursOverrideAudit: {
        overriddenAt: new Date().toISOString(),
        originalHours: currentHours,
        overrideHours,
        reason: "Payroll run screen manual override",
      },
    });
  };

  return (
    <>
      <tr className={`group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800 ${rowBg}`}>
        {/* Checkbox */}
        <td className="pl-4 pr-2 py-3">
          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(emp.id)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
        </td>
        {/* Expand */}
        <td className="px-1 py-3">
          <button onClick={() => toggleExpandRow(emp.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <ChevronRight size={14} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          </button>
        </td>
        {/* Employee */}
        <td className="px-3 py-3">
          <div className="flex items-center gap-3 min-w-[180px]">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden border border-slate-300 dark:border-slate-600">
              <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{emp.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{emp.title}</p>
            </div>
          </div>
        </td>
        {/* Pay Type */}
        <td className="px-3 py-3">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${emp.payType === "salary" ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400"}`}>
            {emp.payType}
          </span>
        </td>
        {/* Hours */}
        <td className="px-3 py-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            {importedFromTimesheet && (
              <button
                onClick={() => toggleExpandRow(emp.id)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-cyan-50 text-[10px] font-black text-cyan-700 ring-1 ring-cyan-200 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-500/30"
                title="Imported from approved timesheet"
              >
                T
              </button>
            )}
            {emp.hoursManuallyOverridden && (
              <span className="inline-flex h-6 items-center rounded-md bg-amber-50 px-1.5 text-[10px] font-black text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                OVERRIDE
              </span>
            )}
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              {emp.hours !== null ? emp.hours : "—"}
            </span>
            {emp.payType === "hourly" && (
              <button
                onClick={handleOverrideHours}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                title="Manual override"
              >
                <Edit3 size={13} />
              </button>
            )}
          </div>
        </td>
        {/* Gross Pay - inline editable */}
        <td className="px-3 py-3 text-right">
          {editing ? (
            <input ref={inputRef} type="text" value={grossVal} onChange={(e) => setGrossVal(e.target.value)}
              onBlur={handleSaveGross} onKeyDown={(e) => { if (e.key === "Enter") handleSaveGross(); if (e.key === "Escape") { setGrossVal(emp.grossPay.toFixed(2)); setEditing(false); } }}
              className="w-28 text-right text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-blue-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums" />
          ) : (
            <button onClick={() => setEditing(true)} className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors tabular-nums cursor-text">
              {fmt(emp.grossPay)}
            </button>
          )}
        </td>
        {/* Deductions */}
        <td className="px-3 py-3 text-right">
          <div className="group/deductions relative inline-flex">
            <span className="text-sm font-semibold text-red-600 dark:text-red-400 tabular-nums">
              -{fmt(emp.deductions)}
            </span>
            <div className="absolute right-0 top-full z-30 mt-2 hidden w-72 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xl group-hover/deductions:block dark:border-slate-700 dark:bg-slate-900">
              {pretaxDeductions.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">Pre-tax</p>
                  <div className="space-y-1.5">
                    {pretaxDeductions.map((line) => (
                      <div key={`${line.employeeId}-${line.benefitPlanId}`} className="flex items-start justify-between gap-3 text-xs">
                        <span className="text-slate-600 dark:text-slate-300">{line.planName}</span>
                        <span className="font-bold text-red-600 dark:text-red-400">-{fmt(line.perPaycheckAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {posttaxDeductions.length > 0 && (
                <div className={pretaxDeductions.length > 0 ? "mt-4" : ""}>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-violet-500">Post-tax</p>
                  <div className="space-y-1.5">
                    {posttaxDeductions.map((line) => (
                      <div key={`${line.employeeId}-${line.benefitPlanId}`} className="flex items-start justify-between gap-3 text-xs">
                        <span className="text-slate-600 dark:text-slate-300">{line.planName}</span>
                        <span className="font-bold text-red-600 dark:text-red-400">-{fmt(line.perPaycheckAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pretaxDeductions.length === 0 && posttaxDeductions.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">No active benefit deductions for this payroll run.</p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-200">Total</span>
                <span className="text-red-600 dark:text-red-400">-{fmt(emp.deductions)}</span>
              </div>
            </div>
          </div>
        </td>
        {/* Net */}
        <td className="px-3 py-3 text-sm font-bold text-slate-900 dark:text-white text-right tabular-nums">
          {fmt(emp.netPay)}
        </td>
        {/* Verify Status */}
        <td className="px-3 py-3 text-center">{statusIcon[emp.verifyStatus]}</td>
        {/* Actions */}
        <td className="px-3 py-3">
          <div className="flex items-center gap-1 justify-center">
            <button onClick={() => setShowFlagModal(emp.id)} title="Flag employee"
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-400 hover:text-amber-500 transition-colors">
              <Flag size={14} />
            </button>
            {emp.verifyStatus !== "verified" && (
              <button onClick={() => updateEmployee(emp.id, { verifyStatus: "verified", flagReason: undefined, errorMessage: undefined })} title="Mark as verified"
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500 transition-colors">
                <Check size={14} />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded tax breakdown sub-row */}
      <AnimatePresence>
        {isExpanded && (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={10} className="bg-slate-50 dark:bg-slate-800/30 px-4 py-0">
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="py-4 pl-16 pr-8 space-y-6">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Tax Breakdown */}
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                        <Building2 size={12} /> Tax Breakdown
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          ["Federal IT", emp.taxes.federalIT],
                          ["FICA SS", emp.taxes.ficaSS],
                          ["FICA Med", emp.taxes.ficaMed],
                          ["State IT", emp.taxes.stateIT],
                          ["Local IT", emp.taxes.localIT],
                          ["Net Pay", emp.netPay],
                        ].map(([label, val]) => (
                          <div key={label as string} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{label as string}</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">{fmt(val as number)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-3 flex items-center gap-1.5">
                        <Receipt size={12} /> Benefit Deductions
                      </p>
                      <div className="space-y-2">
                        {(emp.benefitDeductions || []).map((line) => (
                          <div key={`${line.employeeId}-${line.benefitPlanId}`} className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{line.planName}</p>
                              <p className="text-[10px] text-slate-500">
                                {line.pretaxOrPosttax === "pre_tax" ? "Pre-tax" : "Post-tax"} · {line.deductionCode}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-red-600 dark:text-red-400">-{fmt(line.perPaycheckAmount)}</p>
                              <p className="text-[9px] text-slate-400">Per paycheck</p>
                            </div>
                          </div>
                        ))}
                        {(emp.benefitDeductions || []).length === 0 && (
                          <div className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            No active benefit deductions on this draft.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-1.5">
                        <Clock size={12} /> Timesheet Hours
                      </p>
                      <div className="space-y-2">
                        {(emp.timesheetImport?.days || []).map((day) => (
                          <div key={day.date} className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{fmtDate(day.date)}</p>
                              <p className="text-[10px] text-slate-500">
                                {(day.overtimeHours + day.doubleTimeHours) > 0 ? "Includes overtime" : "Regular hours"}
                              </p>
                            </div>
                            <p className="text-xs font-black text-cyan-600 dark:text-cyan-300">
                              {roundHours(day.regularHours + day.overtimeHours + day.doubleTimeHours)}h
                            </p>
                          </div>
                        ))}
                        {!emp.timesheetImport && (
                          <div className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            No approved timesheet imported for this employee.
                          </div>
                        )}
                        {emp.timesheetImport?.partialPeriodReason && (
                          <div className="rounded-lg bg-amber-50 p-3 text-xs font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                            Partial period: {emp.timesheetImport.partialPeriodReason === "new_hire" ? "new hire start date applied" : "termination date applied"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Project Allocation Breakdown */}
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-1.5">
                        <DollarSign size={12} /> Project Cost Allocation
                      </p>
                      <div className="space-y-2">
                        {[
                          { name: "Acme Rebrand", hours: emp.hours ? emp.hours * 0.7 : 28, cost: emp.grossPay * 0.7 },
                          { name: "Mobile App V2", hours: emp.hours ? emp.hours * 0.2 : 8, cost: emp.grossPay * 0.2 },
                          { name: "Internal / Admin", hours: emp.hours ? emp.hours * 0.1 : 4, cost: emp.grossPay * 0.1 },
                        ].map((proj) => (
                          <div key={proj.name} className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{proj.name}</p>
                              <p className="text-[10px] text-slate-500">{proj.hours.toFixed(1)} hours logged</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">{fmt(proj.cost)}</p>
                              <p className="text-[9px] text-slate-400 font-medium">Allocated Labor</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  EMPLOYEE TABLE                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */
function EmployeeTable() {
  const { employees, selectedIds, selectAll, deselectAll, searchQuery, filterDepartment, filterPayType, filterStatus, showFlaggedOnly } = usePayrollRunStore();

  const filtered = useMemo(() => {
    let list = [...employees];
    if (searchQuery) list = list.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterDepartment !== "all") list = list.filter((e) => e.department === filterDepartment);
    if (filterPayType !== "all") list = list.filter((e) => e.payType === filterPayType);
    if (filterStatus !== "all") list = list.filter((e) => e.verifyStatus === filterStatus);
    if (showFlaggedOnly) list = list.filter((e) => e.verifyStatus === "flagged" || e.verifyStatus === "error");
    return list;
  }, [employees, searchQuery, filterDepartment, filterPayType, filterStatus, showFlaggedOnly]);

  const allSelected = filtered.length > 0 && filtered.every((e) => selectedIds.has(e.id));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <th className="pl-4 pr-2 py-3">
                <input type="checkbox" checked={allSelected} onChange={() => allSelected ? deselectAll() : selectAll()}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
              </th>
              <th className="px-1 py-3 w-8" />
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Employee</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Type</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Hours</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Gross Pay</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Deductions</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Net Pay</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Status</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => <EmployeeRow key={emp.id} emp={emp} />)}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
          No employees match your filters.
        </div>
      )}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        Showing {filtered.length} of {employees.length} employees
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  STICKY BOTTOM BAR                                                        */
/* ═══════════════════════════════════════════════════════════════════════════ */
function StickyBottomBar() {
  const { employees, setShowApprovalModal, runState } = usePayrollRunStore();
  const allVerified = employees.every((e) => e.verifyStatus === "verified");
  const hasErrors = employees.some((e) => e.verifyStatus === "error");
  const [saved, setSaved] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePreview = () => {
    setPreviewing(true);
    setTimeout(() => setPreviewing(false), 1500);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[50] lg:ml-[72px] xl:ml-[240px]">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Status */}
          <div className="flex items-center gap-2">
            {allVerified ? (
              <><CheckCircle2 size={16} className="text-emerald-500" /><span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">All employees verified ✓</span></>
            ) : hasErrors ? (
              <><AlertCircle size={16} className="text-red-500" /><span className="text-sm font-bold text-red-600 dark:text-red-400">Resolve errors before submitting</span></>
            ) : (
              <><Clock size={16} className="text-slate-400" /><span className="text-sm font-medium text-slate-500">Some employees pending verification</span></>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={handleSave}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"} border`}>
              {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Draft</>}
            </button>
            <button onClick={handlePreview} disabled={previewing} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
              {previewing ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />} {previewing ? "Generating..." : "Preview Full Report"}
            </button>
            <button onClick={() => setShowApprovalModal(true)} disabled={hasErrors || runState !== "draft"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 disabled:transform-none">
              <Send size={15} /> Submit for Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function RunPayrollPage() {
  const { setEmployees, setApprovers, updateEmployee, runState } = usePayrollRunStore();
  const [changedEmployeesCount, setChangedEmployeesCount] = useState(0);
  const [recalculating, setRecalculating] = useState(false);
  const [timeImportSummary, setTimeImportSummary] = useState<TimeImportSummary | null>(null);
  const [importingHours, setImportingHours] = useState(false);

  const loadDeductions = useCallback(async () => {
    setRecalculating(true);
    try {
      const response = await fetch("/api/payroll/runs/draft-preview/deductions", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load payroll deductions");

      const lines: BenefitDeductionLine[] = await response.json();
      setChangedEmployeesCount(Number(response.headers.get("X-Benefits-Changed-Employees") || "0"));

      const linesByEmployeeId = new Map<string, BenefitDeductionLine[]>();
      lines.forEach((line) => {
        const key = String(line.employeeId);
        const existing = linesByEmployeeId.get(key) || [];
        existing.push(line);
        linesByEmployeeId.set(key, existing);
      });

      const currentEmployees = usePayrollRunStore.getState().employees;
      const payrollEmployees = currentEmployees.length > 0 ? currentEmployees : MOCK_EMPLOYEES;

      payrollEmployees.forEach((employee) => {
        const benefitDeductions = linesByEmployeeId.get(employee.id) || [];
        const totalBenefits = totalDeductionsForEmployee(benefitDeductions);

        updateEmployee(employee.id, {
          deductions: totalBenefits,
          benefitDeductions,
          netPay: roundCurrency(employee.grossPay - totalTaxesForEmployee(employee) - totalBenefits),
        });
      });
    } catch (error) {
      console.error("[Payroll Run Deductions]", error);
    } finally {
      setRecalculating(false);
    }
  }, [updateEmployee]);

  const loadTimesheetHours = useCallback(async (missingMode: "skip" | "scheduled" = "skip") => {
    setImportingHours(true);
    try {
      const suffix = missingMode === "scheduled" ? "?missing=scheduled" : "";
      const response = await fetch(`/api/payroll/runs/draft-preview/time-import${suffix}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to import timesheet hours");

      const result: TimeImportApiResult = await response.json();
      setTimeImportSummary(result.summary);

      const importsByEmployeeId = new Map(result.imports.map((line) => [String(line.employeeId), line]));
      const currentEmployees = usePayrollRunStore.getState().employees;
      const payrollEmployees = currentEmployees.length > 0 ? currentEmployees : MOCK_EMPLOYEES;

      payrollEmployees.forEach((employee) => {
        const imported = importsByEmployeeId.get(employee.id);
        if (!imported || employee.payType !== "hourly") return;

        const grossPay = calculateHourlyGross(employee, imported.totalHours);
        updateEmployee(employee.id, {
          hours: imported.totalHours,
          grossPay,
          netPay: roundCurrency(grossPay - totalTaxesForEmployee(employee) - employee.deductions),
          timesheetImport: {
            source: imported.source,
            regularHours: imported.regularHours,
            overtimeHours: imported.overtimeHours,
            doubleTimeHours: imported.doubleTimeHours,
            totalHours: imported.totalHours,
            importedAt: imported.importedAt,
            lateWithinCutoff: imported.lateWithinCutoff,
            partialPeriodReason: imported.partialPeriodReason,
            days: imported.days,
          },
        });
      });
    } catch (error) {
      console.error("[Payroll Run Time Import]", error);
    } finally {
      setImportingHours(false);
    }
  }, [updateEmployee]);

  useEffect(() => {
    setEmployees(MOCK_EMPLOYEES);
    setApprovers(MOCK_APPROVERS);
  }, [setEmployees, setApprovers]);

  useEffect(() => {
    void loadDeductions();
  }, [loadDeductions]);

  useEffect(() => {
    void loadTimesheetHours();
  }, [loadTimesheetHours]);

  return (
    <>
      <div className="flex flex-col gap-5 pb-24">
        <RunHeader />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
          <SummaryCards />
          <VerificationPanel />
        </div>

        <BenefitsChangedBanner
          changedEmployeesCount={changedEmployeesCount}
          recalculating={recalculating}
          onRecalculate={() => { void loadDeductions(); }}
        />
        <TimeImportPreflight
          summary={timeImportSummary}
          importing={importingHours}
          onImport={() => { void loadTimesheetHours(); }}
          onUseScheduledHours={() => { void loadTimesheetHours("scheduled"); }}
        />
        <FilterBar />
        <BulkActionsBar />
        <EmployeeTable />
      </div>

      {/* Sticky Bottom */}
      {runState === "draft" && <StickyBottomBar />}

      {/* Modals & Overlays */}
      <BreakdownModal />
      <FlagReasonModal />
      <ApprovalModal />
      <ProcessingOverlay />
    </>
  );
}
