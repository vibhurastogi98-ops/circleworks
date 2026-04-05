"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { getEmployeeById } from "@/data/mockEmployees";
import { HeartPulse, CheckCircle2, ShieldAlert, Users, PlusCircle } from "lucide-react";

export default function BenefitsTab() {
  const { id } = useParams();
  const emp = useMemo(() => getEmployeeById(id as string), [id]);

  if (!emp) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* Left Col: Active Benefits */}
      <div className="lg:col-span-2 flex flex-col gap-6">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Enrollments</h3>
               <button className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  Report QLE
               </button>
            </div>

            <div className="flex flex-col gap-4">
               {emp.history.benefits.length > 0 ? emp.history.benefits.map((benefit) => (
                  <div key={benefit.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30 gap-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                           <HeartPulse size={20} />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">{benefit.type}</span>
                              {benefit.status === 'Enrolled' && <CheckCircle2 size={14} className="text-green-500" />}
                           </div>
                           <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{benefit.planName || "Standard Plan"}</div>
                        </div>
                     </div>
                     
                     {benefit.employerContribution ? (
                        <div className="flex gap-6 text-sm">
                           <div className="flex flex-col text-right">
                              <span className="text-slate-500 text-xs uppercase font-medium">Employer</span>
                              <span className="font-semibold text-slate-900 dark:text-white">${benefit.employerContribution}/mo</span>
                           </div>
                           <div className="flex flex-col text-right">
                              <span className="text-slate-500 text-xs uppercase font-medium">Employee</span>
                              <span className="font-semibold text-slate-900 dark:text-white">${benefit.employeeContribution}/mo</span>
                           </div>
                        </div>
                     ) : (
                        <div className="text-sm text-slate-500 italic">No contribution data</div>
                     )}
                  </div>
               )) : (
                  <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-500">
                     No benefits enrolled yet. Eligible for open enrollment in 14 days.
                  </div>
               )}
            </div>
         </div>

         {/* Dependents */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users size={18} className="text-blue-500" /> Dependents
               </h3>
               <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
                  <PlusCircle size={16} /> Add 
               </button>
            </div>
            
            <p className="text-sm text-slate-500 italic">No dependents registered.</p>
         </div>
      </div>

      {/* Right Col: Details */}
      <div className="lg:col-span-1 flex flex-col gap-6">
         {emp.status === 'Terminated' ? (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6 shadow-sm">
               <h3 className="text-amber-800 dark:text-amber-400 font-bold flex items-center gap-2 mb-2">
                  <ShieldAlert size={18} /> COBRA Status
               </h3>
               <p className="text-sm text-amber-700 dark:text-amber-500/80 mb-4">Employee is eligible for COBRA. Notice was sent on {new Date().toLocaleDateString()}.</p>
               <button className="w-full py-1.5 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-400 rounded-lg text-sm font-medium bg-white dark:bg-transparent">
                  View Notice Data
               </button>
            </div>
         ) : null}

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Benefit Summaries</h3>
            <div className="flex flex-col gap-4">
               <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Employer Cost</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                     ${emp.history.benefits.reduce((acc, curr) => acc + (curr.employerContribution || 0), 0)}/mo
                  </span>
               </div>
               <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Employee Cost</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                     ${emp.history.benefits.reduce((acc, curr) => acc + (curr.employeeContribution || 0), 0)}/mo
                  </span>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
