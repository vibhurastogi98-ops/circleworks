"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileCheck, Search, Filter, CheckCircle2, XCircle, Clock,
  ChevronDown, ArrowLeft, MessageSquare, Check
} from "lucide-react";
import { mockTimesheets, type TimesheetStatus } from "@/data/mockTime";

const STATUS_STYLE: Record<TimesheetStatus, { bg: string; dot: string }> = {
  Submitted: { bg: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  Approved: { bg: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  Rejected: { bg: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400", dot: "bg-red-500" },
  Draft: { bg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
};

export default function TimesheetsPage() {
  const [statusFilter, setStatusFilter] = useState<TimesheetStatus | "All">("All");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionNote, setActionNote] = useState("");
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null);

  const departments = useMemo(() => {
    const deps = Array.from(new Set(mockTimesheets.map(ts => ts.department)));
    return ["All", ...deps];
  }, []);

  const filtered = useMemo(() => {
    return mockTimesheets.filter(ts => {
      if (statusFilter !== "All" && ts.status !== statusFilter) return false;
      if (deptFilter !== "All" && ts.department !== deptFilter) return false;
      if (searchQuery && !ts.employeeName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [statusFilter, deptFilter, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(t => t.id)));
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/time" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft size={12} /> Back to Time
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
              <FileCheck size={22} className="text-white" />
            </div>
            Timesheet Approvals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Review and approve submitted timesheets
          </p>
        </div>
        <div className="flex items-center gap-2 ml-[52px] sm:ml-0">
          <button
            disabled={selected.size === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            Batch Approve ({selected.size})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TimesheetStatus | "All")}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            {departments.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Timesheets Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 w-10">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500" />
                </th>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Top Project</th>
                <th className="px-5 py-3">Period</th>
                <th className="px-5 py-3 text-right">Regular</th>
                <th className="px-5 py-3 text-right">OT</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((ts) => {
                const style = STATUS_STYLE[ts.status];
                return (
                  <tr key={ts.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <input type="checkbox" checked={selected.has(ts.id)} onChange={() => toggleSelect(ts.id)} className="rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500" />
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/time/timesheets/${ts.employeeId}/${ts.periodStart}`} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                        <div className="font-bold text-slate-900 dark:text-white">{ts.employeeName}</div>
                        <div className="text-xs text-slate-500">{ts.department}</div>
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {ts.id === '1' ? 'Acme Rebrand' : 'Mobile App V2'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400 font-medium">
                      {ts.periodStart} – {ts.periodEnd}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900 dark:text-white">{ts.regularHours}h</td>
                    <td className="px-5 py-3 text-right font-bold text-amber-600 dark:text-amber-400">{ts.overtimeHours > 0 ? `${ts.overtimeHours}h` : "—"}</td>
                    <td className="px-5 py-3 text-right font-black text-slate-900 dark:text-white">{ts.totalHours}h</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${style.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {ts.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {ts.status === "Submitted" && (
                          <>
                            <button className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Approve">
                              <CheckCircle2 size={16} />
                            </button>
                            <button className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Reject">
                              <XCircle size={16} />
                            </button>
                            <button onClick={() => setShowNoteFor(showNoteFor === ts.id ? null : ts.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Add Note">
                              <MessageSquare size={16} />
                            </button>
                          </>
                        )}
                        <Link href={`/time/timesheets/${ts.employeeId}/${ts.periodStart}`} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="View Details">
                          <Clock size={16} />
                        </Link>
                      </div>
                      {showNoteFor === ts.id && (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a note..."
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                          <button className="px-2 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold">
                            <Check size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <FileCheck size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No timesheets match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
