"use client";

import React, { useState } from 'react';
import { Plus, Users, DollarSign, Clock, LayoutGrid, CheckCircle } from 'lucide-react';

export default function TimeAndProjectsSettings() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Time & Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage client projects, billable hours, and team assignments.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">New Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
              <input type="text" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Website Redesign" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Name</label>
              <input type="text" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Acme Corp" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Code</label>
              <input type="text" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. ACM-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Rate ($/hr)</label>
              <input type="number" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="150" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Budget Hours</label>
              <input type="number" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="200" />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" id="billable" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600" />
              <label htmlFor="billable" className="text-sm font-medium text-slate-700 dark:text-slate-300">Billable Project</label>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assign Team Members</h3>
            <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Select employees who can log time to this project.</p>
              {/* Dummy multi-select for now */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 px-2 flex-col justify-center py-1 rounded-md text-xs font-medium"><input type="checkbox" defaultChecked /> Alice Johnson</span>
                <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 px-2 py-1 rounded-md text-xs font-medium"><input type="checkbox" /> Bob Smith</span>
                <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 px-2 py-1 rounded-md text-xs font-medium"><input type="checkbox" defaultChecked /> Charlie Davis</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Save Project</button>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">Project</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Rate / Budget</th>
                <th className="px-6 py-3 font-medium">Team</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">Acme Rebrand</div>
                  <div className="text-xs text-slate-500">ACM-001</div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">Acme Corp</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                  <div>$150/hr</div>
                  <div className="text-xs text-slate-500">200 hrs</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-medium text-indigo-700">AJ</div>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-medium text-emerald-700">CD</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Active
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">Mobile App V2</div>
                  <div className="text-xs text-slate-500">GLB-002</div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">Global Tech</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                  <div>$120/hr</div>
                  <div className="text-xs text-slate-500">500 hrs</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-medium text-blue-700">BS</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Draft
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
