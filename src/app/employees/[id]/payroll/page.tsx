"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useEmployee } from "@/hooks/useEmployees";
import { DollarSign, Download, Filter, FileText, Loader2, AlertCircle, ChevronRight, History } from "lucide-react";
import { formatDate } from "@/utils/formatDate";

export default function PayrollTab() {
  const { id } = useParams();
  const { data: emp, isLoading, error } = useEmployee(id as string);
  const [year, setYear] = useState("2024");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading payroll history...</p>
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

  const payrollItems = emp.payrollItems || [];
  
  // Calculate YTD totals from payroll items
  const ytdGross = payrollItems.reduce((acc: number, item: any) => acc + (item.gross || 0), 0);
  const ytdTaxes = payrollItems.reduce((acc: number, item: any) => acc + (item.federalTax || 0) + (item.stateTax || 0) + (item.ficaSs || 0) + (item.ficaMed || 0), 0);
  const ytdDeductions = payrollItems.reduce((acc: number, item: any) => acc + (item.benefits || 0), 0);
  const ytdNet = payrollItems.reduce((acc: number, item: any) => acc + (item.net || 0), 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Top Section: YTD Summary & Year selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pay History & Earnings</h2>
         <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Tax Year</span>
            <select 
               value={year} 
               onChange={e => setYear(e.target.value)}
               className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-bold text-sm shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
               <option value="2024">2024 (YTD)</option>
               <option value="2023">2023</option>
            </select>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {/* YTD Gross */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">YTD Gross Earnings</h4>
            <div className="text-2xl font-black text-slate-900 dark:text-white">${(ytdGross / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
         </div>
         {/* YTD Taxes */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Tax Burden</h4>
            <div className="text-2xl font-black text-slate-700 dark:text-slate-300">${(ytdTaxes / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
         </div>
         {/* YTD Deductions */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Benefits/Post-Tax</h4>
            <div className="text-2xl font-black text-slate-700 dark:text-slate-300">${(ytdDeductions / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
         </div>
         {/* YTD Net */}
         <div className="bg-blue-600 rounded-xl p-6 shadow-sm text-white border border-blue-700 ring-4 ring-blue-500/10">
            <h4 className="text-[11px] font-bold text-blue-200 uppercase tracking-widest mb-2">Net Take-Home Pay</h4>
            <div className="text-2xl font-black">${(ytdNet / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Tax Documents */}
         <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col gap-5 h-full">
               <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" /> Tax Forms
               </h3>
               <div className="flex flex-col gap-3">
                  <div className="text-xs text-slate-500 p-6 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center leading-relaxed">
                     <FileText size={32} className="mx-auto mb-3 opacity-20" />
                     2024 W-2 forms will be available and distributed through CircleWorks in Jan 2025.
                  </div>
                  
                  {year === "2023" && (
                    <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl group hover:border-blue-200 dark:hover:border-blue-900/50 cursor-pointer transition-all bg-white dark:bg-slate-900 shadow-sm">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                             <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                             <div className="font-bold text-sm text-slate-900 dark:text-white">2023 W-2 Form</div>
                             <div className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Verified • PDF</div>
                          </div>
                       </div>
                       <button className="text-slate-400 hover:text-blue-600 transition-colors p-2"><Download size={18} /></button>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Pay Stubs */}
         <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
               <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/10">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     <History size={18} className="text-blue-500" /> Paystubs & Checks
                  </h3>
                  <button className="text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors uppercase tracking-widest">
                     <Filter size={14} /> Filter 
                  </button>
               </div>
               
               <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-tighter text-[10px]">
                        <tr>
                           <th className="px-6 py-4">Pay Period</th>
                           <th className="px-6 py-4">Check Date</th>
                           <th className="px-6 py-4 text-right">Gross</th>
                           <th className="px-6 py-4 text-right">Net Takehome</th>
                           <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {payrollItems.length > 0 ? payrollItems.map((item: any) => (
                           <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                              <td className="px-6 py-4">
                                 <span className="font-bold text-slate-900 dark:text-white">
                                    {item.payroll?.payPeriodStart ? (
                                       `${formatDate(item.payroll.payPeriodStart)} - ${formatDate(item.payroll.payPeriodEnd)}`
                                    ) : 'Regular Pay Cycle'}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                                 {item.payroll?.checkDate ? formatDate(item.payroll.checkDate) : 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                                 ${(item.gross / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <span className="font-black text-slate-900 dark:text-white">${(item.net / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    View Statement <ChevronRight className="w-4 h-4" />
                                 </button>
                              </td>
                           </tr>
                        )) : (
                          <tr>
                             <td colSpan={5} className="px-6 py-24 text-center text-slate-400">
                                <DollarSign size={48} className="mx-auto mb-4 opacity-10" />
                                <p className="text-base font-bold text-slate-900 dark:text-white">No Payment History</p>
                                <p className="text-sm mt-1 max-w-xs mx-auto">This employee hasn't been included in a processed payroll cycle yet.</p>
                             </td>
                          </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
