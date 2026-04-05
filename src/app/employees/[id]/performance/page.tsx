"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { getEmployeeById } from "@/data/mockEmployees";
import { Target, Star, MessagesSquare, CheckCircle2, CircleDashed } from "lucide-react";

export default function PerformanceTab() {
  const { id } = useParams();
  const emp = useMemo(() => getEmployeeById(id as string), [id]);

  if (!emp) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      
      {/* Current Cycle Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
         {/* Decorative flare */}
         <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-blue-100 dark:from-blue-900/20 to-transparent rounded-bl-full pointer-events-none" />

         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Current Cycle</h3>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white">Q3 2024 Performance Review</h2>
               <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">The current review cycle is actively accepting self reflections and manager evaluations.</p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
               <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm justify-between">
                     <span className="text-slate-600 dark:text-slate-400">Self Review</span>
                     <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle2 size={14}/> Done</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm justify-between">
                     <span className="text-slate-600 dark:text-slate-400">Manager Review</span>
                     <span className="flex items-center gap-1 text-amber-600 font-bold"><CircleDashed size={14}/> In Progress</span>
                  </div>
               </div>
               <div className="w-px h-12 bg-slate-200 dark:bg-slate-700 mx-2" />
               <div className="flex flex-col items-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">50%</div>
                  <div className="text-xs text-slate-500 uppercase font-medium">Complete</div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Goal Progress */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
               <Target size={18} className="text-blue-500" /> Q3 OKRs & Goals
            </h3>
            
            <div className="flex flex-col gap-5 flex-1">
               <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                     <span className="font-semibold text-slate-900 dark:text-white">Launch V2 Redesign</span>
                     <span className="text-blue-600 font-bold">85%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }} />
                  </div>
               </div>

               <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                     <span className="font-semibold text-slate-900 dark:text-white">Reduce bundle size by 20%</span>
                     <span className="text-blue-600 font-bold">100%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                  </div>
               </div>

               <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                     <span className="font-semibold text-slate-900 dark:text-white">Write 3 technical blog posts</span>
                     <span className="text-blue-600 font-bold">33%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-amber-500 rounded-full" style={{ width: '33%' }} />
                  </div>
               </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-center text-slate-500">
               To update goals, please navigate to the Performance module.
            </div>
         </div>

         {/* Past Reviews & Feedback */}
         <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
               <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star size={18} className="text-amber-500" /> Past Reviews
               </h3>
               <div className="flex flex-col gap-3">
                  {emp.history.performance.filter(p => p.status === 'Completed').length > 0 ? (
                     emp.history.performance.filter(p => p.status === 'Completed').map(review => (
                        <div key={review.id} className="p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex justify-between items-center cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors">
                           <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-white">{review.cycle}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">Finalized on {review.submittedAt ? new Date(review.submittedAt).toLocaleDateString() : 'Unknown'}</div>
                           </div>
                           <div className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                              {review.rating || 'N/A'}
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-sm text-slate-500 italic p-4 text-center">No completed past reviews.</div>
                  )}
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
               <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessagesSquare size={18} className="text-purple-500" /> Continuous Feedback
               </h3>
               <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 rounded-lg">
                  <p className="text-sm italic text-purple-900 dark:text-purple-300">"{emp.firstName} did an incredible job mentoring the new hires this quarter. They really stepped up to the plate and showed great leadership skills."</p>
                  <div className="flex justify-between items-center mt-3 text-xs">
                     <span className="font-semibold text-purple-700 dark:text-purple-400">— Sarah Connor (Manager)</span>
                     <span className="text-purple-500/70">1 month ago</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
