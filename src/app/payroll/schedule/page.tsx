"use client";
import React from "react";
import { Plus, Calendar as CalIcon, Edit2, CheckCircle2 } from "lucide-react";

export default function SchedulePage() {
  return (
    <div className="flex flex-col gap-6 pb-24">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><CalIcon size={20} className="text-purple-600" /></div>
            Pay Schedules
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">Manage how often your employees get paid.</p>
        </div>
        <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-bold rounded-xl flex items-center gap-2 border border-slate-200 dark:border-slate-700">
          <Plus size={16} /> New Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
         <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
            <div className="flex justify-between items-start mb-6">
              <div>
                 <h2 className="text-xl font-bold">Bi-Weekly (Default)</h2>
                 <p className="text-slate-500 text-sm mt-1">Pays every other Friday</p>
                 <span className="inline-flex mt-3 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase items-center gap-1"><CheckCircle2 size={14}/> Active</span>
              </div>
              <button className="text-slate-400 hover:text-blue-600"><Edit2 size={18}/></button>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Upcoming Runs</p>
               <div className="space-y-2">
                 <div className="flex justify-between text-sm"><span className="text-slate-600">Mar 16 – Mar 31</span><span className="font-bold">Apr 5</span></div>
                 <div className="flex justify-between text-sm"><span className="text-slate-600">Apr 1 – Apr 15</span><span className="font-bold">Apr 20</span></div>
                 <div className="flex justify-between text-sm"><span className="text-slate-600">Apr 16 – Apr 30</span><span className="font-bold">May 5</span></div>
               </div>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-blue-500" />
            <div className="flex justify-between items-start mb-6">
              <div>
                 <h2 className="text-xl font-bold">Monthly (Execs)</h2>
                 <p className="text-slate-500 text-sm mt-1">Pays on the last day of month</p>
                 <span className="inline-flex mt-3 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase items-center gap-1"><CheckCircle2 size={14}/> Active</span>
              </div>
              <button className="text-slate-400 hover:text-blue-600"><Edit2 size={18}/></button>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Upcoming Runs</p>
               <div className="space-y-2">
                 <div className="flex justify-between text-sm"><span className="text-slate-600">Mar 1 – Mar 31</span><span className="font-bold">Mar 31</span></div>
                 <div className="flex justify-between text-sm"><span className="text-slate-600">Apr 1 – Apr 30</span><span className="font-bold">Apr 30</span></div>
                 <div className="flex justify-between text-sm"><span className="text-slate-600">May 1 – May 31</span><span className="font-bold">May 31</span></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
