"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useEmployee } from "@/hooks/useEmployees";
import { Clock, Calendar as CalendarIcon, CheckCircle2, Clock3, Loader2, AlertCircle } from "lucide-react";

export default function TimeTab() {
   const { id } = useParams();
   const { data: emp, isLoading, error } = useEmployee(id as string);

   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading time and attendance data...</p>
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

   const isHourly = emp.employmentType === "hourly";
   const ptoRequests = emp.ptoRequests || [];
   const timesheets = emp.timesheets || [];

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">

         {/* PTO Balances & Upcoming Leave */}
         <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col items-center">
               <h3 className="text-base font-bold text-slate-900 dark:text-white w-full mb-6">PTO Balances</h3>

               <div className="relative w-40 h-40">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                     <path className="text-slate-100 dark:text-slate-800" strokeWidth="4" stroke="currentColor" fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     <path className="text-blue-500" strokeWidth="4" strokeDasharray="0, 100" strokeLinecap="round"
                        stroke="currentColor" fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-3xl font-bold text-slate-900 dark:text-white">0</span>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Hours Available</span>
                  </div>
               </div>

               <div className="w-full mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> Vacation</div>
                     <span className="font-semibold px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded">0.00 hrs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> Sick Leave</div>
                     <span className="font-semibold px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded">0.00 hrs</span>
                  </div>
               </div>
            </div>

            {/* Upcoming PTO */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
               <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CalendarIcon size={18} className="text-blue-500" /> Time Off Requests
               </h3>

               <div className="flex flex-col gap-3">
                  {ptoRequests.length > 0 ? ptoRequests.map((leave: any) => (
                     <div key={leave.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg">
                        <div className="flex justify-between mb-1">
                           <span className="font-semibold text-sm">{leave.type}</span>
                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${leave.status === 'Approved'
                               ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                               : (leave.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')
                               }`}>
                               {leave.status}
                           </span>
                        </div>

                        <div className="text-[11px] text-slate-500">
                           {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                     </div>
                  )) : (
                     <div className="text-center py-6">
                        <p className="text-xs text-slate-500 italic">No PTO requests found.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Timesheet */}
         <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">

               <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-base font-bold flex items-center gap-2">
                     <Clock size={18} className="text-blue-500" /> Timesheet History
                  </h3>
                  <div className="text-xs font-medium text-slate-500 capitalize">{emp.employmentType} Employee</div>
               </div>

               <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium whitespace-nowrap">
                        <tr>
                           <th className="px-6 py-4 text-left">Period</th>
                           <th className="px-6 py-4 text-center">Regular Hours</th>
                           <th className="px-6 py-4 text-center">Overtime</th>
                           <th className="px-6 py-4 text-center">Status</th>
                           <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>

                     {isHourly ? (
                        <tbody>
                           {timesheets.length > 0 ? timesheets.map((ts: any) => (
                              <tr key={ts.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                 <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                                    {new Date(ts.periodStart).toLocaleDateString()} - {new Date(ts.periodEnd).toLocaleDateString()}
                                 </td>
                                 <td className="px-6 py-4 text-center">{ts.totalRegularHours || 0}h</td>
                                 <td className="px-6 py-4 text-center font-medium text-amber-600 dark:text-amber-400">{ts.totalOvertimeHours || 0}h</td>
                                 <td className="px-6 py-4 text-center">
                                    <span className="text-[11px] font-bold px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-sm uppercase">
                                       {ts.status}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">View Detail</button>
                                 </td>
                              </tr>
                           )) : (
                              <tr>
                                 <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    <Clock3 size={40} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-medium">No timesheets found for this employee.</p>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     ) : (
                        <tbody>
                           <tr>
                              <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                                 <Clock3 size={48} className="mx-auto mb-4 text-slate-200 dark:text-slate-800" />
                                 <p className="text-lg font-bold text-slate-900 dark:text-white">Salaried Employee</p>
                                 <p className="text-sm text-slate-500 mt-1">Automatic payroll processing; manual timesheets not required.</p>
                              </td>
                           </tr>
                        </tbody>
                     )}

                  </table>
               </div>

            </div>
         </div>

      </div>
   );
}