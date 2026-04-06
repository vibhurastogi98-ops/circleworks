"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useEmployee } from "@/hooks/useEmployees";
import { HeartPulse, CheckCircle2, ShieldAlert, Users, PlusCircle, Loader2, AlertCircle } from "lucide-react";

export default function BenefitsTab() {
  const { id } = useParams();
  const { data: emp, isLoading, error } = useEmployee(id as string);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading benefits data...</p>
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

  const enrollments = emp.benefitEnrollments || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* Left Col: Active Benefits */}
      <div className="lg:col-span-2 flex flex-col gap-6">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Enrollments</h3>
               <button className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30 transition-all">
                  Report QLE
               </button>
            </div>

            <div className="flex flex-col gap-4">
               {enrollments.length > 0 ? enrollments.map((enrollment: any) => (
                  <div key={enrollment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30 gap-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                           <HeartPulse size={20} />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">{enrollment.plan?.type || 'Benefit'}</span>
                              {(enrollment.status === 'Active' || enrollment.status === 'Enrolled') && <CheckCircle2 size={14} className="text-green-500" />}
                           </div>
                           <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{enrollment.plan?.name || "Standard Plan"}</div>
                        </div>
                     </div>
                     
                     <div className="flex gap-6 text-sm">
                        <div className="flex flex-col text-right">
                           <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tight">Employer</span>
                           <span className="font-semibold text-slate-900 dark:text-white">${enrollment.plan?.employerPremium || 0}/mo</span>
                        </div>
                        <div className="flex flex-col text-right">
                           <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tight">Employee</span>
                           <span className="font-semibold text-slate-900 dark:text-white">${enrollment.plan?.employeePremium || 0}/mo</span>
                        </div>
                     </div>
                  </div>
               )) : (
                  <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center gap-3">
                     <HeartPulse size={32} className="text-slate-300 dark:text-slate-700" />
                     <div>
                       <p className="font-semibold text-slate-900 dark:text-white">No active enrollments</p>
                       <p className="text-sm text-slate-500 mt-1 px-4 max-w-sm">This employee hasn't enrolled in any benefits yet. Once they complete onboarding, their eligible plans will appear here.</p>
                     </div>
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
               <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 group transition-colors">
                  <PlusCircle size={16} className="text-slate-400 group-hover:text-blue-500" /> Add Dependent
               </button>
            </div>
            
            <p className="text-sm text-slate-500 italic">No dependents registered for this employee.</p>
         </div>
      </div>

      {/* Right Col: Details */}
      <div className="lg:col-span-1 flex flex-col gap-6">
         {emp.status === 'terminated' ? (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6 shadow-sm">
               <h3 className="text-amber-800 dark:text-amber-400 font-bold flex items-center gap-2 mb-2">
                  <ShieldAlert size={18} /> COBRA Status
               </h3>
               <p className="text-sm text-amber-700 dark:text-amber-500/80 mb-4 lh-relaxed">Employee is eligible for COBRA. Notice was automatically generated upon termination.</p>
               <button className="w-full py-2 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-400 rounded-lg text-sm font-semibold bg-white dark:bg-transparent hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-all">
                  Generate COBRA Notice
               </button>
            </div>
         ) : (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-6 shadow-sm">
               <h3 className="text-blue-800 dark:text-blue-400 font-bold flex items-center gap-2 mb-2">
                  <ShieldAlert size={18} /> Compliance
               </h3>
               <p className="text-sm text-blue-700 dark:text-blue-500/80 mb-4 lh-relaxed">All required benefits notices and enrollment disclosures have been acknowledged by the employee.</p>
            </div>
         )}

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Benefit Summaries</h3>
            <div className="flex flex-col gap-4">
               <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Employer Cost</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                     ${enrollments.reduce((acc: number, curr: any) => acc + (curr.plan?.employerPremium || 0), 0)}/mo
                  </span>
               </div>
               <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Employee Cost</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                     ${enrollments.reduce((acc: number, curr: any) => acc + (curr.plan?.employeePremium || 0), 0)}/mo
                  </span>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
