"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Video, Users, CheckCircle } from "lucide-react";
import { mockAtsInterviews, getCandidatesByJob, mockAtsCandidates } from "@/data/mockAts";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";

export default function InterviewCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date("2024-09-10"));
  const [view, setView] = useState<'Week'|'Month'>("Week");

  // Generate simple week view
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(startDate, i));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 h-[calc(100vh-100px)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Interviews</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your recruiting schedule and interview debriefs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 shadow-sm">
             <button onClick={() => setView('Week')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'Week' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Week</button>
             <button onClick={() => setView('Month')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'Month' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Month</button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus size={16} /> Schedule
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm shrink-0">
         <div className="flex items-center gap-4">
            <button className="p-1 border border-slate-200 dark:border-slate-700 rounded text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronLeft size={20}/></button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white w-48 text-center">
               {format(startDate, "MMM d")} - {format(endOfWeek(startDate, { weekStartsOn: 1 }), "MMM d, yyyy")}
            </h2>
            <button className="p-1 border border-slate-200 dark:border-slate-700 rounded text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronRight size={20}/></button>
         </div>
         <button className="px-3 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">Today</button>
      </div>

      {/* Calendar Grid (Week View Mock) */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col">
         
         {/* Days Header */}
         <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="w-20 shrink-0 border-r border-slate-200 dark:border-slate-800"></div>
            {weekDays.map((day, i) => (
               <div key={i} className="flex-1 text-center py-3 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{format(day, "EEE")}</div>
                  <div className={`mt-1 text-lg font-black ${isSameDay(day, currentDate) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                     {format(day, "d")}
                  </div>
               </div>
            ))}
         </div>

         {/* Time Grid */}
         <div className="flex-1 overflow-y-auto relative bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
            {/* Hour lines */}
            {Array.from({ length: 10 }).map((_, i) => (
               <div key={i} className="flex border-b border-slate-200 dark:border-slate-800/80 h-24">
                  <div className="w-20 shrink-0 border-r border-slate-200 dark:border-slate-800 flex items-start justify-end pr-2 pt-2 text-xs font-medium text-slate-400 bg-white dark:bg-slate-900">
                     {i + 8}:00 AM
                  </div>
                  {weekDays.map((_, dayIndex) => (
                     <div key={dayIndex} className="flex-1 border-r border-slate-200 dark:border-slate-800/30 last:border-r-0 relative">
                        {/* Mock an interview at specific grid slots */}
                        {dayIndex === 1 && i === 2 && ( // Tuesday 10:00 AM
                           <InterviewCard 
                              interview={mockAtsInterviews.find(i=>i.status==='Completed')!} 
                              candidate={mockAtsCandidates.find(c=>c.id==='cand-2')!} 
                           />
                        )}
                        {dayIndex === 4 && i === 6 && ( // Friday 2:00 PM
                           <InterviewCard 
                              interview={mockAtsInterviews.find(i=>i.status==='Scheduled')!} 
                              candidate={mockAtsCandidates.find(c=>c.id==='cand-3')!} 
                           />
                        )}
                     </div>
                  ))}
               </div>
            ))}
         </div>

      </div>
    </div>
  );
}

function InterviewCard({ interview, candidate }: { interview: any, candidate: any }) {
   if (!interview || !candidate) return null;

   const isCompleted = interview.status === 'Completed';

   return (
      <div className={`absolute inset-x-1 top-1 bottom-1 rounded-lg border p-2 shadow-sm flex flex-col gap-1 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] z-10 ${
         isCompleted 
            ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500' 
            : 'bg-blue-50 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800 text-blue-900 dark:text-blue-100'
      }`}>
         <Link href={`/hiring/interviews/${interview.id}`} className="absolute inset-0 z-20 focus:outline-none"></Link>
         
         <div className="flex items-center justify-between text-xs font-bold">
            <span className={isCompleted ? 'text-slate-600 dark:text-slate-400' : 'text-blue-700 dark:text-blue-400'}>
               {format(new Date(interview.scheduledAt), "h:mm a")}
            </span>
            {isCompleted && <CheckCircle size={12} className="text-green-500" />}
         </div>
         <div className={`font-bold line-clamp-1 text-sm ${isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-blue-900 dark:text-white'}`}>
            {candidate.firstName} {candidate.lastName}
         </div>
         <div className="text-xs opacity-80 flex items-center gap-1 line-clamp-1">
            <Video size={10} /> {interview.type}
         </div>
         <div className="text-xs opacity-80 flex items-center gap-1 mt-auto line-clamp-1">
            <Users size={10} /> {interview.interviewers.join(", ")}
         </div>
      </div>
   );
}
