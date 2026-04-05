"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getEmployeeById } from "@/data/mockEmployees";
import { Activity, Filter, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function ActivityTab() {
  const { id } = useParams();
  const emp = useMemo(() => getEmployeeById(id as string), [id]);
  const [filter, setFilter] = useState("All");

  if (!emp) return null;

  const logs = emp.history.activity;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-6 max-w-4xl mx-auto w-full">
         
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <Activity size={20} className="text-blue-500" /> System Audit Log
            </h3>
            
            <div className="flex items-center gap-2">
               <Filter size={16} className="text-slate-400" />
               <select 
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
               >
                  <option value="All">All Events</option>
                  <option value="Update">Data Updates</option>
                  <option value="Create">Creation Events</option>
               </select>
            </div>
         </div>

         <div className="relative pl-4 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-8">
            {logs.length > 0 ? logs.map(log => {
               if (filter !== "All" && !log.action.includes(filter) && filter === 'Create' && log.action !== 'Created Profile') return null;
               
               return (
                  <div key={log.id} className="relative">
                     <div className="absolute -left-[21px] sm:-left-[39px] w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center shrink-0">
                        <Clock size={14} className="text-blue-500" />
                     </div>
                     
                     <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700 p-4 rounded-xl ml-2 sm:ml-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                           <div>
                              <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                              <span className="text-slate-500 mx-2 text-sm">by</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300 text-sm bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{log.user}</span>
                           </div>
                           <span className="text-xs font-semibold text-slate-500">
                              {format(new Date(log.date), "MMM d, yyyy 'at' h:mm a")}
                           </span>
                        </div>
                        
                        {log.field && (
                           <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-lg text-sm mt-3 overflow-x-auto text-nowrap">
                              <span className="font-semibold text-slate-600 dark:text-slate-400 min-w-max">{log.field}:</span>
                              <span className="text-red-600 dark:text-red-400 line-through bg-red-50 dark:bg-red-900/10 px-2 rounded min-w-max">{log.oldValue}</span>
                              <ArrowRight size={14} className="text-slate-400 shrink-0" />
                              <span className="text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/10 px-2 rounded min-w-max">{log.newValue}</span>
                           </div>
                        )}
                     </div>
                  </div>
               )
            }) : (
               <div className="text-slate-500 py-4 italic">No activity recorded for this employee.</div>
            )}
            
            {/* Generic baseline creation log if mock list only spans recent events */}
            <div className="relative">
               <div className="absolute -left-[21px] sm:-left-[39px] w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
               </div>
               <div className="p-4 ml-2 sm:ml-4 text-sm text-slate-500">
                  End of history. Profile was initialized on {format(new Date(emp.startDate), "MMM d, yyyy")}.
               </div>
            </div>
         </div>
         
      </div>
    </div>
  );
}
