"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users, FileWarning, DollarSign, FileText, Search, Filter, ChevronRight,
  MoreHorizontal, UserPlus, Send, AlertTriangle, CheckCircle2, Clock,
  Eye, Ban, ArrowUpRight, TrendingUp, XCircle
} from "lucide-react";
import { mockContractors, mockInvoices, mockContracts, getContractorStats, type Contractor, type ContractorStatus } from "@/data/mockContractors";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";

/* ─── Sub-Navigation ──────────────────────────────────────────── */
const SUB_NAV = [
  { label: "Dashboard", href: "/contractors" },
  { label: "Onboarding", href: "/contractors/onboarding" },
  { label: "Contracts", href: "/contractors/contracts" },
  { label: "Payments", href: "/contractors/payments" },
  { label: "1099s", href: "/contractors/1099s" },
  { label: "Contractor Portal", href: "/contractors/portal" },
];

function ContractorSubNav({ active }: { active: string }) {
  return (
    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm overflow-x-auto">
      {SUB_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
            active === item.href
              ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 shadow-sm border border-orange-200 dark:border-orange-800"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export { ContractorSubNav, SUB_NAV };

/* ─── Stat Card ───────────────────────────────────────────────── */

function StatCard({ icon: Icon, iconBg, iconColor, label, value, subtext, href }: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  subtext?: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-800 transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </div>
        {href && (
          <ArrowUpRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-orange-500 transition-colors" />
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      {subtext && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{subtext}</p>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

/* ─── Status Badge ────────────────────────────────────────────── */

function StatusBadge({ status }: { status: ContractorStatus }) {
  const config = {
    Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    Inactive: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    Onboarding: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  }[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config}`}>
      {status}
    </span>
  );
}

function W9Badge({ status }: { status: string }) {
  const config: Record<string, string> = {
    Collected: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    Expired: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    "Not Submitted": "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${config[status] || config["Not Submitted"]}`}>
      {status === "Collected" && <CheckCircle2 size={10} />}
      {status === "Pending" && <Clock size={10} />}
      {status === "Expired" && <AlertTriangle size={10} />}
      {status === "Not Submitted" && <XCircle size={10} />}
      {status}
    </span>
  );
}

/* ─── Main Dashboard ──────────────────────────────────────────── */

export default function ContractorsDashboard() {
  const stats = getContractorStats();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const fmtMoney = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);

  const filteredContractors = useMemo(() => {
    return mockContractors.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.businessName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  // Pending invoices for alert
  const pendingInvoices = mockInvoices.filter((inv) => inv.status === "Pending");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Users size={20} className="text-white" />
            </div>
            Contractor Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Manage 1099 contractors, contracts, invoices, and tax filings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contractors/onboarding"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30"
          >
            <UserPlus size={16} /> Invite Contractor
          </Link>
        </div>
      </div>

      {/* Sub-Navigation */}
      <ContractorSubNav active="/contractors" />

      {/* Alert Banner — Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                {pendingInvoices.length} invoice{pendingInvoices.length > 1 ? "s" : ""} awaiting review
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Total: {fmtMoney(pendingInvoices.reduce((s, i) => s + i.amount, 0))}
              </p>
            </div>
          </div>
          <Link
            href="/contractors/payments"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          iconColor="text-emerald-600"
          label="Active Contractors"
          value={stats.active}
          subtext="Currently engaged"
          href="/contractors"
        />
        <StatCard
          icon={FileWarning}
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          iconColor="text-amber-600"
          label="Pending W-9s"
          value={stats.pendingW9}
          subtext="Needs attention"
          href="/contractors/onboarding"
        />
        <StatCard
          icon={DollarSign}
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600"
          label="Payments This Month"
          value={fmtMoney(stats.paymentsThisMonth)}
          subtext="Approved + Paid"
          href="/contractors/payments"
        />
        <StatCard
          icon={FileText}
          iconBg="bg-violet-50 dark:bg-violet-900/20"
          iconColor="text-violet-600"
          label="1099s Due"
          value={stats.necs1099Due}
          subtext="Draft / Ready to file"
          href="/contractors/1099s"
        />
      </div>

      {/* Contractors Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">All Contractors</h3>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[11px] font-bold">
              {filteredContractors.length}
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contractors..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium tracking-wide">
              <tr>
                <th className="px-5 py-3.5">Contractor</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">W-9 Status</th>
                <th className="px-5 py-3.5 text-right">YTD Payments</th>
                <th className="px-5 py-3.5">Contract Expires</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContractors.map((c) => {
                // Find first active contract for this contractor
                const contract = mockContracts.find(
                  (con: any) => con.contractorId === c.id && con.status === "Active"
                );
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {c.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.businessName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-4">
                      <W9Badge status={c.w9Status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-bold ${c.ytdPayments > 0 ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                        {fmtMoney(c.ytdPayments)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {contract ? (
                        <div>
                          <p className="text-sm text-slate-900 dark:text-white font-medium">{formatDate(contract.endDate)}</p>
                          {contract.daysUntilExpiry <= 30 && (
                            <p className="text-[10px] font-bold text-red-600 flex items-center gap-1 mt-0.5">
                              <AlertTriangle size={10} /> {contract.daysUntilExpiry} days left
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/contractors/onboarding?id=${c.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>
                        {c.status === "Onboarding" && (
                          <button
                            onClick={() => {
                              toast.success("Reminder sent", { description: `Onboarding reminder sent to ${c.email}` });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                            title="Send Reminder"
                          >
                            <Send size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredContractors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No contractors found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
