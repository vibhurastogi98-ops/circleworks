"use client";

import React, { useState } from "react";
import { Plus, Calendar, Clock, Edit3, Trash2 } from "lucide-react";
import { mockPaySchedules } from "@/data/mockSettings";

export default function PaySchedulesSettingsPage() {
  const [schedules] = useState(mockPaySchedules);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pay Schedules</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure how and when your employees are paid.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> New Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{schedule.name}</h3>
                    {schedule.default && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{schedule.frequency}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Edit3 size={16} /></button>
                  {!schedule.default && <button className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"><Trash2 size={16} /></button>}
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-y border-slate-100 dark:border-slate-800 mt-2 mb-4">
                 <div className="flex flex-col">
                   <span className="text-xs text-slate-500 font-bold uppercase mb-1">Assigned</span>
                   <span className="text-sm font-medium text-slate-900 dark:text-white">{schedule.employees} Employees</span>
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={14} /> Next Pay Day</span>
                  <span className="font-bold text-slate-900 dark:text-white">{new Date(schedule.nextPayDay).toDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5"><Clock size={14} /> Timesheet Cutoff</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(schedule.cutoff).toDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
