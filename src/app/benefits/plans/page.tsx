"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Upload, Search, FileText, Users } from "lucide-react";
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

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add / Edit Plan</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Capture carrier, plan type, contribution split, effective dates, eligibility, and plan documents in one workflow.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider">
              Draft
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Carrier", placeholder: "BCBS, Delta Dental, VSP..." },
              { label: "Plan Name", placeholder: "PPO Gold 500" },
              { label: "Employee Share %", placeholder: "25" },
              { label: "Employer Share %", placeholder: "75" },
              { label: "Effective Start", placeholder: "2026-01-01", type: "date" },
              { label: "Effective End", placeholder: "2026-12-31", type: "date" },
            ].map(field => (
              <div key={field.label}>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{field.label}</label>
                <input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan Type</label>
              <select className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Medical</option>
                <option>Dental</option>
                <option>Vision</option>
                <option>Life</option>
                <option>Disability</option>
                <option>Retirement</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Eligible Employees</label>
              <select className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All employees</option>
                <option>Full-time only</option>
                <option>After 30 days</option>
              </select>
            </div>
          </div>
          <div className="mt-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-300">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Summary Plan Description PDF</p>
                <p className="text-xs text-slate-500">Upload SPD and attach it to enrollment screens.</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold flex items-center justify-center gap-2">
              <Upload size={14} /> Upload PDF
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-xl p-5 text-white shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4">
            <Users size={20} />
          </div>
          <h2 className="text-lg font-bold">Eligibility Preview</h2>
          <p className="text-sm text-blue-100 mt-1">Use the rules above to show which employees can enroll before publishing the plan.</p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between border border-white/10 rounded-lg p-3">
              <span className="text-blue-100">All employees</span>
              <span className="font-black">184</span>
            </div>
            <div className="flex items-center justify-between border border-white/10 rounded-lg p-3">
              <span className="text-blue-100">Full-time only</span>
              <span className="font-black">156</span>
            </div>
            <div className="flex items-center justify-between border border-white/10 rounded-lg p-3">
              <span className="text-blue-100">After 30 days</span>
              <span className="font-black">141</span>
            </div>
          </div>
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
