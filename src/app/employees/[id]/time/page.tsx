"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { getEmployeeById } from "@/data/mockEmployees";
import { Clock, Calendar as CalendarIcon, CheckCircle2, Clock3 } from "lucide-react";

export default function TimeTab() {
  const { id } = useParams();
  const emp = useMemo(() => getEmployeeById(id as string), [id]);

  if (!emp) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* PTO Balance Donut mock */}
      <div className="lg:col-span-1 flex flex-col gap-6">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col items-center">
            <h3 className="text-base font-bold text-slate-900 dark:text-white w-full mb-6">PTO Balances</h3>
            
            <div className="relative w-40 h-40">
               {/* Mock Donut Chart via SVG */}
               <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path
                     className="text-slate-100 dark:text-slate-800"
                     strokeWidth="4"
                     stroke="currentColor"
                     fill="none"
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                     className="text-blue-500"
                     strokeWidth="4"
                     strokeDasharray="60, 100" // e.g. 60% remaining
                     strokeLinecap="round"
                     stroke="currentColor"
                     fill="none"
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">120</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Hours Left</span>
               </div>
            </div>

            <div className="w-full mt-6 space-y-3">
               <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"/> Vacation</div>
                  <span className="font-semibold">80 hrs</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"/> Sick Leave</div>
                  <span className="font-semibold">40 hrs</span>
               </div>
            </div>
         </div>

         {/* Upcoming PTO */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <CalendarIcon size={18} className="text-blue-500" /> Upcoming Leave
            </h3>
            <div className="flex flex-col gap-3">
               {emp.history.timeOff.length > 0 ? emp.history.timeOff.map(leave => (
                  <div key={leave.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg">
                     <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">{leave.type}</span>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                           {leave.status}
                        </span>
                     </div>
                     <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                     </div>
                     <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">Total: {leave.hours} hrs</div>
                  </div>
               )) : (
                  <p className="text-sm text-slate-500">No upcoming leave scheduled.</p>
               )}
            </div>
         </div>
      </div>

      {/* Timesheet Data */}
      <div className="lg:col-span-2">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
               <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock size={18} className="text-blue-500" /> Timesheet History
               </h3>
               <select className="text-sm border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-800">
                  <option>Current Pay Period</option>
                  <option>Previous Pay Period</option>
               </select>
            </div>
            
            <div className="flex-1 overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                     <tr>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Clock In</th>
                        <th className="px-6 py-3 font-medium">Clock Out</th>
                        <th className="px-6 py-3 font-medium">Total</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                     </tr>
                  </thead>
                  {emp.type === 'Hourly' ? (
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[1,2,3].map(i => (
                           <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">Mon, Oct {10 + i}</td>
                              <td className="px-6 py-3 text-slate-600 dark:text-slate-400">09:00 AM</td>
                              <td className="px-6 py-3 text-slate-600 dark:text-slate-400">05:00 PM</td>
                              <td className="px-6 py-3 font-semibold text-slate-900 dark:text-white">8h 0m</td>
                              <td className="px-6 py-3">
                                 <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle2 size={12}/> Logged</span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  ) : (
                     <tbody>
                        <tr>
                           <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                              <div className="flex flex-col items-center gap-2">
                                 <Clock3 size={32} className="text-slate-300 dark:text-slate-600" />
                                 <p>Employee is salaried / exempt.</p>
                                 <p className="text-xs">Timesheets are not required for this employee type.</p>
                              </div>
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
