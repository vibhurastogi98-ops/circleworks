"use client";
import React from "react";
import { Wallet, Info, Activity } from "lucide-react";
import { getOutstandingEwaAdvances } from "@/data/mockEwa";

export default function EWAPage() {
  const outstandingAdvances = getOutstandingEwaAdvances();
  const totalOutstanding = outstandingAdvances.reduce((sum, advance) => sum + advance.remainingBalance, 0);

  return (
    <div className="flex flex-col gap-6 pb-24">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center"><Wallet size={20} className="text-cyan-600" /></div>
            Earned Wage Access (EWA)
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">Allow employees to access a portion of their earned wages before payday.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-4">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase">Active Enrollees</p>
           <p className="text-3xl font-extrabold mt-1">{outstandingAdvances.length}</p>
           <p className="text-sm text-emerald-600 font-semibold mt-2">Employees with outstanding advances</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase">Total Advanced (This Period)</p>
           <p className="text-3xl font-extrabold mt-1">${totalOutstanding.toFixed(2)}</p>
           <p className="text-sm text-slate-500 mt-2">Queued for deduction on the next payroll run</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-slate-900 to-blue-900 text-white">
           <p className="text-xs font-bold text-blue-200 uppercase flex justify-between">EWA Status <Activity size={14}/></p>
           <p className="text-xl font-extrabold mt-2">Enabled firm-wide</p>
           <button className="mt-4 px-4 py-2 bg-white text-blue-900 text-xs font-bold rounded-lg hover:bg-slate-100">Review EWA Guidelines</button>
         </div>
      </div>
    </div>
  );
}
