"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, Link as LinkIcon, Archive, Edit, Pause, Play, Trash2, X } from "lucide-react";
import { mockAtsJobs, AtsJob, JobStatus, deleteJob, updateJobStatus } from "@/data/mockAts";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";

export default function JobsDirectory() {
  const [filter, setFilter] = useState<"Active" | "Archived">("Active");
  const [jobs, setJobs] = useState<AtsJob[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ department: "", location: "" });

  // Sync with global mock data on mount to catch newly created jobs
  useEffect(() => {
    setIsMounted(true);
    setJobs([...mockAtsJobs]);
  }, []);

  // Filter and Search logic
  const displayedJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchFilter = filter === "Active" 
        ? (j.status === "Active" || j.status === "Draft" || j.status === "Paused") 
        : j.status === "Closed";
      
      const matchSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         j.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         j.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDept = !activeFilters.department || j.department === activeFilters.department;
      const matchLoc = !activeFilters.location || j.location.includes(activeFilters.location);

      return matchFilter && matchSearch && matchDept && matchLoc;
    });
  }, [jobs, filter, searchQuery, activeFilters]);

  const handleCopyLink = (job: AtsJob) => {
    const url = `${window.location.origin}/careers/${job.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!", { description: `Public link for "${job.title}" copied to clipboard.` });
  };

  const handleArchive = (job: AtsJob) => {
    updateJobStatus(job.id, "Closed");
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: "Closed" as JobStatus } : j));
    toast.success("Job archived", { description: `"${job.title}" has been moved to Archived.` });
    setOpenMenuId(null);
  };

  const handleTogglePause = (job: AtsJob) => {
    const newStatus: JobStatus = job.status === "Paused" ? "Active" : "Paused";
    updateJobStatus(job.id, newStatus);
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
    toast.success(newStatus === "Paused" ? "Job paused" : "Job reactivated", {
      description: `"${job.title}" is now ${newStatus.toLowerCase()}.`,
    });
    setOpenMenuId(null);
  };

  if (!isMounted) return null;

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs..." 
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
               />
            </div>
            <div className="relative">
               <button 
                 onClick={() => setShowFilters(!showFilters)}
                 className={`p-2 border rounded-lg transition-colors ${showFilters || activeFilters.department || activeFilters.location ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
               >
                  <Filter size={18} />
               </button>

               {showFilters && (
                 <>
                   <div className="fixed inset-0 z-30" onClick={() => setShowFilters(false)} />
                   <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-40 p-4 animate-in fade-in zoom-in duration-200">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Advanced Filters</h4>
                      
                      <div className="flex flex-col gap-4">
                         <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
                            <select 
                               value={activeFilters.department}
                               onChange={(e) => setActiveFilters({...activeFilters, department: e.target.value})}
                               className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
                            >
                               <option value="">All Departments</option>
                               <option value="Engineering">Engineering</option>
                               <option value="Product">Product</option>
                               <option value="Marketing">Marketing</option>
                               <option value="Sales">Sales</option>
                            </select>
                         </div>

                         <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Location Type</label>
                            <div className="flex gap-2">
                               {["Remote", "San Francisco", "New York"].map(loc => (
                                  <button 
                                     key={loc}
                                     onClick={() => setActiveFilters({...activeFilters, location: activeFilters.location === loc ? "" : loc})}
                                     className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${activeFilters.location === loc ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'}`}
                                  >
                                     {loc}
                                  </button>
                               ))}
                            </div>
                         </div>

                         <div className="pt-2 border-t border-slate-100 dark:border-slate-700 mt-2 flex justify-between">
                            <button 
                               onClick={() => setActiveFilters({ department: "", location: "" })}
                               className="text-xs font-bold text-slate-400 hover:text-slate-600"
                            >
                               Reset All
                            </button>
                            <button 
                               onClick={() => setShowFilters(false)}
                               className="text-xs font-bold text-blue-600 hover:text-blue-700"
                            >
                               Apply Filters
                            </button>
                         </div>
                      </div>
                   </div>
                 </>
               )}
            </div>
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
                  {displayedJobs.map((job: AtsJob) => (
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
                           {formatDate(job.postedDate)}
                        </td>
                        <td className="px-6 py-4 text-right overflow-visible">
                           <div className="flex items-center justify-end gap-2 relative">
                              <button 
                                onClick={() => handleCopyLink(job)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" 
                                title="Copy Public Link"
                              >
                                 <LinkIcon size={16} />
                              </button>
                              <button 
                                onClick={() => handleArchive(job)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors" 
                                title="Archive Post"
                              >
                                 <Archive size={16} />
                              </button>
                              <div className="relative group/menu">
                                 <button 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                     setMenuPosition({ top: rect.bottom + 8, left: rect.right - 192 }); // 192 is w-48
                                     setOpenMenuId(openMenuId === job.id ? null : job.id);
                                   }}
                                   className={`p-1.5 rounded transition-colors ${openMenuId === job.id ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}`} 
                                   title="More Options"
                                 >
                                    <MoreHorizontal size={16} />
                                 </button>
                                 {openMenuId === job.id && (
                                   <>
                                     <div className="fixed inset-0 z-[100]" onClick={() => setOpenMenuId(null)} />
                                     <div 
                                       className="fixed w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[101] py-1 overflow-hidden animate-in fade-in zoom-in duration-200"
                                       style={{ top: menuPosition.top, left: menuPosition.left }}
                                     >
                                      <button 
                                        onClick={() => handleTogglePause(job)}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition-colors"
                                      >
                                        {job.status === 'Paused' ? <Play size={16} className="text-emerald-500" /> : <Pause size={16} className="text-amber-500" />}
                                        {job.status === 'Paused' ? 'Resume Posting' : 'Pause Posting'}
                                      </button>
                                      <Link 
                                        href={`/hiring/jobs/${job.id}/edit`}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition-colors"
                                      >
                                        <Edit size={16} className="text-indigo-500" />
                                        Edit Details
                                      </Link>
                                      <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                                      <button 
                                        onClick={() => {
                                          deleteJob(job.id);
                                          setJobs(prev => prev.filter(j => j.id !== job.id));
                                          toast.error("Job deleted", { description: `"${job.title}" has been permanently removed.` });
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
                                      >
                                        <Trash2 size={16} />
                                        Delete Permanently
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
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
