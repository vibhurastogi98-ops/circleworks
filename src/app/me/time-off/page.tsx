"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Plane, Thermometer, User as UserIcon, Plus, X, CheckCircle2, Clock, XCircle, Info } from "lucide-react";
import { mockPtoBalances, mockPtoRequests, mockTeamCalendar } from "@/data/mockEmployeePortal";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  Approved: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  Pending: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  Denied: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
};

const statusIcons: Record<string, React.ElementType> = {
  Approved: CheckCircle2, Pending: Clock, Denied: XCircle,
};

const typeIcons: Record<string, React.ElementType> = {
  Vacation: Plane, Sick: Thermometer, Personal: UserIcon,
};

export default function TimeOffPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ type: "Vacation", startDate: "", endDate: "", note: "" });

  const calcWorkingDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start); const e = new Date(end);
    let count = 0;
    const d = new Date(s);
    while (d <= e) { const day = d.getDay(); if (day !== 0 && day !== 6) count++; d.setDate(d.getDate() + 1); }
    return count;
  };

  const handleSubmit = () => {
    if (!formData.startDate || !formData.endDate) { toast.error("Please select start and end dates"); return; }
    toast.success("Time off request submitted!");
    setShowForm(false);
    setFormData({ type: "Vacation", startDate: "", endDate: "", note: "" });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Time Off</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Request time off and view your PTO history</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="h-10 px-5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm w-fit"
        >
          <Plus size={16} /> Request Time Off
        </button>
      </div>

      {/* PTO Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {mockPtoBalances.map(pto => {
          const Icon = typeIcons[pto.type] || CalendarDays;
          return (
            <motion.div key={pto.type} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                  <Icon size={16} className="text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-[13px] font-bold text-slate-900 dark:text-white">{pto.type}</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{pto.balance} <span className="text-sm font-medium text-slate-400">/ {pto.total} days</span></p>
              <p className="text-[11px] text-slate-500 mt-1">Accrual: {pto.accrualRate}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Approver Info */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30">
        <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <p className="text-[13px] text-blue-800 dark:text-blue-300 font-medium">
          Your time off requests are approved by <span className="font-bold">Sarah Chen</span> (Manager).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request History */}
        <div className="lg:col-span-2">
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Request History</h2>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 overflow-hidden">
            <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_auto_1fr] gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/40 text-[12px] font-bold text-slate-500 uppercase tracking-wide">
              <span>Type</span><span>Dates</span><span>Days</span><span>Status</span><span>Note</span>
            </div>
            {mockPtoRequests.map((req, i) => {
              const StatusIcon = statusIcons[req.status] || Clock;
              const TypeIcon = typeIcons[req.type] || CalendarDays;
              return (
                <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr_auto_1fr] gap-2 sm:gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors items-center">
                  <div className="flex items-center gap-2">
                    <TypeIcon size={14} className="text-slate-400" />
                    <span className="text-[13px] font-semibold text-slate-900 dark:text-white">{req.type}</span>
                  </div>
                  <span className="text-[13px] text-slate-600 dark:text-slate-300">
                    {new Date(req.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {req.startDate !== req.endDate && ` – ${new Date(req.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </span>
                  <span className="text-[13px] text-slate-600 dark:text-slate-300">{req.workingDays} day{req.workingDays > 1 ? 's' : ''}</span>
                  <span className={`px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit ${statusStyles[req.status]}`}>
                    <StatusIcon size={11} /> {req.status}
                  </span>
                  <span className="text-[12px] text-slate-500 dark:text-slate-400 truncate">{req.note || req.approverNote || '—'}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Team Calendar */}
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Team Calendar</h2>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 divide-y divide-slate-100 dark:divide-slate-700/40">
            {mockTeamCalendar.length === 0 ? (
              <p className="p-4 text-[13px] text-slate-500">No team members off this period.</p>
            ) : (
              mockTeamCalendar.map((entry, i) => (
                <div key={i} className="px-4 py-3">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">{entry.name}</p>
                  <p className="text-[11px] text-slate-500">{entry.department} · {entry.type}</p>
                  <p className="text-[12px] text-slate-600 dark:text-slate-300 mt-1">
                    {new Date(entry.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {entry.startDate !== entry.endDate && ` – ${new Date(entry.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Request Time Off</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Leave Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white">
                    <option>Vacation</option><option>Sick</option><option>Personal</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Start Date</label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">End Date</label>
                    <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white" />
                  </div>
                </div>
                {formData.startDate && formData.endDate && (
                  <div className="px-3 py-2 rounded-lg bg-violet-50 dark:bg-violet-900/10 text-[13px] font-semibold text-violet-700 dark:text-violet-300">
                    {calcWorkingDays(formData.startDate, formData.endDate)} working days
                  </div>
                )}
                <div>
                  <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Note (optional)</label>
                  <textarea value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white resize-none" placeholder="Reason for leave..." />
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-700">
                <button onClick={handleSubmit} className="w-full h-10 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold transition-colors shadow-sm">
                  Submit Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
