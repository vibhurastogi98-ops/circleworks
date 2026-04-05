"use client";

import React, { useState } from "react";
import { Plus, Settings2, Trash2 } from "lucide-react";
import { mockCustomFields } from "@/data/mockSettings";

export default function CustomFieldsSettingsPage() {
  const [fields] = useState(mockCustomFields);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Custom Fields</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Extend core data models with custom attributes and file attachments.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Create Field
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Field Name</th>
                <th className="px-6 py-3">Target Model</th>
                <th className="px-6 py-3">Data Type</th>
                <th className="px-6 py-3">Access Level</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {fields.map((field) => (
                <tr key={field.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{field.name}</td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {field.target}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        field.type === 'Dropdown' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        field.type === 'File' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                     }`}>
                        {field.type}
                     </span>
                     {field.type === 'Dropdown' && <span className="text-xs text-slate-400 ml-2">({field.options.length} options)</span>}
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <Settings2 size={14} /> {field.access}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 ml-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
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
