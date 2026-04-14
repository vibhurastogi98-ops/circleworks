"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  MapPin, 
  Navigation, 
  Navigation2, 
  Plus, 
  Search, 
  Download, 
  ExternalLink,
  Info
} from "lucide-react";
import { mockMileageEntries, IRS_MILEAGE_RATE } from "@/data/mockExpenses";
import { formatDate } from "@/utils/formatDate";

export default function MileageLogPage() {
  const [search, setSearch] = useState("");

  const filteredMileage = mockMileageEntries.filter(entry => 
    entry.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    entry.purpose.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
         <Link href="/expenses" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-fit">
            <ChevronLeft size={16} /> Back to Overview
         </Link>
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
            <div>
               <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Mileage & Commute Logs
               </h1>
               <p className="text-sm text-slate-500 font-medium capitalize">
                  Track employee business travel and standard IRS reimbursements.
               </p>
            </div>
            <div className="flex items-center gap-3 ml-[52px] sm:ml-0 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
               <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                  <Download size={16} /> Export CSV
               </button>
               <button className="flex-shrink-0 flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                  <Plus size={18} /> Log Trip
               </button>
            </div>
         </div>
      </div>

      {/* IRS Rate Highlight */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
         <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shadow-inner border border-indigo-200/50 dark:border-indigo-800/50">
               <Navigation size={28} />
            </div>
            <div>
               <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-0.5">Current Rate</span>
               <div className="text-3xl font-black text-slate-900 dark:text-white">${IRS_MILEAGE_RATE.toFixed(2)} <span className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">/ Mile</span></div>
            </div>
         </div>
         <div className="flex flex-col gap-1 items-center md:items-end text-center md:text-right relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
               <Info size={14} className="text-indigo-500" />
               IRS Standard Mileage Rate 2024
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs font-medium">Reimbursement amounts are automatically calculated based on this business rate.</p>
         </div>
      </div>

      {/* Filter & Search */}
      <div className="relative w-full md:max-w-md">
         <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
         <input 
           type="text" 
           placeholder="Search by purpose or employee..." 
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm placeholder:text-slate-400"
         />
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <th className="px-6 py-4">Employee</th>
                     <th className="px-6 py-4">Trip Details</th>
                     <th className="px-6 py-4">Origin / Destination</th>
                     <th className="px-6 py-4 text-right">Miles</th>
                     <th className="px-6 py-4 text-right">Reimbursement</th>
                     <th className="px-6 py-4"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMileage.map((entry) => (
                    <tr key={entry.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
                               {entry.employeeName.charAt(0)}
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{entry.employeeName}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">{formatDate(entry.date)}</div>
                         <div className="text-xs text-slate-500 font-medium">{entry.purpose}</div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white tracking-tight uppercase line-clamp-1">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            {entry.fromLocation}
                         </div>
                         <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 tracking-tight uppercase line-clamp-1 mt-1">
                            <Navigation2 size={12} className="text-emerald-500 rotate-90 shrink-0" />
                            {entry.toLocation}
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-slate-900 dark:text-white">
                         {entry.miles} mi
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-wider">${entry.calculatedReimbursement.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all" title="View Map Route">
                            <ExternalLink size={18} />
                         </button>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
