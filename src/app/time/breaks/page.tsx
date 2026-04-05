"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft, Timer, AlertTriangle, DollarSign, MapPin,
  Clock, Shield
} from "lucide-react";
import { mockBreakViolations } from "@/data/mockTime";

export default function BreakCompliancePage() {
  const premiumPayCount = mockBreakViolations.filter(v => v.premiumPayApplied).length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <Link href="/time" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft size={12} /> Back to Time
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
            <Timer size={22} className="text-white" />
          </div>
          Break Compliance
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">Today&apos;s break violations by state-specific rules</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Violations", value: mockBreakViolations.length, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
          { label: "CA Premium Pay", value: premiumPayCount, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "Missed Meals", value: mockBreakViolations.filter(v => v.violationType === "Missed Meal").length, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
          { label: "States Affected", value: new Set(mockBreakViolations.map(v => v.state)).size, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
            <div className={`text-3xl font-black mt-2 ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {premiumPayCount > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl">
          <DollarSign size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-bold text-amber-800 dark:text-amber-300">CA Premium Pay Auto-Applied</div>
            <div className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{premiumPayCount} violation(s) triggered California premium pay.</div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" /> Today&apos;s Violations
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Violation</th>
                <th className="px-5 py-3 text-center">Scheduled</th>
                <th className="px-5 py-3 text-center">Actual</th>
                <th className="px-5 py-3 text-center">State</th>
                <th className="px-5 py-3 text-center">Premium Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockBreakViolations.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">{v.employeeName}</div>
                    <div className="text-xs text-slate-500">{v.date}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">{v.violationType}</span>
                  </td>
                  <td className="px-5 py-3 text-center font-medium text-slate-700 dark:text-slate-300">{v.scheduledBreak}</td>
                  <td className="px-5 py-3 text-center font-medium">{v.actualBreak ?? <span className="text-red-500 font-bold">NONE</span>}</td>
                  <td className="px-5 py-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{v.state}</span></td>
                  <td className="px-5 py-3 text-center">
                    {v.premiumPayApplied ? <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1"><Shield size={12} /> Applied</span> : <span className="text-xs text-slate-400">N/A</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
