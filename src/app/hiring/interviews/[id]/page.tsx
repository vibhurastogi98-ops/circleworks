"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { mockAtsInterviews, getCandidatesByJob, mockAtsCandidates, getJobById } from "@/data/mockAts";
import Link from "next/link";
import { ChevronLeft, Check, Star, Play, XCircle } from "lucide-react";

export default function InterviewPrepModule() {
  const { id } = useParams();
  const interview = useMemo(() => mockAtsInterviews.find(i => i.id === id) || mockAtsInterviews[0], [id]);
  const candidate = useMemo(() => mockAtsCandidates.find(c => c.id === interview?.candidateId) || mockAtsCandidates[0], [interview]);
  const job = useMemo(() => getJobById(candidate?.jobId) || { title: "Untitled", description: "Standard React Developer Role requires deeply optimized rendering hooks." }, [candidate]);

  const [activeTab, setActiveTab] = useState<'Kit'|'Profile'>('Kit');

  if (!interview || !candidate) return <div>Interview payload not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -my-6 -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 animate-in fade-in bg-slate-50 dark:bg-slate-900/50">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 pb-4">
        <div>
          <Link href="/hiring/interviews" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-fit mb-1">
             <ChevronLeft size={16} /> Schedule
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Interview: {candidate.firstName} {candidate.lastName}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{job.title} • {interview.type} • {new Date(interview.scheduledAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Play size={16} className="fill-white" /> Start Debrief
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
         
         {/* Left Side: Scorecard & Questions (Interview Kit) */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
            <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-800/50">
               <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button onClick={() => setActiveTab('Kit')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'Kit' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Interview Kit</button>
                  <button onClick={() => setActiveTab('Profile')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'Profile' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Candidate Profile</button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar">
               {activeTab === 'Kit' && (
                  <div className="space-y-8 animate-in fade-in">
                     <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Competency: System Design</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-4">"Tell me about a time you had to design a system from scratch for high throughput. What challenges did you face?"</p>
                        <textarea placeholder="Take notes during the interview here..." className="w-full min-h-[100px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                     </div>

                     <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Competency: Mentorship</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-4">"How do you approach onboarding a junior developer to your team?"</p>
                        <textarea placeholder="Take notes during the interview here..." className="w-full min-h-[100px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                     </div>

                     <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Official Scorecard Rating</h3>
                        
                        <div className="space-y-4 mb-6">
                           <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Technical Skills</span>
                              <div className="flex gap-2 text-slate-300 dark:text-slate-600"><Star size={20} className="hover:fill-amber-500 hover:text-amber-500 cursor-pointer transition-colors"/><Star size={20} className="hover:fill-amber-500 hover:text-amber-500 cursor-pointer transition-colors"/><Star size={20} className="hover:fill-amber-500 hover:text-amber-500 cursor-pointer transition-colors"/><Star size={20} className="hover:fill-amber-500 hover:text-amber-500 cursor-pointer transition-colors"/><Star size={20} className="hover:fill-amber-500 hover:text-amber-500 cursor-pointer transition-colors"/></div>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Communication</span>
                              <div className="flex gap-2 text-slate-300 dark:text-slate-600"><Star size={20} className="hover:fill-amber-500 hover:text-amber-500 cursor-pointer transition-colors"/><Star size={20} className="hover:fill-amber-500 hover:text-amber-500 cursor-pointer transition-colors"/><Star size={20} className="hover:fill-amber-500 hover:text-amber-500 cursor-pointer transition-colors"/><Star size={20} className="hover:fill-amber-500 hover:text-amber-500 cursor-pointer transition-colors"/><Star size={20} className="hover:fill-amber-500 hover:text-amber-500 cursor-pointer transition-colors"/></div>
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <button className="flex-1 py-3 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/50 hover:bg-red-100 transition-colors">
                              <XCircle size={18} /> No Hire
                           </button>
                           <button className="flex-1 py-3 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-green-200 dark:border-green-900/50 hover:bg-green-100 transition-colors">
                              <Check size={18} /> Strong Hire
                           </button>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'Profile' && (
                  <div className="space-y-6 animate-in fade-in">
                     <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-sm">
                           {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{candidate.firstName} {candidate.lastName}</h2>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-4">
                           <span>{candidate.email}</span>
                           <span>{candidate.source}</span>
                           <span className="font-bold text-green-600 dark:text-green-400">Match: {candidate.aiScore}%</span>
                        </div>
                     </div>

                     <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Resume Extract</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                           "Passionate developer with 5 years building scalable web architectures passing rigorous scale needs..."
                        </p>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Right Side: Job Description context */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-800/50">
               <h2 className="font-bold text-slate-900 dark:text-white">Job Description: {job.title}</h2>
               <div className="text-xs text-slate-500 mt-1">Reference this to align your questions.</div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 prose prose-sm dark:prose-invert prose-blue max-w-none custom-scrollbar">
               <div>
                  <p>We are seeking an outstanding individual to join our fast-paced Engineering team. You will lead development of robust, scalable applications.</p>
                  <p><strong>Responsibilities:</strong></p>
                  <ul>
                     <li>Lead development of scalable frontend architecture</li>
                     <li>Mentor junior developers and conduct code reviews</li>
                     <li>Collaborate with Product and Design on feature delivery</li>
                  </ul>
                  <p><strong>Requirements:</strong></p>
                  <ul>
                     <li>5+ years building fullstack software</li>
                     <li>Strong communication capabilities</li>
                     <li>Ability to lead squads and mentor junior employees</li>
                  </ul>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
