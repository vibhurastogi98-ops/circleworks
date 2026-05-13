"use client";

import React, { useMemo, useState } from "react";
import { Download, Lock, Search, ShieldCheck } from "lucide-react";

type ViewerRole = "hr" | "non-hr";

const SENSITIVE_DISPLAY_PLACEHOLDER = "[Sensitive field — masked]";

const auditLogs = [
  {
    id: "audit_001",
    date: "2026-05-13T07:18:00Z",
    actor: "Jamie HR",
    action: "Employee SSN updated",
    resource: "Employee: Michael Chang",
    fieldName: "ssn",
    oldValue: "***-**-6789",
    newValue: "***-**-7821",
    ip: "10.0.0.12",
  },
  {
    id: "audit_002",
    date: "2026-05-13T06:44:00Z",
    actor: "Taylor Finance",
    action: "Direct deposit updated",
    resource: "Employee: Nina Patel",
    fieldName: "bank_account",
    oldValue: "***4821",
    newValue: "***9134",
    ip: "172.16.254.1",
  },
  {
    id: "audit_003",
    date: "2026-05-12T21:30:00Z",
    actor: "Alex Admin",
    action: "Compensation updated",
    resource: "Employee: Sarah Connor",
    fieldName: "salary",
    oldValue: "$124,000",
    newValue: "$131,000",
    ip: "192.168.1.45",
  },
  {
    id: "audit_004",
    date: "2026-05-12T18:05:00Z",
    actor: "System",
    action: "Password changed",
    resource: "User: mchang@circleworks.test",
    fieldName: "password",
    oldValue: "Password changed",
    newValue: "Password changed",
    ip: "Internal",
  },
];

function isSensitiveField(fieldName: string) {
  return ["ssn", "bank_routing", "bank_account", "salary", "password"].includes(fieldName);
}

function displayAuditValue(fieldName: string, value: string, viewerRole: ViewerRole) {
  if (viewerRole === "non-hr" && isSensitiveField(fieldName)) {
    return SENSITIVE_DISPLAY_PLACEHOLDER;
  }

  return value;
}

export default function ComplianceAuditLogPage() {
  const [search, setSearch] = useState("");
  const [viewerRole, setViewerRole] = useState<ViewerRole>("hr");

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return auditLogs;

    return auditLogs.filter((log) =>
      [log.actor, log.action, log.resource, log.fieldName].some((value) => value.toLowerCase().includes(query)),
    );
  }, [search]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <ShieldCheck size={14} />
            Compliance
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Audit Log
            <Lock size={16} className="text-slate-400" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Immutable record of sensitive employee, payroll, and account changes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
            {[
              ["hr", "HR/Admin"],
              ["non-hr", "Non-HR"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setViewerRole(id as ViewerRole)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  viewerRole === id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search logs..."
              className="w-full sm:w-64 pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors shadow-sm">
            <Download size={16} /> CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Resource</th>
                <th className="px-5 py-3">Old Value</th>
                <th className="px-5 py-3">New Value</th>
                <th className="px-5 py-3 text-right">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.date).toLocaleString("en-US", { timeZone: "UTC", hour12: false })} UTC
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{log.actor}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{log.resource}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {displayAuditValue(log.fieldName, log.oldValue, viewerRole)}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {displayAuditValue(log.fieldName, log.newValue, viewerRole)}
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-xs text-slate-500 whitespace-nowrap">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Lock size={12} /> AES-256 encrypted audit values
          </span>
          <span>{filteredLogs.length} entries</span>
        </div>
      </div>
    </div>
  );
}
