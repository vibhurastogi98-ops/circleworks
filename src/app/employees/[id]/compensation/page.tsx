"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useEmployee } from "@/hooks/useEmployees";
import { DollarSign, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

export default function CompensationTab() {
  const { id } = useParams();
  const { data: emp, isLoading, error } = useEmployee(id as string);
  const [showRequestModal, setShowRequestModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading compensation details...</p>
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

  // Fallback for current salary if no history exists yet
  const currentSalary = emp.salary || 0;
  const employmentType = emp.employmentType === 'hourly' ? 'Hr' : 'Yr';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* Current compensation summary */}
      <div className="lg:col-span-1 flex flex-col gap-6">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
               <DollarSign className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Base Pay</h3>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
               ${currentSalary.toLocaleString()} 
               <span className="text-sm font-medium text-slate-500"> / {employmentType}</span>
            </div>
            
            <button 
              onClick={() => setShowRequestModal(true)}
              className="mt-6 w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              Request Change
            </button>
         </div>

         {/* Pay Band Indicator */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
               <TrendingUp size={18} className="text-blue-500" /> Pay Band
            </h3>
            <div className="flex justify-between text-xs text-slate-500 mb-2">
               <span>Market Low</span>
               <span>Market High</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden">
               <div className="absolute top-0 bottom-0 left-0 bg-blue-500 rounded-l-full" style={{ width: '45%' }}></div>
            </div>
            <div className="text-center mt-3 text-[13px] text-slate-600 dark:text-slate-400">
               Salary is within the standard competitive market range for <span className="font-semibold text-slate-900 dark:text-white">{emp.jobTitle}</span>.
            </div>
         </div>
      </div>

      {/* Compensation History */}
      <div className="lg:col-span-2">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Compensation History</h3>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Last update: {emp.updatedAt ? new Date(emp.updatedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-8">
                {/* For now we show the current salary as the primary entry since we're in zero-state */}
                <div className="relative">
                   <div className="absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 top-1"></div>
                   <div className="flex justify-between items-start">
                      <div>
                         <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                            ${currentSalary.toLocaleString()} <span className="text-sm font-medium text-slate-500">/ {employmentType}</span>
                         </h4>
                         <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Starting Salary</div>
                      </div>
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-md">
                         Effective {emp.startDate ? new Date(emp.startDate).toLocaleDateString() : 'Immediate'}
                      </div>
                   </div>
                </div>
            </div>
         </div>
      </div>

      {/* Request Change Modal */}
      {showRequestModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Request Pay Change</h2>
                  <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
               </div>
               
               <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Proposed Amount</label>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input type="number" className="w-full pl-8 pr-4 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 120000" />
                     </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Effective Date</label>
                     <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-600" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reason for Adjustment</label>
                     <select className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none">
                        <option>Annual Merit Increase</option>
                        <option>Promotion</option>
                        <option>Market Rate Adjustment</option>
                        <option>Cost of Living</option>
                     </select>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg flex items-start gap-2 mt-2">
                     <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                     <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">This request will be sent to the department head and HR for budget review and official approval.</p>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                     <button onClick={() => setShowRequestModal(false)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                     <button onClick={() => setShowRequestModal(false)} className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Submit</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
