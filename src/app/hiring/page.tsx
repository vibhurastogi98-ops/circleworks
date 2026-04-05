"use client";

import React from "react";
import Link from "next/link";
import { Plus, Users, Clock, Target, Briefcase } from "lucide-react";
import { mockAtsJobs, mockAtsCandidates } from "@/data/mockAts";

export default function HiringDashboard() {
  const activeJobs = mockAtsJobs.filter(j => j.status === "Active");
  const applicants = mockAtsCandidates.length;
  
  // Pipeline Funnel Mock Data
  const funnel = [
    { label: "New Applicants", value: 342, percentage: 100 },
    { label: "Screening", value: 85, percentage: 25 },
    { label: "Onsite", value: 31, percentage: 9 },
    { label: "Offers", value: 8, percentage: 2.3 },
    { label: "Hired", value: 5, percentage: 1.4 },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recruiting Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track pipeline velocity and open requisitions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/hiring/jobs" className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            View All Jobs
          </Link>
          <Link href="/hiring/jobs/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus size={16} /> Add Job
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
            <div>
               <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Open Reqs</h4>
               <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeJobs.length}</div>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"><Briefcase size={20}/></div>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
            <div>
               <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Candidates</h4>
               <div className="text-2xl font-bold text-slate-900 dark:text-white">{applicants}</div>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg"><Users size={20}/></div>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
            <div>
               <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Avg Time to Hire</h4>
               <div className="text-2xl font-bold text-slate-900 dark:text-white">28 days</div>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg"><Clock size={20}/></div>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
            <div>
               <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Offer Acceptance Rate</h4>
               <div className="text-2xl font-bold text-slate-900 dark:text-white">88%</div>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg"><Target size={20}/></div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Pipeline Funnel */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Pipeline Velocity</h3>
            <div className="flex flex-col gap-4">
               {funnel.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                     <div className="w-32 text-sm font-medium text-slate-600 dark:text-slate-400 truncate">{stage.label}</div>
                     <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden flex">
                        <div 
                           className="h-full bg-blue-500 flex items-center justify-end pr-2 text-xs font-bold text-white transition-all duration-1000 ease-out" 
                           style={{ width: `${Math.max(10, stage.percentage)}%` }} // ensure value is visible
                        >
                           {stage.value}
                        </div>
                     </div>
                     <div className="w-12 text-right text-xs font-semibold text-slate-500">{stage.percentage}%</div>
                  </div>
               ))}
            </div>
         </div>

         {/* Top Sources */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Top Sourcing Channels</h3>
            <div className="flex flex-col gap-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-[#0A66C2]"></div>
                     <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">LinkedIn</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">45%</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
                     <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Referrals</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">25%</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                     <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Indeed</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">15%</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                     <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Direct / Organic</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">10%</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                     <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Other Agencies</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">5%</span>
               </div>
            </div>
         </div>
      </div>
      
    </div>
  );
}
