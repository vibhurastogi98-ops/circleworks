"use client";
import React from "react";
import { Scale, Plus, AlertCircle } from "lucide-react";

export default function GarnishmentsPage() {
  return (
    <div className="flex flex-col gap-6 pb-24">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Scale size={20} className="text-slate-600" /></div>
            Garnishments
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">Manage child support, IRS levies, and court orders.</p>
        </div>
        <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-2">
          <Plus size={16} /> Add Garnishment
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-4 shadow-sm">
         <table className="w-full text-left">
           <thead>
             <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-400 uppercase">
               <th className="px-5 py-4">Employee</th>
               <th className="px-5 py-4">Type</th>
               <th className="px-5 py-4">Agency / Court Ref</th>
               <th className="px-5 py-4">Amount / Rule</th>
               <th className="px-5 py-4">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
             <tr>
               <td className="px-5 py-4 font-bold text-sm">Taylor Smith</td>
               <td className="px-5 py-4"><span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded">Child Support</span></td>
               <td className="px-5 py-4 text-sm text-slate-500">TX-AAG-99812</td>
               <td className="px-5 py-4 font-mono text-sm">$350.00 / check</td>
               <td className="px-5 py-4"><span className="text-emerald-600 font-bold text-sm">Active</span></td>
             </tr>
             <tr>
               <td className="px-5 py-4 font-bold text-sm">Jordan Brown</td>
               <td className="px-5 py-4"><span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded">IRS Levy</span></td>
               <td className="px-5 py-4 text-sm text-slate-500">IRS-2024-XX</td>
               <td className="px-5 py-4 font-mono text-sm">15% disposable</td>
               <td className="px-5 py-4"><span className="text-emerald-600 font-bold text-sm">Active</span></td>
             </tr>
           </tbody>
         </table>
      </div>
    </div>
  );
}
