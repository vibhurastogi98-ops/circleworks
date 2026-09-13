"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";

type Log = {
  id: number;
  action: string;
  resource: string;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string | null;
  actorEmail: string | null;
};

const ACTION_LABELS: Record<string, string> = {
  update_field: "Field Updated",
  create_task: "Task Created",
  send_email: "Email Sent",
  change_status: "Status Changed",
};

function labelAction(action: string) {
  return ACTION_LABELS[action] ?? action.replace(/[._-]/g, " ");
}

export default function AuditLogSettingsPage() {
  const [logs, setLogs] = useState<Log[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState<string>("all");
  const [resource, setResource] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("90");

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/audit-log?days=${dateRange}`, { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const data = await r.json();
      setLogs(data.logs ?? []);
      setErr(null);
    } catch { setErr("Network error"); }
  }, [dateRange]);

  useEffect(() => { void load(); }, [load]);

  const actionTypes = useMemo(
    () => Array.from(new Set((logs ?? []).map((l) => l.action))).sort(),
    [logs],
  );
  const resources = useMemo(
    () => Array.from(new Set((logs ?? []).map((l) => l.resource.split(":")[0]))).sort(),
    [logs],
  );

  const filtered = useMemo(() => {
    return (logs ?? []).filter((log) => {
      const matchSearch =
        !search ||
        (log.actorEmail ?? "").toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.resource.toLowerCase().includes(search.toLowerCase());
      const matchAction = actionType === "all" || log.action === actionType;
      const matchResource = resource === "all" || log.resource.startsWith(resource);
      return matchSearch && matchAction && matchResource;
    });
  }, [logs, search, actionType, resource]);

  return (
    <div className="flex max-w-6xl animate-in flex-col gap-6 fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Log</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Every mutation in your workspace, actor and action tracked. Read-only.</p>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>
      )}

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search actor / action / resource" className="w-full h-10 rounded-lg border border-slate-200 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </div>
        <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          <option value="all">All actions</option>
          {actionTypes.map((a) => <option key={a} value={a}>{labelAction(a)}</option>)}
        </select>
        <select value={resource} onChange={(e) => setResource(e.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          <option value="all">All resources</option>
          {resources.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs === null && !err && <tr><td colSpan={5} className="p-6 text-center text-slate-500">Loading…</td></tr>}
            {logs?.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-500">No audit entries in this window.</td></tr>}
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 text-slate-500">{l.createdAt ? new Date(l.createdAt).toLocaleString() : "—"}</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{l.actorEmail ?? "system"}</td>
                <td className="px-4 py-3">{labelAction(l.action)}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{l.resource}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{l.ipAddress ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
