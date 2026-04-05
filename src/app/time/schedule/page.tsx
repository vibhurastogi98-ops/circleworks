"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Copy,
  Plus, AlertTriangle, MapPin, Clock, X
} from "lucide-react";
import { mockShifts } from "@/data/mockTime";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_DATES = ["Mar 30", "Mar 31", "Apr 1", "Apr 2", "Apr 3", "Apr 4", "Apr 5"];

export default function ScheduleBuilderPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  // Group shifts by employee
  const employeeNames = Array.from(new Set(mockShifts.map(s => s.employeeName)));
  const shiftsByEmployee = employeeNames.map(name => ({
    name,
    shifts: mockShifts.filter(s => s.employeeName === name),
    totalHours: mockShifts.filter(s => s.employeeName === name).reduce((sum, s) => {
      const [sh, sm] = s.startTime.split(":").map(Number);
      const [eh, em] = s.endTime.split(":").map(Number);
      return sum + (eh - sh) + (em - sm) / 60;
    }, 0),
  }));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/time" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft size={12} /> Back to Time
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-md">
              <CalendarDays size={22} className="text-white" />
            </div>
            Shift Schedule
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Week of March 30 – April 5, 2026
          </p>
        </div>
        <div className="flex items-center gap-2 ml-[52px] sm:ml-0">
          <button className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2">
            <Copy size={14} /> Copy Previous Week
          </button>
          <Link href="/time/schedule/open-shifts" className="px-4 py-2.5 border border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300 rounded-xl text-sm font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors shadow-sm">
            Open Shifts
          </Link>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
            <Plus size={16} /> Add Shift
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
        </button>
        <span className="text-sm font-bold text-slate-900 dark:text-white">March 30 – April 5, 2026</span>
        <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-48 sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-10">Employee</th>
                {DAYS.map((day, i) => (
                  <th key={day} className="px-3 py-3 text-center min-w-[140px]">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{WEEK_DATES[i]}</div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-20">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {shiftsByEmployee.map((emp) => (
                <tr key={emp.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="px-4 py-3 sticky left-0 bg-white dark:bg-slate-900 z-10">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{emp.name}</div>
                    <div className="text-[11px] text-slate-500">{emp.shifts[0]?.role}</div>
                  </td>
                  {DAYS.map(day => {
                    const shift = emp.shifts.find(s => s.day === day);
                    if (!shift) {
                      return (
                        <td key={day} className="px-3 py-3 text-center">
                          <button className="w-full h-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50/30 dark:hover:bg-violet-900/10 transition-all flex items-center justify-center group">
                            <Plus size={14} className="text-slate-300 group-hover:text-violet-500 transition-colors" />
                          </button>
                        </td>
                      );
                    }
                    return (
                      <td key={day} className="px-3 py-3 text-center">
                        <div className={`rounded-lg border p-2 cursor-pointer hover:shadow-md transition-shadow ${shift.color}`}>
                          <div className="text-[11px] font-bold">{shift.startTime}–{shift.endTime}</div>
                          <div className="text-[10px] opacity-75 flex items-center justify-center gap-1 mt-0.5">
                            <MapPin size={8} /> {shift.location}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-black ${emp.totalHours > 40 ? "text-red-600 dark:text-red-400" : emp.totalHours > 35 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"}`}>
                      {emp.totalHours}h
                    </span>
                    {emp.totalHours > 40 && (
                      <div className="mt-0.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          OT WARNING
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Shift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Shift</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: "Employee", type: "select" },
                { label: "Day", type: "select" },
                { label: "Start Time", type: "time" },
                { label: "End Time", type: "time" },
                { label: "Role", type: "text" },
                { label: "Location", type: "text" },
              ].map(field => (
                <div key={field.label}>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{field.label}</label>
                  {field.type === "select" ? (
                    <select className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
                      <option>Select {field.label}...</option>
                    </select>
                  ) : (
                    <input type={field.type} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
                  )}
                </div>
              ))}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors">
                  Add Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
