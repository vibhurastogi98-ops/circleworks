"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { mockAtsCandidates, getJobById } from "@/data/mockAts";
import Link from "next/link";
import { ChevronLeft, Calendar, FileText, CheckCircle2, MessageSquare, Download } from "lucide-react";

export default function ApplicantProfilePage() {
  const { id } = useParams();
  const candidate = useMemo(() => mockAtsCandidates.find(c => c.id === id) || mockAtsCandidates[0], [id]);
  const job = useMemo(() => getJobById(candidate?.jobId) || { title: "Untitled Job" }, [candidate]);

  if (!candidate) return <div>Applicant not found</div>;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
            <Link href={`/hiring/jobs/${candidate.jobId}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-fit">
               <ChevronLeft size={16} /> Back to Kanban Board
            </Link>
            <div className="flex items-end gap-4">
               <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                  {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
               </div>
               <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{candidate.firstName} {candidate.lastName}</h1>
                  <p className="text-sm text-slate-500">Applying for <span className="font-semibold">{job.title}</span> • Stage: <span className="text-blue-600 dark:text-blue-400 font-bold">{candidate.stage}</span></p>
               </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm flex items-center gap-2">
            <MessageSquare size={16} /> Email Candidate
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            <Calendar size={16} /> Schedule Interview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
         
         {/* Left Col - App Answers & Details */}
         <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
               <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Contact Profile</h3>
               <div className="space-y-4 text-sm">
                  <div><span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Email</span><span className="font-medium text-slate-900 dark:text-white">{candidate.email}</span></div>
                  <div><span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Phone</span><span className="font-medium text-slate-900 dark:text-white">+1 (555) 123-4567</span></div>
                  <div><span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Location</span><span className="font-medium text-slate-900 dark:text-white">Austin, TX</span></div>
                  <div><span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Source</span><span className="font-medium text-slate-900 dark:text-white">{candidate.source}</span></div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Form Answers</h3>
                  <button className="text-blue-600 text-xs font-bold hover:underline">Edit</button>
               </div>
               <div className="space-y-4">
                  <div>
                     <span className="text-slate-900 dark:text-white font-medium text-sm block mb-1">Why do you want to work here?</span>
                     <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">"I've been following CircleWorks for years and deeply resonate with the mission to simplify HR software. My background in React aligns perfectly."</p>
                  </div>
                  <div>
                     <span className="text-slate-900 dark:text-white font-medium text-sm block mb-1">Portfolio Link</span>
                     <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">https://github.com/example</a>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Col - Resume & Scorecard summary */}
         <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"><FileText size={18} className="text-blue-500"/> Resume</h3>
                  <button className="text-slate-500 hover:text-blue-600 transition-colors" title="Download Resume"><Download size={18}/></button>
               </div>
               <div className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl h-[400px] flex items-center justify-center relative overflow-hidden group">
                  <p className="text-slate-500 font-medium z-10 drop-shadow-md">PDF Render Simulation Area</p>
                  <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button className="px-6 py-2 bg-slate-900 text-white rounded-lg shadow-lg font-bold">Open Full Screen</button>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
               <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500"/> Interview Scorecards</h3>
               
               <div className="flex flex-col gap-4">
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                     <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">HR Phone Screen</div>
                        <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">Pass</span>
                     </div>
                     <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Great communication skills. Checked all the baseline requirements. Salary expectations are aligned within our stated band.</p>
                     <div className="text-xs text-slate-500">— Alex J. • Sep 10, 2024</div>
                  </div>

                  <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center text-slate-500">
                     Technical Onsite Scorecard is pending...
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
