"use client";

import React, { useState, useMemo } from "react";
import {
  DollarSign, Music, Film, TrendingUp, Gift, Clock, CheckCircle2,
  AlertTriangle, Upload, Download, Search, Eye, X, Plus,
  ArrowUpRight, Calendar, BarChart3, Repeat, CreditCard,
  FileText, ThumbsUp, Loader2, Info, Percent, Hash
} from "lucide-react";
import {
  mockSupplementalPayments,
  mockRoyaltySchedules,
  mockResidualPayments,
  getSupplementalStats,
  type SupplementalPayment,
  type SupplementalPaymentType,
  type RoyaltySchedule,
  type ResidualPayment,
} from "@/data/mockSupplementalPayments";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";

/* ─── Payment Type Config ─────────────────────────────────────── */

const PAYMENT_TYPE_CONFIG: Record<SupplementalPaymentType, { icon: React.ElementType; color: string; bgColor: string }> = {
  Royalty: { icon: Music, color: "text-violet-600", bgColor: "bg-violet-50 dark:bg-violet-900/20" },
  Residual: { icon: Film, color: "text-cyan-600", bgColor: "bg-cyan-50 dark:bg-cyan-900/20" },
  Advance: { icon: TrendingUp, color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
  Commission: { icon: Percent, color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
  "Signing Bonus": { icon: Gift, color: "text-pink-600", bgColor: "bg-pink-50 dark:bg-pink-900/20" },
};

/* ─── Tabs ─────────────────────────────────────────────────────── */

type Tab = "payments" | "schedules" | "residuals" | "tax";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "payments", label: "Supplemental Payments", icon: DollarSign },
  { id: "schedules", label: "Royalty Schedules", icon: Calendar },
  { id: "residuals", label: "Residual Tracker", icon: Film },
  { id: "tax", label: "Tax Treatment", icon: FileText },
];

/* ─── Status Badge ─────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    Approved: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    Held: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800",
    Recouping: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    Paused: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    Completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    Draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    Imported: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    Verified: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    Disputed: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800",
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </div>
        <ArrowUpRight size={16} className="text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      {subtext && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{subtext}</p>
      )}
    </div>
  );
}

/* ─── Payment Detail Drawer ────────────────────────────────────── */

function PaymentDrawer({ payment, onClose }: { payment: SupplementalPayment; onClose: () => void }) {
  const typeConfig = PAYMENT_TYPE_CONFIG[payment.paymentType];
  const TypeIcon = typeConfig.icon;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${typeConfig.bgColor} flex items-center justify-center`}>
              <TypeIcon size={20} className={typeConfig.color} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{payment.paymentType}</h3>
              <p className="text-xs text-slate-500">{payment.recipientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Amount */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Amount</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ${payment.amount.toLocaleString()}
              </div>
            </div>
            <StatusBadge status={payment.status} />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Recipient Type</div>
              <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                payment.recipientType === "W-2 Employee"
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  : "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
              }`}>
                {payment.recipientType}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tax Treatment</div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">{payment.taxTreatment}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Scheduled Date</div>
              <div className="text-sm text-slate-900 dark:text-white font-medium">{formatDate(payment.scheduledDate)}</div>
            </div>
            {payment.paidDate && (
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Paid Date</div>
                <div className="text-sm text-slate-900 dark:text-white font-medium">{formatDate(payment.paidDate)}</div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{payment.description}</p>
          </div>

          {/* Project */}
          {payment.projectTitle && (
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Project / Title</div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{payment.projectTitle}</p>
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Info size={14} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">Note</span>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-300">{payment.notes}</p>
            </div>
          )}

          {/* Actions */}
          {payment.status === "Pending" && (
            <div className="flex gap-3">
              <button
                onClick={() => { toast.success("Payment approved & queued"); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                <ThumbsUp size={14} /> Approve
              </button>
              <button
                onClick={() => { toast.info("Payment held for review"); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Hold
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Schedule Detail Drawer ───────────────────────────────────── */

function ScheduleDrawer({ schedule, onClose }: { schedule: RoyaltySchedule; onClose: () => void }) {
  const hasUnrecoupedAdvance = schedule.advanceBalance > 0 && schedule.totalRecouped < schedule.advanceBalance;
  const remainingAdvance = Math.max(0, schedule.advanceBalance - schedule.totalRecouped);
  const recoupmentPercent = schedule.advanceBalance > 0 ? Math.min(100, (schedule.totalRecouped / schedule.advanceBalance) * 100) : 100;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{schedule.projectTitle}</h3>
            <p className="text-xs text-slate-500">{schedule.recipientName} — {schedule.recipientType}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Rate */}
          <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl p-5">
            <div className="text-xs font-bold text-violet-600 uppercase mb-2">Royalty Rate</div>
            <div className="text-2xl font-black text-violet-800 dark:text-violet-300">
              {schedule.royaltyType === "Percentage" ? `${schedule.rate}%` : `$${schedule.rate}`}
              <span className="text-sm font-medium text-violet-500 ml-2">{schedule.rateUnit}</span>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Frequency</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{schedule.frequency}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Status</div>
              <StatusBadge status={schedule.status} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Total Earned</div>
              <div className="text-sm font-bold text-emerald-600">${schedule.totalEarned.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Next Payment</div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(schedule.nextPaymentDate)}</div>
            </div>
            {schedule.unitsSold > 0 && (
              <>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Units Sold</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{schedule.unitsSold.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Unit Threshold</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{schedule.unitsThreshold.toLocaleString()}</div>
                </div>
              </>
            )}
          </div>

          {/* Advance Recoupment */}
          {schedule.advanceBalance > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Repeat size={14} className="text-orange-600" />
                <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase">Advance Recoupment</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-orange-700 dark:text-orange-300">Original Advance</span>
                <span className="font-bold">${schedule.advanceBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-orange-700 dark:text-orange-300">Recouped So Far</span>
                <span className="font-bold text-emerald-600">${schedule.totalRecouped.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 bg-orange-200 dark:bg-orange-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${recoupmentPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-orange-600">{recoupmentPercent.toFixed(0)}% recouped</span>
                {hasUnrecoupedAdvance && (
                  <span className="font-bold text-orange-700 dark:text-orange-400">${remainingAdvance.toLocaleString()} remaining</span>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-slate-400">Created {formatDate(schedule.createdDate)}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────── */

export default function SupplementalPaymentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("payments");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedPayment, setSelectedPayment] = useState<SupplementalPayment | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<RoyaltySchedule | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const stats = getSupplementalStats();
  const fmtMoney = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);

  const filteredPayments = useMemo(() => {
    return mockSupplementalPayments.filter((p) => {
      const matchSearch = p.recipientName.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "All" || p.paymentType === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter]);

  const handleCSVImport = async () => {
    setIsImporting(true);
    await new Promise((r) => setTimeout(r, 2000));
    toast.success("CSV imported successfully", { description: "6 residual payment records imported from talent agency file." });
    setIsImporting(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <DollarSign size={20} className="text-white" />
            </div>
            Supplemental Payments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Royalties, residuals, advances, commissions, and signing bonuses for creators and talent.
          </p>
        </div>
        <button
          onClick={() => toast.info("New payment form — coming soon")}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-600/20"
        >
          <Plus size={16} /> New Payment
        </button>
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
                  ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 shadow-sm border border-violet-200 dark:border-violet-800"
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
          icon={Clock}
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          iconColor="text-amber-600"
          label="Pending Payments"
          value={stats.pendingCount}
          subtext={fmtMoney(stats.pendingTotal)}
        />
        <StatCard
          icon={ThumbsUp}
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600"
          label="Approved / Queued"
          value={stats.approvedCount}
          subtext={fmtMoney(stats.approvedTotal)}
        />
        <StatCard
          icon={Calendar}
          iconBg="bg-violet-50 dark:bg-violet-900/20"
          iconColor="text-violet-600"
          label="Active Schedules"
          value={stats.activeSchedules}
          subtext="Royalty auto-pay"
        />
        <StatCard
          icon={Repeat}
          iconBg="bg-orange-50 dark:bg-orange-900/20"
          iconColor="text-orange-600"
          label="Unrecouped Advances"
          value={fmtMoney(stats.unrecoupedAdvances)}
          subtext="Pending recoupment"
        />
      </div>

      {/* ── Tab: Supplemental Payments ─────────────────────────── */}
      {activeTab === "payments" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">All Payments</h3>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[11px] font-bold">
                {filteredPayments.length}
              </span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search payments..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 dark:text-white"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="All">All Types</option>
                <option value="Royalty">Royalty</option>
                <option value="Residual">Residual</option>
                <option value="Advance">Advance</option>
                <option value="Commission">Commission</option>
                <option value="Signing Bonus">Signing Bonus</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Recipient</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5">Tax Treatment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map((p) => {
                  const tc = PAYMENT_TYPE_CONFIG[p.paymentType];
                  const TypeIcon = tc.icon;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group cursor-pointer" onClick={() => setSelectedPayment(p)}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {p.recipientName.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">{p.recipientName}</p>
                            <p className="text-[10px] text-slate-500">{p.recipientType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold ${tc.bgColor} ${tc.color}`}>
                          <TypeIcon size={12} />
                          {p.paymentType}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300 max-w-[250px] truncate">{p.description}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-slate-900 dark:text-white">{fmtMoney(p.amount)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{p.taxTreatment}</span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedPayment(p); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No supplemental payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Royalty Schedules ─────────────────────────────── */}
      {activeTab === "schedules" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Royalty Schedules</h3>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-600/20">
              <Plus size={16} /> New Schedule
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockRoyaltySchedules.map((s) => {
              const hasAdvance = s.advanceBalance > 0;
              const recoupPct = hasAdvance ? Math.min(100, (s.totalRecouped / s.advanceBalance) * 100) : 100;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSchedule(s)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-violet-300 dark:hover:border-violet-800 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">{s.projectTitle}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.recipientName} — {s.recipientType}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Rate</p>
                      <p className="text-sm font-bold text-violet-600">
                        {s.royaltyType === "Percentage" ? `${s.rate}%` : `$${s.rate}`}
                        <span className="text-[10px] font-medium text-slate-400 ml-1">{s.rateUnit}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Frequency</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{s.frequency}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Total Earned</p>
                      <p className="text-sm font-bold text-emerald-600">${s.totalEarned.toLocaleString()}</p>
                    </div>
                  </div>

                  {hasAdvance && (
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] font-bold text-orange-600 mb-1">
                        <span>Advance Recoupment</span>
                        <span>{recoupPct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all" style={{ width: `${recoupPct}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400">Next: {formatDate(s.nextPaymentDate)}</span>
                    {s.unitsSold > 0 && (
                      <span className="text-[10px] font-bold text-slate-500">{s.unitsSold.toLocaleString()} units sold</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab: Residual Tracker ─────────────────────────────── */}
      {activeTab === "residuals" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Residual Payment Tracker</h3>
              <p className="text-xs text-slate-500 mt-1">Entertainment industry residual payments — SAG-AFTRA, talent agency imports.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCSVImport}
                disabled={isImporting}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {isImporting ? "Importing..." : "Import CSV"}
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-cyan-600/20">
                <Download size={16} /> Export
              </button>
            </div>
          </div>

          {/* Batch Info */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
            <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Batch Processing</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Import CSV files from talent agency systems (SAG-AFTRA, casting platforms). Each row maps to show title, network, reuse type, scale, and 1099 category automatically.
              </p>
            </div>
          </div>

          {/* Residuals Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium tracking-wide">
                  <tr>
                    <th className="px-5 py-3.5">Talent</th>
                    <th className="px-5 py-3.5">Show / Title</th>
                    <th className="px-5 py-3.5">Network</th>
                    <th className="px-5 py-3.5">Reuse Type</th>
                    <th className="px-5 py-3.5">Scale</th>
                    <th className="px-5 py-3.5 text-right">Amount</th>
                    <th className="px-5 py-3.5">1099 Category</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockResidualPayments.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold">
                            {r.talentName.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">{r.talentName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">{r.showTitle}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-xs font-bold">{r.network}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs">{r.reuseType}</td>
                      <td className="px-5 py-4 text-xs text-slate-500">{r.scale}</td>
                      <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">{fmtMoney(r.amount)}</td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">{r.category1099}</span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Tax Treatment ────────────────────────────────── */}
      {activeTab === "tax" && (
        <div className="flex flex-col gap-6 max-w-4xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tax Treatment by Payment Type</h3>

          <div className="grid grid-cols-1 gap-4">
            {/* Royalties */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                  <Music size={20} className="text-violet-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Royalties</h4>
                  <p className="text-xs text-slate-500">Intellectual property, patents, creative works</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase mb-2">W-2 Employees</p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">Taxed at <strong>supplemental flat rate (22%)</strong>. Added to regular paycheck as a supplemental earning line.</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase mb-2">1099 Contractors</p>
                  <p className="text-sm text-orange-800 dark:text-orange-300">Reported on <strong>1099-MISC Box 2</strong> (Royalties). No withholding unless backup withholding applies.</p>
                </div>
              </div>
            </div>

            {/* Residuals */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
                  <Film size={20} className="text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Residuals</h4>
                  <p className="text-xs text-slate-500">SAG-AFTRA, entertainment industry reuse payments</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">Treated as <strong>supplemental wages (22%)</strong> for W-2 talent. For 1099 contractors, reported on <strong>1099-MISC Box 2</strong>. SAG-AFTRA pension & health contributions apply per collective bargaining agreement.</p>
              </div>
            </div>

            {/* Advances */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                  <TrendingUp size={20} className="text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Advances Against Royalties</h4>
                  <p className="text-xs text-slate-500">Paid before earnings are realized</p>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>Non-taxable</strong> when paid. Tax liability shifts to the royalty payments as they are earned and the advance is recouped. Track recoupment schedule carefully — once the advance is fully recouped, subsequent payments become taxable income.
                  </p>
                </div>
              </div>
            </div>

            {/* Commission */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <Percent size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Commissions</h4>
                  <p className="text-xs text-slate-500">Revenue-based with tier support</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">Classified as <strong>supplemental wages</strong>, taxed at the flat 22% federal rate (37% if over $1M in supplemental compensation for the year). Subject to all payroll taxes (FICA, FUTA, state).</p>
              </div>
            </div>

            {/* Signing Bonus */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
                  <Gift size={20} className="text-pink-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Signing Bonuses</h4>
                  <p className="text-xs text-slate-500">Optional repayment agreement if tenure &lt; X months</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">Taxed as <strong>supplemental wages (22%)</strong>. If a repayment clause is triggered, the employee may claim a deduction on their personal return for the repaid amount, or the employer can adjust W-2 if repayment is in the same tax year.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawers */}
      {selectedPayment && <PaymentDrawer payment={selectedPayment} onClose={() => setSelectedPayment(null)} />}
      {selectedSchedule && <ScheduleDrawer schedule={selectedSchedule} onClose={() => setSelectedSchedule(null)} />}
    </div>
  );
}
