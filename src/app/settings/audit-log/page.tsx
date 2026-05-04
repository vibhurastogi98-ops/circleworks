"use client";

import React, { useState, useMemo } from "react";
import { Download, Search, Filter, Zap, Lock } from "lucide-react";
import { mockAuditLogs } from "@/data/mockSettings";

const ACTION_LABELS: Record<string, string> = {
  update_field: "Field Updated",
  create_task: "Task Created",
  send_email: "Email Sent",
  change_status: "Status Changed",
};

export default function AuditLogSettingsPage() {
  const [search, setSearch] = useState("");
  const [filterAutomated, setFilterAutomated] = useState<"all" | "manual" | "automated">("all");

  const filtered = useMemo(() => {
    return mockAuditLogs.filter((log) => {
      const matchSearch =
        !search ||
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.resource.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filterAutomated === "all" ||
        (filterAutomated === "automated" && log.isAutomated) ||
        (filterAutomated === "manual" && !log.isAutomated);
      return matchSearch && matchFilter;
    });
  }, [search, filterAutomated]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Audit Log
            <Lock size={16} className="text-slate-400" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Immutable record of all administrative and automated actions across the platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-64 pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterAutomated}
            onChange={(e) => setFilterAutomated(e.target.value as "all" | "manual" | "automated")}
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="manual">Manual Only</option>
            <option value="automated">Automated Only</option>
          </select>
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
                <th className="px-6 py-3 text-right">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((log) => (
                <tr
                  key={log.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 ${
                    log.isAutomated ? "bg-violet-50/30 dark:bg-violet-900/5" : ""
                  }`}
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {new Date(log.date).toLocaleString("en-US", { timeZone: "UTC", hour12: false }) + " UTC"}
                  </td>
                  <td className="px-6 py-4">
                    {log.isAutomated ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                          <Zap size={12} className="text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <span className="font-semibold text-violet-700 dark:text-violet-300 text-xs">Workflow Automation</span>
                          {"workflowName" in log && log.workflowName && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{log.workflowName as string}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="font-medium text-slate-900 dark:text-white">{log.user}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        log.isAutomated
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                      {log.isAutomated && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                          <Zap size={8} /> Automated
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{log.resource}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {log.isAutomated ? (
                        <span className="font-mono text-xs text-violet-500 dark:text-violet-400">Automation</span>
                      ) : (
                        <span className="font-mono text-xs text-slate-500">{log.ip}</span>
                      )}
                      <Lock size={11} className="text-slate-300 dark:text-slate-600" />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                    No audit log entries match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Lock size={12} /> Audit logs are immutable. Entries cannot be edited or deleted.
          </span>
          <span>Retained 7 years · SOC-2 compliant</span>
        </div>
      </div>
    </div>
  );
}
