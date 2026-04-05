"use client";

import React, { useState } from "react";
import { Download, Search, Filter } from "lucide-react";
import { mockAuditLogs } from "@/data/mockSettings";

export default function AuditLogSettingsPage() {
  const [logs] = useState(mockAuditLogs);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Immutable record of all administrative actions across the platform.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input placeholder="Search logs..." className="w-64 pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Filter size={16} />
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors shadow-sm">
               <Download size={16} /> CSV
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Timestamp (UTC)</th>
                <th className="px-6 py-3">Actor</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Resource Target</th>
                <th className="px-6 py-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {new Date(log.date).toLocaleString('en-US', { timeZone: 'UTC', hour12: false }) + " UTC"}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{log.user}</td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{log.action}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{log.resource}</td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 text-center">
           Audit logs are retained for 7 years to comply with SOC-2 and regulatory requirements. Deletion is not possible.
        </div>
      </div>
    </div>
  );
}
