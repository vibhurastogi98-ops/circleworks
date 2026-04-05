"use client";
import React from "react";
import { Building2, Save, MapPin } from "lucide-react";

export default function TaxSetupPage() {
  return (
    <div className="flex flex-col gap-6 pb-24 max-w-5xl">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center"><Building2 size={20} className="text-rose-600" /></div>
            Company Tax Setup
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">Manage your federal and state tax IDs and rates.</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2">
          <Save size={16} /> Save Changes
        </button>
      </div>

      {/* Federal Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mt-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Building2 size={18}/> Federal EIN</h2>
        <div className="max-w-md">
           <label className="text-sm font-bold">Employer Identification Number (EIN)</label>
           <input type="text" defaultValue="12-3456789" className="w-full mt-2 font-mono text-lg bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" />
           <p className="text-xs text-slate-500 mt-2">Required for all IRS filings and W-2 generating.</p>
        </div>
      </div>

      {/* State Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-lg font-bold flex items-center gap-2"><MapPin size={18}/> State Tax Accounts</h2>
           <button className="text-sm font-bold text-blue-600">Add State +</button>
        </div>
        
        <div className="space-y-4">
           {/* California */}
           <div className="p-4 border border-slate-200 rounded-xl">
             <h3 className="font-bold text-lg mb-4">California (CA)</h3>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">EDD Account Number</label>
                  <input type="text" defaultValue="123-4567-8" className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">SUTA / UI Rate</label>
                  <div className="relative mt-1">
                    <input type="number" defaultValue="3.4" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2" />
                    <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                  </div>
               </div>
             </div>
           </div>
           
           {/* New York */}
           <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">New York (NY)</h3>
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">Missing Info</span>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">NY ID Number (NYS-45)</label>
                  <input type="text" placeholder="Enter NY ID" className="w-full mt-1 bg-white border border-amber-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500" />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">UI Rate</label>
                  <input type="text" placeholder="e.g. 2.1%" className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2" />
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
