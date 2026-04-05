"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Upload, Search } from "lucide-react";
import { mockBenefitPlans } from "@/data/mockBenefits";

export default function PlansPage() {
  const [typeFilter, setTypeFilter] = useState('All');
  const types = ['All', ...Array.from(new Set(mockBenefitPlans.map(p => p.type)))];
  const filtered = mockBenefitPlans.filter(p => typeFilter === 'All' || p.type === typeFilter);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Benefit Plans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure carriers, premiums, eligibility rules, and effective dates.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Add Plan
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${typeFilter === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400"}`}>{t}</button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search plans..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(plan => (
          <div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block ${plan.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600'}`}>{plan.status}</span>
                <h3 className="font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{plan.carrier}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{plan.type}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Employee Premium</div>
                <div className="font-bold text-slate-900 dark:text-white">${plan.employeePremium}/mo</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Employer Premium</div>
                <div className="font-bold text-slate-900 dark:text-white">${plan.employerPremium}/mo</div>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Eligibility: <span className="font-semibold text-slate-700 dark:text-slate-300">{plan.eligibility}</span></span>
              <span>{plan.enrolled}/{plan.eligible} enrolled</span>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex-1 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"><Edit size={12} /> Edit</button>
              <button className="flex-1 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1"><Upload size={12} /> Upload SPD</button>
              <button className="py-1.5 px-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
