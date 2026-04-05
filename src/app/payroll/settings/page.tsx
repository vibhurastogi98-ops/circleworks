"use client";
import React from "react";
import { Settings2, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 pb-24 max-w-4xl">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Settings2 size={20} className="text-slate-600" /></div>
            Payroll Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">Configure funding logic, autopilot, and approvers.</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2">
          <Save size={16} /> Save Settings
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-8 mt-4">
         
         <section>
           <h3 className="text-lg font-bold mb-4 border-b border-slate-100 pb-2">Funding Timing</h3>
           <div className="grid grid-cols-2 gap-4">
             <div className="p-4 border-2 border-blue-500 bg-blue-50/50 rounded-xl cursor-pointer">
                <input type="radio" name="funding" defaultChecked className="mb-3" />
                <h4 className="font-bold text-sm">2-Day ACH (Default)</h4>
                <p className="text-xs text-slate-500 mt-1">Submit payroll by Wednesday 5PM PT to pay employees on Friday. Zero fees.</p>
             </div>
             <div className="p-4 border border-slate-200 rounded-xl cursor-not-allowed opacity-60">
                <input type="radio" name="funding" disabled className="mb-3" />
                <h4 className="font-bold text-sm">Next-Day ACH</h4>
                <p className="text-xs text-slate-500 mt-1">Submit payroll by Thursday 5PM PT. Requires additional underwriting approval.</p>
             </div>
           </div>
         </section>

         <section>
           <h3 className="text-lg font-bold mb-4 border-b border-slate-100 pb-2">Payroll Approver Chain</h3>
           <div className="space-y-3">
             <p className="text-sm text-slate-500 mb-2">Select who must approve payroll before funds are withdrawn.</p>
             <div className="flex items-center gap-4">
               <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">1</span>
               <select className="w-72 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                 <option>Sarah Chen (Finance Manager)</option>
               </select>
             </div>
             <div className="flex items-center gap-4">
               <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">2</span>
               <select className="w-72 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                 <option>Michael Torres (HR Director)</option>
               </select>
             </div>
             <button className="text-sm font-bold text-blue-600 mt-2">+ Add Step</button>
           </div>
         </section>

         <section>
           <h3 className="text-lg font-bold mb-4 border-b border-slate-100 pb-2">Autopilot</h3>
           <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer">
             <input type="checkbox" className="mt-1 w-5 h-5 rounded border-slate-300" />
             <div>
               <h4 className="font-bold text-sm">Enable AutoPayroll</h4>
               <p className="text-xs text-slate-500 mt-1">Automatically run payroll for salaried employees 2 days before deadline. You will still receive a preview email 24 hours prior.</p>
             </div>
           </label>
         </section>

      </div>
    </div>
  );
}
