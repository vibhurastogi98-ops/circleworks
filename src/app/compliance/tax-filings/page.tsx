"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Download, Filter, CheckCircle2, Clock, AlertTriangle,
  Search, FileText, ExternalLink
} from "lucide-react";
import { taxFilings, type TaxFilingStatus } from "@/data/mockCompliance";
import { toast } from "sonner";

const STATUS_CONFIG: Record<TaxFilingStatus, { label: string; color: string; icon: React.ElementType }> = {
  filed: { label: "Filed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800", icon: CheckCircle2 },
  upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: Clock },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800", icon: AlertTriangle },
};

export default function TaxFilingsPage() {
  const [statusFilter, setStatusFilter] = useState<TaxFilingStatus | "all">("all");
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const jurisdictions = Array.from(new Set(taxFilings.map((f) => f.jurisdiction)));

  const filtered = taxFilings.filter((f) => {
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    if (jurisdictionFilter !== "all" && f.jurisdiction !== jurisdictionFilter) return false;
    if (search && !f.formName.toLowerCase().includes(search.toLowerCase()) && !f.formNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filedCount = taxFilings.filter((f) => f.status === "filed").length;
  const upcomingCount = taxFilings.filter((f) => f.status === "upcoming").length;
  const overdueCount = taxFilings.filter((f) => f.status === "overdue").length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/compliance/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tax Filings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Federal and state tax filing calendar and status.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
          <Download size={16} /> Export
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => setStatusFilter(statusFilter === "filed" ? "all" : "filed")} className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm text-left transition-all ${statusFilter === "filed" ? "border-green-400 dark:border-green-600 ring-2 ring-green-100 dark:ring-green-900/30" : "border-slate-200 dark:border-slate-800 hover:border-green-300"}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Filed</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{filedCount}</div>
        </button>
        <button onClick={() => setStatusFilter(statusFilter === "upcoming" ? "all" : "upcoming")} className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm text-left transition-all ${statusFilter === "upcoming" ? "border-blue-400 dark:border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/30" : "border-slate-200 dark:border-slate-800 hover:border-blue-300"}`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-blue-500" />
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Upcoming</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{upcomingCount}</div>
        </button>
        <button onClick={() => setStatusFilter(statusFilter === "overdue" ? "all" : "overdue")} className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm text-left transition-all ${statusFilter === "overdue" ? "border-red-400 dark:border-red-600 ring-2 ring-red-100 dark:ring-red-900/30" : "border-slate-200 dark:border-slate-800 hover:border-red-300"}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Overdue</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{overdueCount}</div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={jurisdictionFilter}
          onChange={(e) => setJurisdictionFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Jurisdictions</option>
          {jurisdictions.map((j) => (
            <option key={j} value={j}>{j === "federal" ? "Federal" : j}</option>
          ))}
        </select>
        {(statusFilter !== "all" || jurisdictionFilter !== "all" || search) && (
          <button
            onClick={() => { setStatusFilter("all"); setJurisdictionFilter("all"); setSearch(""); }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Filings Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Form</th>
                <th className="px-6 py-3">Form Name</th>
                <th className="px-6 py-3">Jurisdiction</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Filed Date</th>
                <th className="px-6 py-3">Confirmation #</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((filing) => {
                const cfg = STATUS_CONFIG[filing.status];
                const StatusIcon = cfg.icon;
                return (
                  <tr key={filing.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-slate-400" />
                        <span className="font-bold text-slate-900 dark:text-white">{filing.formNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[250px] truncate">{filing.formName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        filing.jurisdiction === "federal"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      }`}>
                        {filing.jurisdiction === "federal" ? "Federal" : filing.jurisdiction}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                      {new Date(filing.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                        <StatusIcon size={10} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {filing.filedDate
                        ? new Date(filing.filedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "—"
                      }
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{filing.confirmationNumber || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      {filing.status === "upcoming" && filing.supportsFiling ? (
                        <button onClick={() => toast.success(`Initiated filing for ${filing.formNumber}`, { description: "You will be redirected to the filing wizard." })} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
                          File Now
                        </button>
                      ) : filing.status === "overdue" ? (
                        <button onClick={() => toast.success(`Initiated late filing for ${filing.formNumber}`, { description: "Please complete this immediately to minimize penalties." })} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
                          File Now
                        </button>
                      ) : filing.status === "filed" ? (
                        <button onClick={() => toast.info(`Viewing ${filing.formNumber}`, { description: `Confirmation #${filing.confirmationNumber}` })} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                          View
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No filings match your filters.
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
