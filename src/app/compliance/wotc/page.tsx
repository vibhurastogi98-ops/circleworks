"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Download, Search, CheckCircle2, Clock, AlertTriangle,
  XCircle, FileText, DollarSign, Award
} from "lucide-react";
import { wotcScreenings, type WOTCSubmissionStatus } from "@/data/mockCompliance";

const STATUS_CONFIG: Record<WOTCSubmissionStatus, { label: string; color: string; icon: React.ElementType }> = {
  approved: { label: "Approved", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800", icon: CheckCircle2 },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: Clock },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800", icon: AlertTriangle },
  denied: { label: "Denied", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800", icon: XCircle },
  not_applicable: { label: "N/A", color: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-800", icon: XCircle },
};

export default function WOTCPage() {
  const [search, setSearch] = useState("");
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);

  const filtered = wotcScreenings.filter((s) => {
    if (showEligibleOnly && !s.eligible) return false;
    if (search && !s.employeeName.toLowerCase().includes(search.toLowerCase()) && !s.employeeId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const eligibleCount = wotcScreenings.filter((s) => s.eligible).length;
  const totalCredit = wotcScreenings.filter((s) => s.eligible).reduce((sum, s) => sum + s.estimatedCredit, 0);
  const approvedCredits = wotcScreenings.filter((s) => s.submissionStatus === "approved").reduce((sum, s) => sum + s.estimatedCredit, 0);
  const completedQuestionnaires = wotcScreenings.filter((s) => s.questionnaireComplete).length;
  const form8850Count = wotcScreenings.filter((s) => s.form8850Generated).length;

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
              <Award size={22} className="text-blue-600" />
              WOTC Screening
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Work Opportunity Tax Credit screening and Form 8850 management.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-5 shadow-sm text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-green-200" />
              <span className="text-xs font-bold text-green-200 uppercase tracking-wider">Approved Credits</span>
            </div>
            <div className="text-3xl font-black">${approvedCredits.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-blue-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Total</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">${totalCredit.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eligible Hires</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {eligibleCount}<span className="text-lg text-slate-400 font-medium">/{wotcScreenings.length}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-purple-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">8850s Generated</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{form8850Count}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowEligibleOnly(!showEligibleOnly)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            showEligibleOnly
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-800"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
          }`}
        >
          {showEligibleOnly ? "✓ Eligible Only" : "Show Eligible Only"}
        </button>
        {(search || showEligibleOnly) && (
          <button
            onClick={() => { setSearch(""); setShowEligibleOnly(false); }}
            className="text-xs font-bold text-blue-600 dark:text-blue-400"
          >
            Clear
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
                <th className="px-6 py-3">Hire Date</th>
                <th className="px-6 py-3">Questionnaire</th>
                <th className="px-6 py-3">Eligible</th>
                <th className="px-6 py-3">Target Group</th>
                <th className="px-6 py-3 text-right">Est. Credit</th>
                <th className="px-6 py-3">Form 8850</th>
                <th className="px-6 py-3">Submission</th>
                <th className="px-6 py-3">Agency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((s) => {
                const cfg = STATUS_CONFIG[s.submissionStatus];
                const StatusIcon = cfg.icon;
                return (
                  <tr key={s.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 ${s.eligible ? "" : "opacity-60"}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{s.employeeName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{s.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                      {new Date(s.hireDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      {s.questionnaireComplete ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <Clock size={16} className="text-amber-500" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {s.eligible ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                          Eligible
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          Not Eligible
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                      {s.targetGroup === "Not Eligible" ? "—" : s.targetGroup}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {s.estimatedCredit > 0 ? (
                        <span className="font-bold text-green-600 dark:text-green-400">${s.estimatedCredit.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {s.form8850Generated ? (
                        <button className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                          <FileText size={12} /> Download
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                        <StatusIcon size={10} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs max-w-[140px] truncate">
                      {s.stateAgency}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    No screenings match your filters.
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
