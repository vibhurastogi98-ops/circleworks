"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useEmployee } from "@/hooks/useEmployees";
import { Activity, Filter, Clock, AlertCircle, Loader2, History, Database, Zap } from "lucide-react";
import { format } from "date-fns";
import { useSocketStore } from "@/store/useSocketStore";
import type { WorkflowActionPayload } from "@/lib/workflows/emitWorkflowAction";

interface ActivityEntry {
  id: string;
  timestamp: string;
  isAutomated: boolean;
  workflowName?: string;
  actionType?: string;
  summary: string;
  changedFields?: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
}

export default function ActivityTab() {
  const { id } = useParams();
  const { data: emp, isLoading, error } = useEmployee(id as string);
  const [filter, setFilter] = useState("All");
  const [workflowEntries, setWorkflowEntries] = useState<ActivityEntry[]>([]);
  const { on, off } = useSocketStore();

  useEffect(() => {
    const handler = (data: WorkflowActionPayload) => {
      if (data.entityType !== "employee" || String(data.entityId) !== String(id)) return;

      const firstField = data.changedFields[0]?.field;
      const summary = firstField
        ? `${data.workflowName} automatically updated ${firstField}`
        : `${data.workflowName} performed ${data.actionType.replace(/_/g, " ")}`;

      setWorkflowEntries((prev) => [
        {
          id: `${data.workflowId}-${data.timestamp}`,
          timestamp: data.timestamp,
          isAutomated: true,
          workflowName: data.workflowName,
          actionType: data.actionType,
          summary,
          changedFields: data.changedFields,
        },
        ...prev,
      ]);
    };

    on("workflow.action.executed", handler);
    return () => off("workflow.action.executed", handler);
  }, [id, on, off]);

  const visibleEntries = filter === "Automated"
    ? workflowEntries
    : filter === "All"
    ? workflowEntries
    : [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Fetching audit logs...</p>
      </div>
    );
  }

  if (error || !emp) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <AlertCircle className="text-red-500" size={32} />
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Record Not Found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-8 max-w-4xl mx-auto w-full">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">System Audit Log</h3>
              <p className="text-xs text-slate-500 font-medium">Tracking all administrative changes and access events.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Filter size={16} className="text-slate-400" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="All">All Events</option>
              <option value="Automated">Automated</option>
              <option value="Update">Data Updates</option>
              <option value="Security">Security Logs</option>
              <option value="Creation">Hierarchy Updates</option>
            </select>
          </div>
        </div>

        <div className="relative pl-6 sm:pl-10 border-l-2 border-slate-100 dark:border-slate-800 space-y-10">
          {visibleEntries.length > 0 ? (
            visibleEntries.map((entry) => (
              <div key={entry.id} className="relative">
                <div className={`absolute -left-[23px] sm:-left-[43px] w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 shadow-sm ${
                  entry.isAutomated
                    ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800"
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                }`}>
                  {entry.isAutomated
                    ? <Zap size={16} className="text-violet-600 dark:text-violet-400" />
                    : <Clock size={16} className="text-blue-500" />
                  }
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl ml-2 sm:ml-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{entry.summary}</span>
                    {entry.isAutomated && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 ring-1 ring-violet-200 dark:ring-violet-500/30">
                        <Zap size={9} /> Automated
                      </span>
                    )}
                  </div>

                  {entry.changedFields && entry.changedFields.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {entry.changedFields.map((cf) => (
                        <div key={cf.field} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{cf.field}</span>
                          <span className="text-slate-400">·</span>
                          <span className="line-through text-slate-400">{String(cf.oldValue ?? "—")}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{String(cf.newValue ?? "—")}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {format(new Date(entry.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                    {entry.workflowName && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold">
                          {entry.workflowName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="relative flex flex-col items-center justify-center py-12 text-center">
              <div className="absolute -left-[23px] sm:-left-[43px] w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm z-10">
                <History size={16} className="text-slate-300" />
              </div>
              <div className="bg-slate-50/30 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800/30 p-10 rounded-3xl ml-2 sm:ml-4 w-full flex flex-col items-center">
                <Database size={48} className="text-slate-100 dark:text-slate-800 mb-4" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Profile Baseline Established</h4>
                <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
                  CircleWorks began tracking system events for this employee record on{" "}
                  {emp.startDate ? format(new Date(emp.startDate), "MMMM d, yyyy") : "initialization"}.
                  All future administrative changes will be logged here with a full cryptographic audit trail.
                </p>
              </div>
            </div>
          )}

          <div className="relative pt-4">
            <div className="absolute -left-[23px] sm:-left-[43px] w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/50 border-2 border-white dark:border-slate-900 flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
            </div>
            <div className="p-5 ml-2 sm:ml-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              End of system history
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
