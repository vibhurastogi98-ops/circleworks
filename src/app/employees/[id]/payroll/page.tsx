"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getEmployeeById } from "@/data/mockEmployees";
import { DollarSign, Download, Filter, FileText } from "lucide-react";

export default function PayrollTab() {
  const { id } = useParams();
  const emp = useMemo(() => getEmployeeById(id as string), [id]);
  const [year, setYear] = useState("2024");

  if (!emp) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Top Section: YTD Summary & Year selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pay History & Documents</h2>
         <select 
            value={year} 
            onChange={e => setYear(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-medium shadow-sm focus:ring-2 focus:ring-blue-500"
         >
            <option value="2024">Year to Date (2024)</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
         </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {/* YTD Gross */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">YTD Gross Pay</h4>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">$85,400.00</div>
         </div>
         {/* YTD Taxes */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">YTD Taxes</h4>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">$14,200.00</div>
         </div>
         {/* YTD Deductions */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">YTD Deductions</h4>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">$8,600.00</div>
         </div>
         {/* YTD Net */}
         <div className="bg-blue-600 rounded-xl p-5 shadow-sm text-white border border-blue-700">
            <h4 className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-2">YTD Net Pay</h4>
            <div className="text-2xl font-bold">$62,600.00</div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Tax Documents */}
         <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col gap-4">
               <h3 className="text-base font-bold text-slate-900 dark:text-white">Tax Documents</h3>
               {year === "2024" ? (
                  <div className="text-sm text-slate-500 p-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-center">
                     2024 W-2 will be available in Jan 2025.
                  </div>
               ) : (
                  <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg group hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                           <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                           <div className="font-semibold text-sm text-slate-900 dark:text-white">{year} W-2 Form</div>
                           <div className="text-xs text-slate-500">Available since Jan 15</div>
                        </div>
                     </div>
                     <button className="text-blue-600 hover:text-blue-800 p-2"><Download size={16} /></button>
                  </div>
               )}
            </div>
         </div>

         {/* Pay Stubs */}
         <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
               <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Pay Stubs</h3>
                  <button className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
                     <Filter size={16} /> Filter
                  </button>
               </div>
               
               <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <tr>
                           <th className="px-6 py-3 font-medium">Pay Period</th>
                           <th className="px-6 py-3 font-medium">Pay Date</th>
                           <th className="px-6 py-3 font-medium text-right">Gross Pay</th>
                           <th className="px-6 py-3 font-medium text-right">Net Pay</th>
                           <th className="px-6 py-3 font-medium text-center">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[1, 2, 3, 4, 5].map((item) => (
                           <tr key={item} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="px-6 py-4">
                                 <span className="font-medium text-slate-900 dark:text-white">Oct {item*2}-Oct {item*2+14}, 2024</span>
                              </td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                 Oct {item*2+16}, 2024
                              </td>
                              <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                                 $4,200.00
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                                 $3,120.00
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <button className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center gap-1">
                                    View <ChevronRightIcon className="w-4 h-4" />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ChevronRightIcon(props: any) {
   return (
     <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <polyline points="9 18 15 12 9 6" />
     </svg>
   )
}
