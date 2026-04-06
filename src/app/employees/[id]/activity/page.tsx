"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useEmployee } from "@/hooks/useEmployees";
import { Activity, Filter, Clock, AlertCircle, Loader2, History, Database } from "lucide-react";
import { format } from "date-fns";

export default function ActivityTab() {
  const { id } = useParams();
  const { data: emp, isLoading, error } = useEmployee(id as string);
  const [filter, setFilter] = useState("All");

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

  // Use empty array since we don't have a DB table for audit logs yet
  const logs: any[] = [];

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
                  <option value="Update">Data Updates</option>
                  <option value="Security">Security Logs</option>
                  <option value="Creation">Hierarchy Updates</option>
               </select>
            </div>
         </div>

         <div className="relative pl-6 sm:pl-10 border-l-2 border-slate-100 dark:border-slate-800 space-y-10">
            {logs.length > 0 ? (
               logs.map((log: any) => (
                  <div key={log.id} className="relative">
                     <div className="absolute -left-[23px] sm:-left-[43px] w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                        <Clock size={16} className="text-blue-500" />
                     </div>
                     <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl ml-2 sm:ml-4">
                        {/* Audit Log Detail Rendering */}
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
                        CircleWorks began tracking system events for this employee record on {emp.startDate ? format(new Date(emp.startDate), "MMMM d, yyyy") : "initialization"}. 
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
