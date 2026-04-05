"use client";

import React, { useState } from "react";
import { Plus, Key, Copy, Trash2, Webhook } from "lucide-react";
import { mockApiKeys } from "@/data/mockSettings";

export default function APISettingsPage() {
  const [keys] = useState(mockApiKeys);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">API & Webhooks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage programmable access to your CircleWorks data.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">API Keys</h2>
            <p className="text-xs text-slate-500 mt-1">Authenticate requests to the CircleWorks REST API.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white rounded-lg text-sm font-bold transition-colors">
            <Plus size={16} /> Generate Key
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Key Name & Prefix</th>
                <th className="px-6 py-3">Scopes (Perms)</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Last Used</th>
                <th className="px-6 py-3 text-right">Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                      <Key size={14} className="text-slate-400" /> {key.name}
                    </div>
                    <div className="font-mono text-xs text-slate-500 flex items-center gap-2">
                       {key.prefix} <button className="hover:text-blue-500"><Copy size={12}/></button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {key.scopes.map(s => (
                           <span key={s} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{s}</span>
                        ))}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                    <div className="font-medium">{key.createdBy}</div>
                    <div>{key.createdAt}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 font-medium">{key.lastUsed}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Webhooks</h2>
            <p className="text-xs text-slate-500 mt-1">Receive real-time HTTP pushes on platform events.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors">
            <Plus size={16} /> Add Endpoint
          </button>
        </div>
        <div className="p-6 flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
               <Webhook size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">No Webhooks Configured</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">Create an endpoint to receive JSON payloads whenever an employee is hired, payroll is run, or taxes are paid.</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
               Read Documentation
            </button>
        </div>
       </div>
    </div>
  );
}
