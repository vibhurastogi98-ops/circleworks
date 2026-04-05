"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserMinus, CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";
import { mockOffboardingCases } from "@/data/mockOnboarding";

export default function OffboardingPage() {

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Offboarding</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage active offboarding cases and ensure compliance tasks are completed.</p>
        </div>
        <Link href="/onboarding" className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors">
          ← Back to Onboarding
        </Link>
      </div>

      {/* Active Offboarding Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockOffboardingCases.map(c => {
          const completed = c.tasks.filter(t => t.status === 'Complete').length;
          const total = c.tasks.length;
          const pct = Math.round((completed / total) * 100);

          return (
            <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
              {/* Case Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <UserMinus size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white">{c.employeeName}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{c.department}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span>{c.reason}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-500">Termination Date</div>
                  <div className="font-bold text-sm text-red-600 dark:text-red-400">{new Date(c.terminationDate).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Progress */}
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-bold text-slate-900 dark:text-white">Task Completion</span>
                  <span className="font-black text-slate-900 dark:text-white">{pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Task List */}
              <div className="flex-1 p-5 pt-3">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {c.tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 py-3 group">
                      {task.status === 'Complete' ? (
                        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                      ) : (
                        <Circle size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 cursor-pointer transition-colors shrink-0" />
                      )}
                      <span className={`flex-1 text-sm ${task.status === 'Complete' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white font-medium'}`}>
                        {task.title}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0
                        ${task.assignee === 'HR' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {task.assignee}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
