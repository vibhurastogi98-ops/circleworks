"use client";

import React from "react";
import Link from "next/link";
import {
  Clock, Users, AlertTriangle, FileCheck, Activity,
  ChevronRight, Coffee, LogOut as LogOutIcon, Timer, CalendarClock,
  ShieldAlert, Zap, ClipboardList, Gauge
} from "lucide-react";
import { mockEmployeeClock, getTimeOverviewStats, mockTimesheets } from "@/data/mockTime";

const STATUS_STYLES: Record<string, { dot: string; bg: string; label: string }> = {
  "clocked-in": { dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400", label: "Clocked In" },
  "on-break": { dot: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400", label: "On Break" },
  "clocked-out": { dot: "bg-slate-400", bg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400", label: "Clocked Out" },
  "no-show": { dot: "bg-red-500", bg: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400", label: "No Show" },
};

export default function TimeOverview() {
  const stats = getTimeOverviewStats();
  const missedPunches = mockEmployeeClock.filter(e => e.missedPunch);
  const overtimeRisk = mockEmployeeClock.filter(e => e.overtimeRisk);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-md">
              <Clock size={22} className="text-white" />
            </div>
            Time & Attendance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Today&apos;s overview &middot; {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-[52px] sm:ml-0">
          <Link href="/time/kiosk" className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            Open Kiosk
          </Link>
          <Link href="/time/timesheets" className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
            Review Timesheets
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Clocked In", value: stats.clockedIn, sub: `of ${stats.totalEmployees} employees`, icon: Users, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Overtime Risks", value: stats.overtimeRisks, sub: "employees near 40hrs", icon: AlertTriangle, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
          { label: "Pending Approvals", value: stats.pendingTimesheets, sub: "timesheets submitted", icon: FileCheck, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
          { label: "Missed Punches", value: stats.missedPunches, sub: "today", icon: ShieldAlert, color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{kpi.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Week Summary Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/5 rounded-full" />
        <div className="relative z-10 flex flex-wrap items-center gap-8">
          <div>
            <div className="text-sm font-bold text-violet-200 uppercase tracking-wider">This Week Total</div>
            <div className="text-4xl font-black mt-1">{stats.weekTotalHours.toLocaleString()} hrs</div>
          </div>
          <div className="h-12 w-px bg-white/20 hidden sm:block" />
          <div>
            <div className="text-sm font-bold text-violet-200 uppercase tracking-wider">Avg Per Employee</div>
            <div className="text-4xl font-black mt-1">{stats.weekAvgHours} hrs</div>
          </div>
          <div className="h-12 w-px bg-white/20 hidden sm:block" />
          <div>
            <div className="text-sm font-bold text-violet-200 uppercase tracking-wider">On Break Now</div>
            <div className="text-4xl font-black mt-1">{stats.onBreak}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clock Status Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-violet-500" />
              Today&apos;s Clock-In Status
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{stats.totalEmployees} employees</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Clock In</th>
                  <th className="px-5 py-3 text-right">Hours Today</th>
                  <th className="px-5 py-3 text-right">Week Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockEmployeeClock.map((emp) => {
                  const st = STATUS_STYLES[emp.status];
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{emp.department} &middot; {emp.location}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${st.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${emp.status === 'clocked-in' ? 'animate-pulse' : ''}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-slate-700 dark:text-slate-300">{emp.clockIn ?? "—"}</td>
                      <td className="px-5 py-3 text-right font-bold text-slate-900 dark:text-white">{emp.hoursToday}h</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`font-bold ${emp.hoursThisWeek >= 40 ? "text-red-600 dark:text-red-400" : emp.hoursThisWeek >= 35 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"}`}>
                          {emp.hoursThisWeek}h
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Alerts & Quick Links */}
        <div className="flex flex-col gap-6">
          {/* Overtime Risk Alerts */}
          {overtimeRisk.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10">
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Overtime Risk Alerts
                </h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {overtimeRisk.map((emp) => (
                  <div key={emp.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{emp.name}</div>
                      <div className="text-xs text-slate-500">{emp.department}</div>
                    </div>
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400">{emp.hoursThisWeek}h</span>
                  </div>
                ))}
              </div>
              <Link href="/time/overtime" className="block p-3 text-center text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors border-t border-amber-200 dark:border-amber-800/50">
                View Overtime Dashboard →
              </Link>
            </div>
          )}

          {/* Missed Punches */}
          {missedPunches.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800/50 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10">
                <h3 className="text-sm font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                  <ShieldAlert size={16} />
                  Missed Punches Today
                </h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {missedPunches.map((emp) => (
                  <div key={emp.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{emp.name}</div>
                      <div className="text-xs text-slate-500">{emp.role} &middot; {emp.location}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">No Show</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="flex flex-col gap-2">
            {[
              { label: "Timesheets", href: "/time/timesheets", icon: ClipboardList, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20", badge: stats.pendingTimesheets },
              { label: "Schedule Builder", href: "/time/schedule", icon: CalendarClock, color: "text-violet-500 bg-violet-50 dark:bg-violet-900/20" },
              { label: "PTO Requests", href: "/time/pto", icon: Coffee, color: "text-green-500 bg-green-50 dark:bg-green-900/20" },
              { label: "Break Compliance", href: "/time/breaks", icon: Timer, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
              { label: "Overtime", href: "/time/overtime", icon: Gauge, color: "text-red-500 bg-red-50 dark:bg-red-900/20" },
              { label: "Kiosk Mode", href: "/time/kiosk", icon: Zap, color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20" },
            ].map(link => (
              <Link key={link.href} href={link.href} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all group">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${link.color}`}>
                  <link.icon size={18} />
                </div>
                <span className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors flex-1">{link.label}</span>
                {link.badge && <span className="min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-[10px] font-bold px-1.5">{link.badge}</span>}
                <ChevronRight size={16} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
