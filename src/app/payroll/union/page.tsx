"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Users, Shield, DollarSign, FileText, Download, Search, Eye, X,
  Plus, ArrowUpRight, Calendar, BarChart3, Building2, Hash, Clock,
  CheckCircle2, AlertTriangle, Loader2, Settings, ChevronRight,
  CreditCard, Percent, Heart, Briefcase, Film, Info, TrendingUp,
} from "lucide-react";
import {
  mockUnions,
  mockUnionContracts,
  mockEmployeeUnionMemberships,
  mockUnionPayrollCalcs,
  mockContributionReports,
  getUnionPayrollStats,
  type UnionConfig,
  type UnionContract,
  type EmployeeUnionMembership,
  type UnionPayrollCalc,
  type UnionContributionReport,
} from "@/data/mockUnionPayroll";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";

/* ─── Tabs ─────────────────────────────────────────────────────── */

type Tab = "overview" | "calculations" | "members" | "reports" | "fringe";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Union Overview", icon: Building2 },
  { id: "calculations", label: "Payroll Calculations", icon: DollarSign },
  { id: "members", label: "Member Directory", icon: Users },
  { id: "reports", label: "Contribution Reports", icon: FileText },
  { id: "fringe", label: "Fringe Benefits", icon: Heart },
];

/* ─── Union Color Map ──────────────────────────────────────────── */

const UNION_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  "SAG-AFTRA": { bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-700 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800", gradient: "from-violet-500 to-purple-600" },
  "IATSE": { bg: "bg-sky-50 dark:bg-sky-900/20", text: "text-sky-700 dark:text-sky-400", border: "border-sky-200 dark:border-sky-800", gradient: "from-sky-500 to-cyan-600" },
  "WGA": { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800", gradient: "from-amber-500 to-orange-600" },
  "DGA": { bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800", gradient: "from-rose-500 to-red-600" },
};

const getUnionColor = (abbr: string) => UNION_COLORS[abbr] || UNION_COLORS["SAG-AFTRA"];

/* ─── Status Badge ─────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    Inactive: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    Expired: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800",
    Upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    "On Leave": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    Draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    Generated: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    Submitted: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    Confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config[status] || config.Draft}`}>
      {status}
    </span>
  );
}

/* ─── Stat Card ────────────────────────────────────────────────── */

function StatCard({ icon: Icon, iconBg, iconColor, label, value, subtext }: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </div>
        <ArrowUpRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      {subtext && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{subtext}</p>
      )}
    </div>
  );
}

/* ─── Contract Detail Drawer ───────────────────────────────────── */

function ContractDrawer({ contract, onClose }: { contract: UnionContract; onClose: () => void }) {
  const uc = getUnionColor(contract.unionName);
  const totalFringeRate = contract.fringeBenefits.reduce((sum, fb) => sum + fb.rate, 0);
  const totalEmployerRate = contract.pensionRate + contract.healthWelfareRate + totalFringeRate;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${uc.gradient} flex items-center justify-center shadow-lg`}>
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{contract.unionName}</h3>
              <p className="text-xs text-slate-500">{contract.contractName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Contract Period */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Contract Period</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {formatDate(contract.effectiveDate)} — {formatDate(contract.expirationDate)}
              </div>
            </div>
            <StatusBadge status={contract.status} />
          </div>

          {/* Rate Grid */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Contribution Rates</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
                <p className="text-[10px] font-bold text-violet-600 uppercase mb-1">Union Dues</p>
                <p className="text-xl font-black text-violet-800 dark:text-violet-300">{contract.duesRate}%</p>
                <p className="text-[10px] text-violet-500">{contract.duesType === "percentage" ? "of earnings" : "flat"} • Employee</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Work Dues</p>
                <p className="text-xl font-black text-blue-800 dark:text-blue-300">{contract.workDuesRate}%</p>
                <p className="text-[10px] text-blue-500">of earnings • Employee</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Pension Fund</p>
                <p className="text-xl font-black text-emerald-800 dark:text-emerald-300">{contract.pensionRate}%</p>
                <p className="text-[10px] text-emerald-500">of earnings • Employer</p>
              </div>
              <div className="bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 rounded-xl p-4">
                <p className="text-[10px] font-bold text-pink-600 uppercase mb-1">Health & Welfare</p>
                <p className="text-xl font-black text-pink-800 dark:text-pink-300">{contract.healthWelfareRate}%</p>
                <p className="text-[10px] text-pink-500">of earnings • Employer</p>
              </div>
            </div>
          </div>

          {/* Fringe Benefits */}
          {contract.fringeBenefits.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Fringe Benefits</h4>
              <div className="flex flex-col gap-2">
                {contract.fringeBenefits.map((fb) => (
                  <div key={fb.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{fb.benefitName}</p>
                      <p className="text-[10px] text-slate-500">{fb.description}</p>
                    </div>
                    <span className="text-sm font-black text-orange-600">{fb.rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Employer Cost */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 rounded-xl p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Total Employer Burden</p>
            <p className="text-3xl font-black">{totalEmployerRate.toFixed(1)}%</p>
            <p className="text-xs text-slate-400 mt-1">Pension {contract.pensionRate}% + H&W {contract.healthWelfareRate}% + Fringe {totalFringeRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Member Detail Drawer ─────────────────────────────────────── */

function MemberDrawer({ membership, onClose }: { membership: EmployeeUnionMembership; onClose: () => void }) {
  const uc = getUnionColor(membership.unionAbbreviation);
  const allMemberships = mockEmployeeUnionMemberships.filter(m => m.employeeId === membership.employeeId);

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {membership.avatar}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{membership.employeeName}</h3>
              <p className="text-xs text-slate-500">{membership.department}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* All Union Memberships */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Union Affiliations ({allMemberships.length})</h4>
            <div className="flex flex-col gap-3">
              {allMemberships.map((m) => {
                const mc = getUnionColor(m.unionAbbreviation);
                return (
                  <div key={m.id} className={`${mc.bg} border ${mc.border} rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-black ${mc.text}`}>{m.unionAbbreviation}</span>
                      <StatusBadge status={m.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Member #</span>
                        <p className="font-bold text-slate-900 dark:text-white">{m.membershipNumber}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Joined</span>
                        <p className="font-bold text-slate-900 dark:text-white">{formatDate(m.joinDate)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Period Payroll Calculations */}
          {(() => {
            const calcs = mockUnionPayrollCalcs.filter(c => c.employeeName === membership.employeeName);
            if (calcs.length === 0) return null;
            return (
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Current Period Calculations</h4>
                <div className="flex flex-col gap-3">
                  {calcs.map((c) => (
                    <div key={c.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase">{c.unionAbbreviation} — {c.contractName}</span>
                        <span className="text-xs text-slate-400">{c.hoursWorked}h</span>
                      </div>
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-xs text-slate-500">Gross</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">${c.grossEarnings.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex justify-between">
                          <span className="text-red-500">Dues</span>
                          <span className="font-bold text-red-600">-${c.duesDeduction}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-500">Work Dues</span>
                          <span className="font-bold text-red-600">-${c.workDuesDeduction}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-500">Pension</span>
                          <span className="font-bold text-emerald-600">${c.pensionContribution}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-500">H&W</span>
                          <span className="font-bold text-emerald-600">${c.healthWelfareContribution}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────── */

export default function UnionPayrollPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [unionFilter, setUnionFilter] = useState("All");
  const [selectedContract, setSelectedContract] = useState<UnionContract | null>(null);
  const [selectedMember, setSelectedMember] = useState<EmployeeUnionMembership | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [unions, setUnions] = useState<UnionConfig[]>(mockUnions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUnions() {
      try {
        const res = await fetch("/api/payroll/unions");
        const data = await res.json();
        if (data.success && data.unions?.length > 0) {
          // Adapt DB model to UI model if names differ, though here they look similar
          setUnions(data.unions);
        }
      } catch (error) {
        console.error("Failed to load unions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUnions();
  }, []);

  const stats = getUnionPayrollStats();
  const fmtMoney = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);

  /* Filtered Members */
  const filteredMembers = useMemo(() => {
    return mockEmployeeUnionMemberships.filter((m) => {
      const matchSearch = m.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        m.membershipNumber.toLowerCase().includes(search.toLowerCase());
      const matchUnion = unionFilter === "All" || m.unionAbbreviation === unionFilter;
      return matchSearch && matchUnion;
    });
  }, [search, unionFilter]);

  /* Filtered Calculations */
  const filteredCalcs = useMemo(() => {
    return mockUnionPayrollCalcs.filter((c) => {
      const matchSearch = c.employeeName.toLowerCase().includes(search.toLowerCase());
      const matchUnion = unionFilter === "All" || c.unionAbbreviation === unionFilter;
      return matchSearch && matchUnion;
    });
  }, [search, unionFilter]);

  /* Filtered Reports */
  const filteredReports = useMemo(() => {
    return mockContributionReports.filter((r) => {
      const matchUnion = unionFilter === "All" || r.unionAbbreviation === unionFilter;
      return matchUnion;
    });
  }, [unionFilter]);

  /* Export CSV handler */
  const handleExportCSV = async (reportId: string) => {
    setIsExporting(reportId);
    try {
      const report = mockContributionReports.find(r => r.id === reportId);
      const res = await fetch("/api/payroll/union/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, format: report?.exportFormat }),
      });
      const data = await res.json();
      if (data.success) {
        // Create blob download
        const blob = new Blob([data.csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `union-report-${report?.unionAbbreviation}-${report?.reportMonth}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Report exported", { description: `${data.rowCount} records exported as ${report?.exportFormat}` });
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield size={20} className="text-white" />
            </div>
            Union Payroll
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            SAG-AFTRA, IATSE, WGA & DGA dues, pension, health fund contributions, and compliance reporting.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings/payroll/unions"
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Settings size={16} /> Configure Unions
          </Link>
          <button
            onClick={() => toast.info("Add union employee — coming soon")}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={16} /> Add Member
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-200 dark:border-indigo-800"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          iconBg="bg-indigo-50 dark:bg-indigo-900/20"
          iconColor="text-indigo-600"
          label="Active Unions"
          value={stats.activeUnions}
          subtext={`${stats.totalMemberships} total memberships`}
        />
        <StatCard
          icon={Users}
          iconBg="bg-violet-50 dark:bg-violet-900/20"
          iconColor="text-violet-600"
          label="Union Members"
          value={stats.totalMembers}
          subtext="Unique employees"
        />
        <StatCard
          icon={DollarSign}
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          iconColor="text-emerald-600"
          label="Employer Contributions"
          value={fmtMoney(stats.totalEmployerContributions)}
          subtext="Current period"
        />
        <StatCard
          icon={CreditCard}
          iconBg="bg-rose-50 dark:bg-rose-900/20"
          iconColor="text-rose-600"
          label="Employee Deductions"
          value={fmtMoney(stats.totalEmployeeDeductions)}
          subtext="Dues + work dues"
        />
      </div>

      {/* ── Tab: Overview ──────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* Union Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {unions.map((union) => {
              const uc = getUnionColor(union.abbreviation);
              const contracts = mockUnionContracts.filter(c => c.unionName === union.abbreviation);
              const members = mockEmployeeUnionMemberships.filter(m => m.unionAbbreviation === union.abbreviation && m.status !== "Inactive");
              const calcs = mockUnionPayrollCalcs.filter(c => c.unionAbbreviation === union.abbreviation);
              const totalEmployerCost = calcs.reduce((s, c) => s + c.totalEmployerContributions, 0);
              return (
                <div key={union.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  {/* Union Header with gradient bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${uc.gradient}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${uc.gradient} flex items-center justify-center shadow-lg`}>
                          <Shield size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">{union.abbreviation}</h3>
                          <p className="text-[10px] text-slate-500 max-w-[250px] truncate">{union.name}</p>
                        </div>
                      </div>
                      <StatusBadge status={union.status} />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Members</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{members.length}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Contracts</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{contracts.length}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Employer $</p>
                        <p className="text-lg font-black text-emerald-600">{fmtMoney(totalEmployerCost)}</p>
                      </div>
                    </div>

                    {/* Active contracts list */}
                    <div className="flex flex-col gap-2">
                      {contracts.slice(0, 2).map((contract) => (
                        <button
                          key={contract.id}
                          onClick={() => setSelectedContract(contract)}
                          className={`flex items-center justify-between w-full text-left ${uc.bg} border ${uc.border} rounded-lg px-3 py-2.5 hover:opacity-80 transition-all`}
                        >
                          <div>
                            <p className={`text-xs font-bold ${uc.text}`}>{contract.contractName}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Pension {contract.pensionRate}% · H&W {contract.healthWelfareRate}% · Dues {contract.duesRate}%
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                      ))}
                      {contracts.length > 2 && (
                        <p className="text-[10px] text-slate-400 text-center">+{contracts.length - 2} more contracts</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contribution Breakdown Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Current Period Contribution Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Dues</p>
                <p className="text-xl font-black text-violet-600">{fmtMoney(stats.totalDues)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Pension</p>
                <p className="text-xl font-black text-emerald-600">{fmtMoney(stats.totalPension)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Health & Welfare</p>
                <p className="text-xl font-black text-pink-600">{fmtMoney(stats.totalHW)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Fringe Benefits</p>
                <p className="text-xl font-black text-orange-600">{fmtMoney(stats.totalFringe)}</p>
              </div>
            </div>

            {/* Visual bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
              {[
                { value: stats.totalDues, color: "bg-violet-500", label: "Dues" },
                { value: stats.totalPension, color: "bg-emerald-500", label: "Pension" },
                { value: stats.totalHW, color: "bg-pink-500", label: "H&W" },
                { value: stats.totalFringe, color: "bg-orange-500", label: "Fringe" },
              ].map((item) => {
                const total = stats.totalDues + stats.totalPension + stats.totalHW + stats.totalFringe;
                const pct = total > 0 ? (item.value / total) * 100 : 25;
                return (
                  <div
                    key={item.label}
                    className={`${item.color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                    title={`${item.label}: ${fmtMoney(item.value)}`}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {[
                { color: "bg-violet-500", label: "Dues" },
                { color: "bg-emerald-500", label: "Pension" },
                { color: "bg-pink-500", label: "H&W" },
                { color: "bg-orange-500", label: "Fringe" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-[10px] font-bold text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Payroll Calculations ──────────────────────────── */}
      {activeTab === "calculations" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Pay Period: Apr 1–15, 2025</h3>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[11px] font-bold">
                {filteredCalcs.length} records
              </span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employees..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                />
              </div>
              <select
                value={unionFilter}
                onChange={(e) => setUnionFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="All">All Unions</option>
                {unions.map((u) => (
                  <option key={u.id} value={u.abbreviation}>{u.abbreviation}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Union</th>
                  <th className="px-5 py-3.5">Contract</th>
                  <th className="px-5 py-3.5 text-right">Gross</th>
                  <th className="px-5 py-3.5 text-right">Hours</th>
                  <th className="px-5 py-3.5 text-right text-red-500">Dues</th>
                  <th className="px-5 py-3.5 text-right text-red-500">Work Dues</th>
                  <th className="px-5 py-3.5 text-right text-emerald-600">Pension</th>
                  <th className="px-5 py-3.5 text-right text-emerald-600">H&W</th>
                  <th className="px-5 py-3.5 text-right text-orange-600">Fringe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCalcs.map((c) => {
                  const uc = getUnionColor(c.unionAbbreviation);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {c.employeeName.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">{c.employeeName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold ${uc.bg} ${uc.text}`}>
                          <Shield size={10} />
                          {c.unionAbbreviation}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-[160px] truncate">{c.contractName}</td>
                      <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">{fmtMoney(c.grossEarnings)}</td>
                      <td className="px-5 py-4 text-right text-slate-500">{c.hoursWorked}</td>
                      <td className="px-5 py-4 text-right font-mono text-red-600 font-bold">-${c.duesDeduction}</td>
                      <td className="px-5 py-4 text-right font-mono text-red-600 font-bold">-${c.workDuesDeduction}</td>
                      <td className="px-5 py-4 text-right font-mono text-emerald-600 font-bold">${c.pensionContribution}</td>
                      <td className="px-5 py-4 text-right font-mono text-emerald-600 font-bold">${c.healthWelfareContribution}</td>
                      <td className="px-5 py-4 text-right font-mono text-orange-600 font-bold">${c.fringeContribution}</td>
                    </tr>
                  );
                })}
                {/* Totals */}
                <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                  <td colSpan={3} className="px-5 py-4 text-right text-sm uppercase tracking-wider text-slate-500">Period Totals:</td>
                  <td className="px-5 py-4 text-right text-slate-900 dark:text-white">{fmtMoney(filteredCalcs.reduce((s, c) => s + c.grossEarnings, 0))}</td>
                  <td className="px-5 py-4 text-right text-slate-500">{filteredCalcs.reduce((s, c) => s + c.hoursWorked, 0)}</td>
                  <td className="px-5 py-4 text-right text-red-600">{fmtMoney(filteredCalcs.reduce((s, c) => s + c.duesDeduction, 0))}</td>
                  <td className="px-5 py-4 text-right text-red-600">{fmtMoney(filteredCalcs.reduce((s, c) => s + c.workDuesDeduction, 0))}</td>
                  <td className="px-5 py-4 text-right text-emerald-600">{fmtMoney(filteredCalcs.reduce((s, c) => s + c.pensionContribution, 0))}</td>
                  <td className="px-5 py-4 text-right text-emerald-600">{fmtMoney(filteredCalcs.reduce((s, c) => s + c.healthWelfareContribution, 0))}</td>
                  <td className="px-5 py-4 text-right text-orange-600">{fmtMoney(filteredCalcs.reduce((s, c) => s + c.fringeContribution, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pay Stub info */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
              <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Pay Stub Line Items</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Union Dues and Work Dues appear as employee deductions. Pension (employer match) and Health & Welfare appear as separate employer contribution line items on the pay stub.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Member Directory ──────────────────────────────── */}
      {activeTab === "members" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Union Members</h3>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[11px] font-bold">
                {filteredMembers.length}
              </span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or member #..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                />
              </div>
              <select
                value={unionFilter}
                onChange={(e) => setUnionFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="All">All Unions</option>
                {mockUnions.map((u) => (
                  <option key={u.id} value={u.abbreviation}>{u.abbreviation}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Union</th>
                  <th className="px-5 py-3.5">Membership #</th>
                  <th className="px-5 py-3.5">Join Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMembers.map((m) => {
                  const uc = getUnionColor(m.unionAbbreviation);
                  const memberUnionCount = mockEmployeeUnionMemberships.filter(em => em.employeeId === m.employeeId).length;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group cursor-pointer" onClick={() => setSelectedMember(m)}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {m.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{m.employeeName}</p>
                            {memberUnionCount > 1 && (
                              <p className="text-[10px] text-violet-500 font-bold">{memberUnionCount} unions</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{m.department}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold ${uc.bg} ${uc.text}`}>
                          <Shield size={10} />
                          {m.unionAbbreviation}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-slate-600 dark:text-slate-400">{m.membershipNumber}</td>
                      <td className="px-5 py-4 text-slate-500 text-sm">{formatDate(m.joinDate)}</td>
                      <td className="px-5 py-4"><StatusBadge status={m.status} /></td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedMember(m); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No union members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Contribution Reports ──────────────────────────── */}
      {activeTab === "reports" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Contribution Reports</h3>
              <p className="text-xs text-slate-500 mt-1">Generate and submit union contribution reports. Export as SAG-AFTRA portal CSV, IATSE CSV, or generic format.</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={unionFilter}
                onChange={(e) => setUnionFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="All">All Unions</option>
                {mockUnions.map((u) => (
                  <option key={u.id} value={u.abbreviation}>{u.abbreviation}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredReports.map((report) => {
              const uc = getUnionColor(report.unionAbbreviation);
              const isCurrentMonth = report.reportMonth === "2025-04";
              return (
                <div
                  key={report.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md ${
                    isCurrentMonth ? `${uc.border} border-2` : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className={`h-1 bg-gradient-to-r ${uc.gradient}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${uc.gradient} flex items-center justify-center`}>
                          <FileText size={18} className="text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white">{report.unionAbbreviation}</h4>
                            {isCurrentMonth && (
                              <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-[9px] font-black uppercase">Current</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{report.reportMonth}</p>
                        </div>
                      </div>
                      <StatusBadge status={report.status} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Earnings</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{fmtMoney(report.totalEarnings)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Pension</p>
                        <p className="text-sm font-bold text-emerald-600">{fmtMoney(report.totalPension)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">H&W</p>
                        <p className="text-sm font-bold text-pink-600">{fmtMoney(report.totalHealthWelfare)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Employees</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{report.employeeCount}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{report.exportFormat}</span>
                      <div className="flex items-center gap-2">
                        {(report.status === "Draft" || report.status === "Generated") && (
                          <button
                            onClick={() => {
                              toast.success("Report submitted to union portal");
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                          >
                            Submit
                          </button>
                        )}
                        <button
                          onClick={() => handleExportCSV(report.id)}
                          disabled={isExporting === report.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                          {isExporting === report.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                          CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab: Fringe Benefits ───────────────────────────────── */}
      {activeTab === "fringe" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fringe Benefits by Union Contract</h3>
              <p className="text-xs text-slate-500 mt-1">Configurable fringe rates per collective bargaining agreement — vacation accrual, holiday pay, annuity, training, etc.</p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Fringe rates vary by contract</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Each union&apos;s collective bargaining agreement specifies different fringe contribution rates. Rates shown below are employer-paid contributions that apply on top of pension and H&W funds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockUnionContracts.filter(c => c.fringeBenefits.length > 0).map((contract) => {
              const uc = getUnionColor(contract.unionName);
              const totalFringe = contract.fringeBenefits.reduce((sum, fb) => sum + fb.rate, 0);
              return (
                <div key={contract.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                  <div className={`h-1 bg-gradient-to-r ${uc.gradient}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${uc.bg} ${uc.text}`}>
                            <Shield size={10} />
                            {contract.unionName}
                          </span>
                          <StatusBadge status={contract.status} />
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{contract.contractName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total Fringe</p>
                        <p className="text-xl font-black text-orange-600">{totalFringe.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {contract.fringeBenefits.map((fb) => (
                        <div key={fb.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-3">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{fb.benefitName}</p>
                            <p className="text-[10px] text-slate-500">{fb.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, fb.rate * 10)}%` }}
                              />
                            </div>
                            <span className="text-sm font-black text-orange-600 w-14 text-right">{fb.rate}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Contract: {formatDate(contract.effectiveDate)} — {formatDate(contract.expirationDate)}
                      </span>
                      <button
                        onClick={() => setSelectedContract(contract)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        View Full Contract →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drawers */}
      {selectedContract && <ContractDrawer contract={selectedContract} onClose={() => setSelectedContract(null)} />}
      {selectedMember && <MemberDrawer membership={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  );
}
