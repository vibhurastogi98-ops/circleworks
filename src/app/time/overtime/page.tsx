"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Gauge, AlertTriangle, DollarSign, TrendingUp } from "lucide-react";
import { mockOvertimeEmployees, mockOtMonthlyTrend } from "@/data/mockTime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend } from "recharts";

export default function OvertimePage() {
  const criticalCount = mockOvertimeEmployees.filter(e => e.riskLevel === "critical").length;
  const warningCount = mockOvertimeEmployees.filter(e => e.riskLevel === "warning").length;
  const totalOtCost = mockOvertimeEmployees.reduce((s, e) => s + e.otCost, 0);
  const weekBudget = 6000;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <Link href="/time" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft size={12} /> Back to Time
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md">
            <Gauge size={22} className="text-white" />
          </div>
          Overtime Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">Current week projection and historical trends</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Critical (>40h)", value: criticalCount, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
          { label: "Warning (>35h)", value: warningCount, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "OT Cost This Week", value: `$${totalOtCost.toLocaleString()}`, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
          { label: "vs Budget", value: `${Math.round((totalOtCost / weekBudget) * 100)}%`, color: totalOtCost > weekBudget ? "text-red-600" : "text-emerald-600", bg: totalOtCost > weekBudget ? "bg-red-50 dark:bg-red-900/20" : "bg-emerald-50 dark:bg-emerald-900/20" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
            <div className={`text-3xl font-black mt-2 ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Projection Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Current Week Projection</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3 text-right">Current</th>
                  <th className="px-4 py-3 text-right">Projected</th>
                  <th className="px-4 py-3 text-right">OT Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockOvertimeEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                      <div className="text-xs text-slate-500">{emp.department}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-black ${emp.riskLevel === "critical" ? "text-red-600" : emp.riskLevel === "warning" ? "text-amber-600" : "text-slate-900 dark:text-white"}`}>
                        {emp.hoursThisWeek}h
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${emp.projectedHours > 40 ? "text-red-600" : emp.projectedHours > 35 ? "text-amber-600" : "text-slate-600 dark:text-slate-400"}`}>
                        {emp.projectedHours}h
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                      {emp.otCost > 0 ? `$${emp.otCost}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* OT Trend Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-violet-500" /> Monthly OT Trend
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mockOtMonthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis yAxisId="cost" tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="hours" orientation="right" tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `${v}h`} />
                <Tooltip formatter={(value: any, name: any) => [name === "otCost" || name === "budget" ? `$${Number(value).toLocaleString()}` : `${value}h`, name === "otCost" ? "OT Cost" : name === "budget" ? "Budget" : "OT Hours"]} />
                <Legend />
                <Bar yAxisId="hours" dataKey="otHours" name="OT Hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="cost" type="monotone" dataKey="otCost" name="OT Cost" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="cost" type="monotone" dataKey="budget" name="Budget" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
