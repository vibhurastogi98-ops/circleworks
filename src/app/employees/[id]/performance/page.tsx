"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useEmployee } from "@/hooks/useEmployees";
import { Target, Star, MessagesSquare, CheckCircle2, CircleDashed, Loader2, AlertCircle, Award } from "lucide-react";

export default function PerformanceTab() {
  const { id } = useParams();
  const { data: emp, isLoading, error } = useEmployee(id as string);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading performance records...</p>
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

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      
      {/* Current Cycle Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm relative overflow-hidden">
         {/* Decorative flare */}
         <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-blue-50/50 dark:from-blue-900/10 to-transparent rounded-bl-full pointer-events-none" />

         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
                  <Star size={12} fill="currentColor" /> Ongoing Cycle
               </div>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white">Annual Performance Review 2024</h2>
               <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg leading-relaxed">
                  The current review cycle has not yet reached the evaluation phase. 
                  Once managers begin the review process, status and progress will appear here.
               </p>
            </div>

            <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
               <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight justify-between min-w-[140px]">
                     <span className="text-slate-500">Self Assessment</span>
                     <span className="text-slate-400">Not Started</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight justify-between">
                     <span className="text-slate-500">Manager Review</span>
                     <span className="text-slate-400">Not Started</span>
                  </div>
               </div>
               <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 mx-1" />
               <div className="flex flex-col items-center">
                  <div className="text-2xl font-black text-slate-300 dark:text-slate-600 italic">0%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Global</div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Goal Progress */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
               <Target size={18} className="text-blue-500" /> Active Goals & OKRs
            </h3>
            
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center gap-4">
               <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700">
                  <Target size={32} />
               </div>
               <div>
                  <p className="font-bold text-slate-900 dark:text-white">No active goals found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Strategic objectives for this period haven't been assigned or created yet.</p>
               </div>
               <button className="mt-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm">
                  Create First Goal
               </button>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-center text-slate-400">
               Strategic Management
            </div>
         </div>

         {/* Past Reviews & Feedback */}
         <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[220px] flex flex-col">
               <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Award size={18} className="text-amber-500" /> Professional History
               </h3>
               <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                  <Star size={32} className="text-slate-200 dark:text-slate-800 mb-3" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Historical Clean Slate</p>
                  <p className="text-xs text-slate-500 mt-1">No past review data exists for this employee in CircleWorks.</p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
               <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <MessagesSquare size={18} className="text-purple-500" /> Continuous Feedback
               </h3>
               <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl flex flex-col items-center text-center gap-3">
                  <MessagesSquare size={24} className="text-slate-300 dark:text-slate-700" />
                  <div className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                     Peer recognition and manager feedback will be pinned here as they are received.
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
