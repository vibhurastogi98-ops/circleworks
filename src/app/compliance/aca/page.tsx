"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft, Download, CheckCircle2, AlertTriangle, XCircle,
  HeartPulse, Users, FileText, TrendingUp
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { acaEmployees, fteMonthlyData } from "@/data/mockCompliance";

export default function ACAPage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const ftCount = acaEmployees.filter((e) => e.status === "full-time").length;
  const ptCount = acaEmployees.filter((e) => e.status === "part-time").length;
  const varCount = acaEmployees.filter((e) => e.status === "variable").length;
  const totalFTE = fteMonthlyData[fteMonthlyData.length - 1]?.totalFTE || 0;
  const isALE = totalFTE >= 50;

  const coveredCount = acaEmployees.filter((e) => e.coverageOffered).length;
  const distributed = acaEmployees.filter((e) => e.form1095CStatus === "distributed").length;
  const generated = acaEmployees.filter((e) => e.form1095CStatus === "generated").length;
  const pending = acaEmployees.filter((e) => e.form1095CStatus === "pending").length;

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
              <HeartPulse size={22} className="text-blue-600" />
              ACA Compliance
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">ALE status, FTE tracking, and 1095-C management.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
          <Download size={16} /> Export 1095-C Data
        </button>
      </div>

      {/* ALE Status + FTE Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ALE Status */}
        <div className={`rounded-xl p-6 shadow-sm border ${isALE
          ? "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500 text-white"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isALE ? "text-blue-200" : "text-slate-500"}`}>ALE Status</h3>
            {isALE ? (
              <span className="px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                Applicable Large Employer
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                Not ALE
              </span>
            )}
          </div>
          <div className={`text-4xl font-black mb-1 ${isALE ? "text-white" : "text-slate-900 dark:text-white"}`}>
            {totalFTE}
          </div>
          <div className={`text-sm font-medium ${isALE ? "text-blue-200" : "text-slate-500"}`}>
            Full-Time Equivalents (latest month)
          </div>
          <div className={`mt-4 text-xs ${isALE ? "text-blue-200" : "text-slate-500"}`}>
            Threshold: 50 FTEs. {isALE ? "ACA reporting requirements apply." : "Below ALE threshold."}
          </div>
        </div>

        {/* Workforce Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Workforce Breakdown</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Full-Time</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{ftCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Part-Time</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{ptCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Variable Hour</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{varCount}</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Coverage Offered</span>
              <span className="text-lg font-black text-blue-600">{coveredCount}/{acaEmployees.length}</span>
            </div>
          </div>
        </div>

        {/* 1095-C Filing Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">1095-C Filing Status</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 size={14} className="text-green-500" /> Distributed
              </span>
              <span className="text-lg font-black text-green-600">{distributed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <FileText size={14} className="text-blue-500" /> Generated
              </span>
              <span className="text-lg font-black text-blue-600">{generated}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <AlertTriangle size={14} className="text-amber-500" /> Pending
              </span>
              <span className="text-lg font-black text-amber-600">{pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FTE Count Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-slate-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly FTE Count</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">2026 Calendar Year</span>
        </div>
        <div className="p-6 h-[300px]">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fteMonthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="ftCount" name="Full-Time" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ptCount" name="Part-Time" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-xl" />
          )}
        </div>
      </div>

      {/* Employee Coverage Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Employee Coverage Tracking</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Hrs/Wk</th>
                <th className="px-6 py-3 text-center">Offered?</th>
                <th className="px-6 py-3 text-center">Affordable?</th>
                <th className="px-6 py-3 text-center">Min Value?</th>
                <th className="px-6 py-3">1095-C Code</th>
                <th className="px-6 py-3">1095-C Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {acaEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{emp.employeeName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      emp.status === "full-time"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : emp.status === "part-time"
                        ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{emp.hoursPerWeek}</td>
                  <td className="px-6 py-4 text-center">
                    {emp.coverageOffered ? <CheckCircle2 size={16} className="text-green-500 mx-auto" /> : <XCircle size={16} className="text-red-400 mx-auto" />}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {emp.affordable ? <CheckCircle2 size={16} className="text-green-500 mx-auto" /> : <XCircle size={16} className="text-red-400 mx-auto" />}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {emp.minimumValue ? <CheckCircle2 size={16} className="text-green-500 mx-auto" /> : <XCircle size={16} className="text-red-400 mx-auto" />}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{emp.form1095CCode}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.form1095CStatus === "distributed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : emp.form1095CStatus === "generated"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {emp.form1095CStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                      Preview 1095-C
                    </button>
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
