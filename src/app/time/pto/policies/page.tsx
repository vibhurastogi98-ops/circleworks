"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, Plus, Edit3, Trash2, Check, X,
  Clock, RefreshCw, DollarSign, Calendar
} from "lucide-react";
import { mockPtoPolicies } from "@/data/mockTime";

export default function PtoPoliciesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/time/pto" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft size={12} /> Back to PTO
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <BookOpen size={22} className="text-white" />
            </div>
            PTO Policies
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Configure leave types, accrual rules, and carryover limits
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2 ml-[52px] sm:ml-0 w-fit"
        >
          <Plus size={16} /> New Policy
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/50 rounded-xl shadow-sm p-6 animate-in slide-in-from-top duration-300">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Create New Policy</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Policy Name", placeholder: "e.g. Standard Vacation" },
              { label: "Leave Type", type: "select", options: ["Vacation", "Sick", "Personal", "Bereavement", "FMLA", "Jury Duty"] },
              { label: "Accrual Rate", placeholder: "e.g. 1.25 days/month" },
              { label: "Accrual Frequency", type: "select", options: ["Monthly", "Bi-Weekly", "Annually", "Per Event"] },
              { label: "Max Accrual (days)", placeholder: "e.g. 20", type: "number" },
              { label: "Carryover Limit (days)", placeholder: "e.g. 5", type: "number" },
              { label: "Waiting Period", placeholder: "e.g. 90 days" },
              { label: "Assign To", type: "select", options: ["All Departments", "Engineering", "Sales", "Marketing", "Operations", "Support", "Finance"] },
            ].map(field => (
              <div key={field.label}>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{field.label}</label>
                {field.type === "select" ? (
                  <select className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={field.type || "text"} placeholder={field.placeholder} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
                )}
              </div>
            ))}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Payout on Termination</label>
              <div className="mt-3 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payout" className="text-violet-600 focus:ring-violet-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payout" defaultChecked className="text-violet-600 focus:ring-violet-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">No</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowCreateForm(false)} className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors">
              Create Policy
            </button>
          </div>
        </div>
      )}

      {/* Policies Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockPtoPolicies.map((policy) => (
          <div key={policy.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{policy.name}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 mt-1">
                  {policy.leaveType}
                </span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit3 size={14} /></button>
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <RefreshCw size={12} className="text-slate-400" />
                <span><strong className="text-slate-900 dark:text-white">{policy.accrualRate}</strong> ({policy.accrualFrequency})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar size={12} className="text-slate-400" />
                <span>Max: <strong className="text-slate-900 dark:text-white">{policy.maxAccrual} days</strong> &middot; Carryover: <strong>{policy.carryoverLimit} days</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Clock size={12} className="text-slate-400" />
                <span>Waiting: <strong className="text-slate-900 dark:text-white">{policy.waitingPeriod}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <DollarSign size={12} className="text-slate-400" />
                <span>Payout: <strong className={policy.payoutOnTermination ? "text-emerald-600" : "text-slate-500"}>{policy.payoutOnTermination ? "Yes" : "No"}</strong></span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned to: </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{policy.assignedTo}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
