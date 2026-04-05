"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Clock, Edit3, CheckCircle2, XCircle, AlertTriangle,
  Shield, Save, X
} from "lucide-react";
import { mockTimesheets, mockTimesheetDays, type TimesheetDay } from "@/data/mockTime";

export default function IndividualTimesheetPage() {
  const params = useParams();
  const employeeId = params?.employeeId as string;

  const timesheet = mockTimesheets.find(ts => ts.employeeId === employeeId) || mockTimesheets[0];
  const [days, setDays] = useState<TimesheetDay[]>(mockTimesheetDays);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editReason, setEditReason] = useState("");

  const totalRegular = days.reduce((s, d) => s + d.regularHours, 0);
  const totalOt = days.reduce((s, d) => s + d.overtimeHours, 0);
  const totalHours = days.reduce((s, d) => s + d.totalHours, 0);
  const totalBreak = days.reduce((s, d) => s + d.breakMinutes, 0);

  const otRate = 1.5;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/time/timesheets" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft size={12} /> Back to Timesheets
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <Clock size={22} className="text-white" />
            </div>
            {timesheet.employeeName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            {timesheet.department} &middot; {timesheet.periodStart} to {timesheet.periodEnd}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-[52px] sm:ml-0">
          {timesheet.status === "Submitted" && (
            <>
              <button className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
                <CheckCircle2 size={16} /> Approve
              </button>
              <button className="px-4 py-2.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2">
                <XCircle size={16} /> Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Regular Hours", value: `${totalRegular.toFixed(1)}h`, color: "text-blue-600" },
          { label: "Overtime Hours", value: `${totalOt.toFixed(1)}h`, color: "text-amber-600" },
          { label: "Total Hours", value: `${totalHours.toFixed(1)}h`, color: "text-slate-900 dark:text-white" },
          { label: "Break Time", value: `${totalBreak} min`, color: "text-green-600" },
          {
            label: "OT Cost Est.",
            value: `$${(totalOt * 45 * otRate).toFixed(0)}`,
            color: "text-red-600",
            sub: `${totalOt.toFixed(1)}h × $45 × ${otRate}x`
          },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</div>
            <div className={`text-2xl font-black mt-1 ${card.color}`}>{card.value}</div>
            {card.sub && <div className="text-[10px] text-slate-400 mt-0.5">{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* Day-by-Day Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Hours Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Day</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-center">Clock In</th>
                <th className="px-5 py-3 text-center">Clock Out</th>
                <th className="px-5 py-3 text-center">Break</th>
                <th className="px-5 py-3 text-right">Regular</th>
                <th className="px-5 py-3 text-right">OT</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-center">Break OK</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {days.map((day) => (
                <React.Fragment key={day.date}>
                  <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${day.edited ? 'bg-amber-50/50 dark:bg-amber-900/5' : ''}`}>
                    <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{day.dayLabel}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400 font-medium">{day.date}</td>
                    <td className="px-5 py-3 text-center font-medium text-slate-700 dark:text-slate-300">{day.clockIn ?? "—"}</td>
                    <td className="px-5 py-3 text-center font-medium text-slate-700 dark:text-slate-300">{day.clockOut ?? "—"}</td>
                    <td className="px-5 py-3 text-center text-slate-600 dark:text-slate-400">{day.breakMinutes > 0 ? `${day.breakMinutes}m` : "—"}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900 dark:text-white">{day.regularHours > 0 ? `${day.regularHours}h` : "—"}</td>
                    <td className="px-5 py-3 text-right font-bold text-amber-600 dark:text-amber-400">{day.overtimeHours > 0 ? `${day.overtimeHours}h` : "—"}</td>
                    <td className="px-5 py-3 text-right font-black text-slate-900 dark:text-white">{day.totalHours > 0 ? `${day.totalHours}h` : "—"}</td>
                    <td className="px-5 py-3 text-center">
                      {day.totalHours > 0 ? (
                        day.breakCompliant ? (
                          <Shield size={16} className="inline text-emerald-500" />
                        ) : (
                          <AlertTriangle size={16} className="inline text-amber-500" />
                        )
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {day.totalHours > 0 && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingDay(editingDay === day.date ? null : day.date)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          {day.edited && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                              EDITED
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                  {editingDay === day.date && (
                    <tr>
                      <td colSpan={10} className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">Reason for edit <span className="text-red-500">*</span></span>
                          <input
                            type="text"
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                            placeholder="Required: explain the correction..."
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                          />
                          <button className="px-3 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                            <Save size={12} /> Save
                          </button>
                          <button onClick={() => setEditingDay(null)} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <X size={12} /> Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-300 dark:border-slate-700">
              <tr className="font-black text-slate-900 dark:text-white">
                <td className="px-5 py-3" colSpan={5}>TOTALS</td>
                <td className="px-5 py-3 text-right">{totalRegular.toFixed(1)}h</td>
                <td className="px-5 py-3 text-right text-amber-600">{totalOt.toFixed(1)}h</td>
                <td className="px-5 py-3 text-right">{totalHours.toFixed(1)}h</td>
                <td className="px-5 py-3" colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
