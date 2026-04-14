"use client";

import React from "react";
import {
  FileText, DollarSign, UploadCloud, Clock, CheckCircle2,
  Calendar, CreditCard, ShieldCheck, Mail
} from "lucide-react";
import { ContractorSubNav } from "../page";

export default function ContractorPortalPreview() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Contractor Portal (Preview)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            This is a preview of what contractors see when they log into their self-service portal.
          </p>
        </div>
      </div>

      <ContractorSubNav active="/contractors/portal" />

      {/* Simulator Frame */}
      <div className="bg-slate-200 dark:bg-slate-800 p-2 sm:p-6 rounded-3xl mt-4">
        <div className="bg-white dark:bg-[#0B1120] rounded-2xl shadow-2xl overflow-hidden border border-slate-300 dark:border-slate-700 min-h-[600px] flex flex-col">
          
          {/* Mock App Header */}
          <header className="h-[72px] border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xs">A</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Alice Design Studio</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 font-medium">alice@designstudio.co</span>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-5xl mx-auto space-y-8">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back, Alice</h2>
               <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors">
                 <UploadCloud size={16} /> Submit New Invoice
               </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl">
                 <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unpaid Invoices</span>
                    <Clock size={16} className="text-amber-500" />
                 </div>
                 <p className="text-3xl font-black text-slate-900 dark:text-white">$8,500</p>
                 <p className="text-xs text-slate-500 mt-1">1 invoice pending approval</p>
               </div>
               
               <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl">
                 <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">YTD Earnings</span>
                    <DollarSign size={16} className="text-emerald-500" />
                 </div>
                 <p className="text-3xl font-black text-slate-900 dark:text-white">$42,500</p>
                 <p className="text-xs text-slate-500 mt-1">Last payment: Mar 15</p>
               </div>
               
               <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl">
                 <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</span>
                    <CreditCard size={16} className="text-blue-500" />
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs font-bold text-slate-700 dark:text-slate-300">Chase</div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white text-mono">•••• 8834</p>
                 </div>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               
               {/* Recent Invoices */}
               <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     <FileText size={16} /> Recent Invoices
                  </h3>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                     {[
                       { id: "ADS-2025-042", date: "Apr 01, 2025", desc: "April Retainer", amount: 8500, status: "Submitted", color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
                       { id: "ADS-2025-041", date: "Mar 01, 2025", desc: "March Retainer", amount: 8500, status: "Paid via ACH", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
                       { id: "ADS-2025-040", date: "Feb 01, 2025", desc: "February Retainer", amount: 8500, status: "Paid via ACH", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
                     ].map((inv) => (
                        <div key={inv.id} className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between cursor-pointer transition-colors">
                           <div>
                              <p className="font-bold text-slate-900 dark:text-white">{inv.desc}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                 <span className="font-mono">{inv.id}</span>
                                 <span>•</span>
                                 <span>{inv.date}</span>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="font-bold text-slate-900 dark:text-white">${inv.amount.toLocaleString()}</p>
                              <span className={`inline-block py-0.5 px-2 rounded font-bold text-[10px] uppercase tracking-wider mt-1 ${inv.color}`}>
                                 {inv.status}
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Right Sidebar */}
               <div className="space-y-6">
                  
                  {/* Documents & Tax */}
                  <div>
                     <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <ShieldCheck size={16} /> Compliance & Tax
                     </h3>
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                           <div>
                              <p className="font-medium text-sm text-slate-900 dark:text-white">Active W-9</p>
                              <p className="text-xs text-slate-500 mt-0.5">Submitted Mar 15, 2025</p>
                           </div>
                           <CheckCircle2 size={16} className="text-emerald-500" />
                        </div>
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="font-medium text-sm text-slate-900 dark:text-white">2024 1099-NEC</p>
                              <p className="text-xs text-slate-500 mt-0.5">Ready for download</p>
                           </div>
                           <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">Download</button>
                        </div>
                     </div>
                  </div>

                  {/* Active Contract */}
                  <div>
                     <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <Calendar size={16} /> Active Contracts
                     </h3>
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">UI/UX Design Services</p>
                        <p className="text-xs text-slate-500 mt-1 mb-3">Mar 2025 - Mar 2026</p>
                        <div className="flex justify-between items-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                           <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Rate</span>
                           <span className="text-sm font-bold text-slate-900 dark:text-white">$8,500/mo</span>
                        </div>
                     </div>
                  </div>

               </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
