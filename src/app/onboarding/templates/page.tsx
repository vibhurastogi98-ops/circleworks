"use client";

import React, { useState } from "react";
import { Plus, Copy, Trash2, GripVertical, ChevronRight, LayoutTemplate, Briefcase, UserMinus } from "lucide-react";
import { mockOnboardingTemplates } from "@/data/mockOnboarding";

export default function TemplateLibrary() {
  const [typeFilter, setTypeFilter] = useState<'all' | 'onboarding' | 'offboarding'>('all');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = mockOnboardingTemplates.filter(t => typeFilter === 'all' || t.type === typeFilter);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Template Library</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage reusable task checklists for onboarding and offboarding flows.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Create Template
        </button>
      </div>

      {/* Filter */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {([['all','All'], ['onboarding','Onboarding'], ['offboarding','Offboarding']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setTypeFilter(val)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${typeFilter === val ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Inline Create Form */}
      {showCreate && (
        <div className="bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">New Template</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Template Name</label>
              <input type="text" className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g., Engineering Fast Track" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <select className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                <option value="onboarding">Onboarding</option>
                <option value="offboarding">Offboarding</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Department Rule</label>
              <select className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                <option value="">All Departments</option>
                <option>Engineering</option>
                <option>Product</option>
                <option>Sales</option>
                <option>Marketing</option>
              </select>
            </div>
          </div>

          {/* Task Builder */}
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Tasks</h4>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
              <GripVertical size={16} className="text-slate-400 cursor-move" />
              <input type="text" defaultValue="Send welcome email" className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white" />
              <select className="text-xs border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-900">
                <option>HR</option><option>Manager</option><option>IT</option><option>Employee</option>
              </select>
              <input type="number" defaultValue={-3} className="w-20 text-xs border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-900 text-center" title="Days offset" />
              <span className="text-[10px] text-slate-500">days</span>
              <button className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
          <button className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors">
            <Plus size={16} /> Add Task
          </button>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">Save Template</button>
          </div>
        </div>
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(tmpl => (
          <div key={tmpl.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tmpl.type === 'onboarding' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                  {tmpl.type === 'onboarding' ? <LayoutTemplate size={20} /> : <UserMinus size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{tmpl.name}</h3>
                  <span className="text-xs text-slate-500">{tmpl.department || 'All Departments'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">{tmpl.taskCount} tasks</span>
              <span>Last used: {new Date(tmpl.lastUsed).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button className="flex-1 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-1">
                Edit <ChevronRight size={12} />
              </button>
              <button className="flex-1 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Copy size={12} /> Clone
              </button>
              <button className="py-1.5 px-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
