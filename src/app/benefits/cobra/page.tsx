"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, Clock, XCircle, Shield, AlertTriangle, Send } from "lucide-react";
import { mockCobraCases } from "@/data/mockBenefits";
import { formatDate } from "@/utils/formatDate";

const STATUS_STYLES: Record<string, { class: string; icon: React.ElementType }> = {
  Eligible: { class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
  Notified: { class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Mail },
  Elected: { class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  Declined: { class: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: XCircle },
  Active: { class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Shield },
  Terminated: { class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

export default function CobraPage() {
  const [filter, setFilter] = useState('All');
  const filtered = mockCobraCases.filter(c => filter === 'All' || c.status === filter);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">COBRA Administration</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track qualifying events, election deadlines, and premium payments.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Send size={16} /> Generate Notice
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">Total Cases</h4>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{mockCobraCases.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">Awaiting Election</h4>
          <div className="text-2xl font-bold text-amber-600">{mockCobraCases.filter(c => c.status === 'Notified' || c.status === 'Eligible').length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">Active Coverage</h4>
          <div className="text-2xl font-bold text-green-600">{mockCobraCases.filter(c => c.status === 'Active').length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">Monthly Premiums</h4>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">${mockCobraCases.filter(c => c.status === 'Active').reduce((s, c) => s + c.premiumAmount, 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex-wrap">
          {['All', 'Eligible', 'Notified', 'Elected', 'Active', 'Declined', 'Terminated'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === s ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Qualifying Event</th>
                <th className="px-6 py-3">Notice Sent</th>
                <th className="px-6 py-3">Election Deadline</th>
                <th className="px-6 py-3 text-right">Premium</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(c => {
                const statusInfo = STATUS_STYLES[c.status] || STATUS_STYLES.Eligible;
                const StatusIcon = statusInfo.icon;
                const deadlineNear = c.electionDeadline && (new Date(c.electionDeadline).getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000;

                return (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 group">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{c.employeeName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.class}`}>
                        <StatusIcon size={12} /> {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{c.qualifyingEvent}</td>
                    <td className="px-6 py-4 text-slate-500">{c.noticeSentDate ? formatDate(c.noticeSentDate) : <span className="text-red-500 font-medium">Not sent</span>}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 dark:text-white font-medium">{formatDate(c.electionDeadline)}</span>
                        {deadlineNear && <AlertTriangle size={14} className="text-amber-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">${c.premiumAmount.toLocaleString()}/mo</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold ${c.paymentStatus === 'Current' ? 'text-green-600' : c.paymentStatus === 'Past Due' ? 'text-red-600' : 'text-slate-400'}`}>
                        {c.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!c.noticeSentDate && (
                          <button className="px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 rounded-lg font-bold text-xs flex items-center gap-1">
                            <Send size={12} /> Send Notice
                          </button>
                        )}
                        <button className="text-blue-600 text-xs font-bold hover:underline">View</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
