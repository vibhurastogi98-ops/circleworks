"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Download, Search, CheckCircle2, Clock, AlertTriangle,
  AlertCircle, RefreshCw, Shield, FileCheck, ExternalLink
} from "lucide-react";
import { i9Records, type I9Status } from "@/data/mockCompliance";

const STATUS_CONFIG: Record<I9Status, { label: string; color: string; icon: React.ElementType }> = {
  complete: { label: "Complete", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800", icon: CheckCircle2 },
  pending: { label: "Pending", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: Clock },
  expiring: { label: "Expiring", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800", icon: AlertTriangle },
  expired: { label: "Expired", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800", icon: AlertCircle },
};

const EVERIFY_CONFIG: Record<string, { label: string; color: string }> = {
  verified: { label: "Verified", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  pending: { label: "Pending", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  case_closed: { label: "Case Closed", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
  referred: { label: "Referred", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  not_submitted: { label: "Not Submitted", color: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
};

export default function I9Page() {
  const [statusFilter, setStatusFilter] = useState<I9Status | "all">("all");
  const [search, setSearch] = useState("");
  const [reverifyModal, setReverifyModal] = useState<string | null>(null);

  const sorted = [...i9Records].sort((a, b) => {
    const order: Record<I9Status, number> = { expired: 0, expiring: 1, pending: 2, complete: 3 };
    return order[a.i9Status] - order[b.i9Status];
  });

  const filtered = sorted.filter((r) => {
    if (statusFilter !== "all" && r.i9Status !== statusFilter) return false;
    if (search && !r.employeeName.toLowerCase().includes(search.toLowerCase()) && !r.employeeId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    complete: i9Records.filter((r) => r.i9Status === "complete").length,
    pending: i9Records.filter((r) => r.i9Status === "pending").length,
    expiring: i9Records.filter((r) => r.i9Status === "expiring").length,
    expired: i9Records.filter((r) => r.i9Status === "expired").length,
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/compliance/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck size={22} className="text-blue-600" />
              I-9 Verification
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Audit log, re-verification, and E-Verify status for all employees.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
            <Download size={16} /> Export Audit Log
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(Object.keys(counts) as I9Status[]).map((status) => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(isActive ? "all" : status)}
              className={`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm text-left transition-all ${
                isActive ? "border-blue-400 dark:border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/30" : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={status === "expired" ? "text-red-500" : status === "expiring" ? "text-amber-500" : status === "pending" ? "text-blue-500" : "text-green-500"} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{cfg.label}</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{counts[status]}</div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>
        {(statusFilter !== "all" || search) && (
          <button onClick={() => { setStatusFilter("all"); setSearch(""); }} className="text-xs font-bold text-blue-600 dark:text-blue-400">
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Dept</th>
                <th className="px-6 py-3">I-9 Status</th>
                <th className="px-6 py-3">Expiry</th>
                <th className="px-6 py-3">Document</th>
                <th className="px-6 py-3">E-Verify</th>
                <th className="px-6 py-3">Case #</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((rec) => {
                const cfg = STATUS_CONFIG[rec.i9Status];
                const StatusIcon = cfg.icon;
                const ev = EVERIFY_CONFIG[rec.eVerifyStatus];
                return (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{rec.employeeName}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{rec.employeeId}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{rec.department}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                        <StatusIcon size={10} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                      {rec.expirationDate
                        ? new Date(rec.expirationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "N/A"
                      }
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[180px] truncate text-xs">{rec.documentType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ev.color}`}>
                        {ev.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{rec.eVerifyCaseNumber || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      {(rec.i9Status === "expired" || rec.i9Status === "expiring") && (
                        <button
                          onClick={() => setReverifyModal(rec.id)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1"
                        >
                          <RefreshCw size={12} /> Re-verify
                        </button>
                      )}
                      {rec.i9Status === "pending" && (
                        <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Re-verify Modal */}
      {reverifyModal && (() => {
        const rec = i9Records.find((r) => r.id === reverifyModal);
        if (!rec) return null;
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setReverifyModal(null)} />
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw size={18} className="text-amber-500" /> I-9 Section 3 Re-verification
                </h3>
                <p className="text-sm text-slate-500 mt-1">{rec.employeeName} — {rec.employeeId}</p>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Current Document</label>
                  <p className="text-sm text-slate-900 dark:text-white font-medium">{rec.documentType}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Expiration Date</label>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {rec.expirationDate
                      ? new Date(rec.expirationDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "N/A"
                    }
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">New Document Title</label>
                  <input type="text" placeholder="Employment Authorization Document" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">New Expiration Date</label>
                  <input type="date" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Document Number</label>
                  <input type="text" placeholder="A12345678" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button onClick={() => setReverifyModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={() => setReverifyModal(null)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                  Complete Re-verification
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
