"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, Link as LinkIcon, Archive } from "lucide-react";
import { mockAtsJobs, JobStatus } from "@/data/mockAts";

export default function JobsDirectory() {
  const [filter, setFilter] = useState<"Active" | "Archived">("Active");

  // In real app, we filter by Active/Paused vs Closed
  const displayedJobs = mockAtsJobs.filter(j => 
    filter === "Active" ? (j.status === "Active" || j.status === "Draft" || j.status === "Paused") : j.status === "Closed"
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Job Listings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage all open requisitions and draft posts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/hiring/jobs/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus size={16} /> Create Job
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
         <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button 
               onClick={() => setFilter("Active")}
               className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === "Active" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
            >
               Active Reqs
            </button>
            <button 
               onClick={() => setFilter("Archived")}
               className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === "Archived" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
            >
               Archived / Closed
            </button>
         </div>

         <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search jobs..." 
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
               />
            </div>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
               <Filter size={18} />
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium tracking-wide">
                  <tr>
                     <th className="px-6 py-4">Job Title</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-center">Applicants</th>
                     <th className="px-6 py-4">Days Open</th>
                     <th className="px-6 py-4">Posted Date</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedJobs.map(job => (
                     <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 group">
                        <td className="px-6 py-4">
                           <Link href={`/hiring/jobs/${job.id}`} className="block focus:outline-none">
                              <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{job.title}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                 <span>{job.department}</span>
                                 <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                 <span>{job.location}</span>
                                 <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                 <span>{job.type}</span>
                              </div>
                           </Link>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                              ${job.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                job.status === 'Draft' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                job.status === 'Paused' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                              }
                           `}>
                              {job.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <Link href={`/hiring/jobs/${job.id}`} className="inline-flex items-center justify-center min-w-[2rem] h-6 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-bold text-xs hover:bg-blue-100 transition-colors">
                              {job.applicantsCount}
                           </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                           {job.daysOpen} days
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                           {new Date(job.postedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Copy Public Link">
                                 <LinkIcon size={16} />
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded" title="Archive Post">
                                 <Archive size={16} />
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="More Options">
                                 <MoreHorizontal size={16} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
                  {displayedJobs.length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                           No jobs found matching the current filters.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
