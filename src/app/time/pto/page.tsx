"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Coffee, CheckCircle2, XCircle, Calendar,
  ChevronDown, MessageSquare, Search, Shield
} from "lucide-react";
import { mockPtoRequests, type PtoStatus, type PtoType } from "@/data/mockTime";

const STATUS_STYLE: Record<PtoStatus, string> = {
  Pending: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  Approved: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
  Denied: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
};

const TYPE_COLOR: Record<PtoType, string> = {
  Vacation: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  Sick: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  Personal: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
  Bereavement: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400",
  FMLA: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  "Jury Duty": "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
};

export default function PtoPage() {
  const [tab, setTab] = useState<"queue" | "calendar">("queue");
  const [statusFilter, setStatusFilter] = useState<PtoStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<PtoType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return mockPtoRequests.filter(r => {
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      if (typeFilter !== "All" && r.type !== typeFilter) return false;
      if (searchQuery && !r.employeeName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [statusFilter, typeFilter, searchQuery]);

  // Calendar view data
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(2026, 3, 1 + i); // April 2026
    return {
      date: d,
      day: d.getDate(),
      dayOfWeek: d.getDay(),
      requests: mockPtoRequests.filter(r => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        return d >= start && d <= end && r.status !== "Denied";
      }),
    };
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/time" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft size={12} /> Back to Time
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <Coffee size={22} className="text-white" />
            </div>
            PTO Requests
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Review and manage time-off requests
          </p>
        </div>
        <div className="flex items-center gap-2 ml-[52px] sm:ml-0">
          <Link href="/time/pto/policies" className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            PTO Policies
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        {[
          { key: "queue" as const, label: "Approval Queue" },
          { key: "calendar" as const, label: "Calendar View" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "queue" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search employee..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
            </div>
            <div className="relative">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as PtoType | "All")}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-violet-500 cursor-pointer">
                <option value="All">All Types</option>
                {(["Vacation", "Sick", "Personal", "Bereavement", "FMLA", "Jury Duty"] as PtoType[]).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PtoStatus | "All")}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-violet-500 cursor-pointer">
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Denied">Denied</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Request Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Employee</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Dates</th>
                    <th className="px-5 py-3 text-right">Days</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3">Note</th>
                    <th className="px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{req.employeeName}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${TYPE_COLOR[req.type]}`}>
                          {req.isFmla && <Shield size={10} />}
                          {req.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                        {req.startDate} – {req.endDate}
                      </td>
                      <td className="px-5 py-3 text-right font-black text-slate-900 dark:text-white">{req.totalDays}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLE[req.status]}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{req.note || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {req.status === "Pending" && (
                            <>
                              <button className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Approve">
                                <CheckCircle2 size={16} />
                              </button>
                              <button className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Deny">
                                <XCircle size={16} />
                              </button>
                              {req.type === "FMLA" || req.isFmla ? null : (
                                <button className="p-1.5 rounded-lg text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors" title="Designate as FMLA">
                                  <Shield size={16} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "calendar" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-violet-500" /> April 2026 — Team PTO Calendar
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2">{d}</div>
            ))}
            {/* Empty cells for offset */}
            {Array.from({ length: calendarDays[0].dayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} className="h-20" />
            ))}
            {calendarDays.map(cd => (
              <div key={cd.day} className={`h-20 border border-slate-100 dark:border-slate-800 rounded-lg p-1.5 ${cd.requests.length > 0 ? "bg-violet-50/50 dark:bg-violet-900/10" : ""}`}>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{cd.day}</div>
                <div className="mt-0.5 space-y-0.5 overflow-hidden">
                  {cd.requests.slice(0, 2).map(r => (
                    <div key={r.id} className={`text-[8px] font-bold px-1 py-0.5 rounded truncate ${TYPE_COLOR[r.type]}`}>
                      {r.employeeName.split(" ")[0]}
                    </div>
                  ))}
                  {cd.requests.length > 2 && (
                    <div className="text-[8px] text-slate-500 font-bold">+{cd.requests.length - 2} more</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
