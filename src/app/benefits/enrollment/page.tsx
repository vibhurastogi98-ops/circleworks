"use client";

import React, { useState } from "react";
import { Calendar, Mail, CheckCircle2, Clock, Users, Bell, Lock, BarChart3 } from "lucide-react";

export default function EnrollmentPage() {
  const [enrollmentActive, setEnrollmentActive] = useState(false);

  const employees = [
    { name: 'Sarah Johnson', status: 'Completed', completedAt: '2024-11-03' },
    { name: 'Mike Chen', status: 'Completed', completedAt: '2024-11-05' },
    { name: 'Amy Park', status: 'In Progress', completedAt: null },
    { name: 'Carlos Diaz', status: 'Not Started', completedAt: null },
    { name: 'Priya Sharma', status: 'Not Started', completedAt: null },
  ];

  const completedCount = employees.filter(e => e.status === 'Completed').length;
  const pct = Math.round((completedCount / employees.length) * 100);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Open Enrollment</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure enrollment windows and track employee participation.</p>
        </div>
        <div className="flex items-center gap-3">
          {!enrollmentActive ? (
            <button onClick={() => setEnrollmentActive(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
              <Calendar size={16} /> Open Enrollment Window
            </button>
          ) : (
            <button onClick={() => setEnrollmentActive(false)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
              <Lock size={16} /> Close Enrollment
            </button>
          )}
        </div>
      </div>

      {/* Enrollment Config & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Window Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
              <input type="date" defaultValue="2024-11-01" className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">End Date</label>
              <input type="date" defaultValue="2024-11-15" className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-colors">
              <Mail size={16} /> Send Invitations
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Completion Rate</h3>
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3.5" className="dark:stroke-slate-800" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={pct >= 80 ? '#22c55e' : '#3b82f6'} strokeWidth="3.5" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{pct}%</span>
            </div>
          </div>
          <div className="text-sm text-slate-500 mt-3">{completedCount} of {employees.length} completed</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Actions</h3>
          <button className="w-full py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors">
            <Bell size={16} /> Remind Non-Enrolled
          </button>
          <button className="w-full py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors">
            <Users size={16} /> Bulk Enroll Defaults
          </button>
          <button className="w-full py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors">
            <BarChart3 size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Employee Tracking */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Employee Enrollment Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Completed At</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((emp, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                      ${emp.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        emp.status === 'In Progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {emp.status === 'Completed' && <CheckCircle2 size={14}/>}
                      {emp.status === 'In Progress' && <Clock size={14}/>}
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{emp.completedAt ? new Date(emp.completedAt).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 text-right">
                    {emp.status !== 'Completed' && (
                      <button className="text-blue-600 text-sm font-bold hover:underline">Send Reminder</button>
                    )}
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
