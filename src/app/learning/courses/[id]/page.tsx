"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Play, 
  FileText, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Award, 
  ShieldCheck, 
  ChevronRight, 
  Download,
  Users,
  Settings,
  MoreHorizontal,
  Info,
  BarChart2,
  Lock,
  Pause,
  Zap
} from "lucide-react";
import Link from "next/link";
import { mockCourses } from "@/data/mockLearning";

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const course = mockCourses.find(c => c.id === params.id) || mockCourses[0];
  const completedCount = course.modules.filter(m => m.completed).length;
  const progressPercent = Math.round((completedCount / course.modules.length) * 100);

  return (
    <div className="space-y-8 pb-24">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/learning/courses" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
             <ArrowLeft size={20} className="text-slate-500" />
          </Link>
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{course.title}</h1>
                {course.isMandatory && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-[10px] font-black uppercase tracking-widest">Mandatory</span>
                )}
             </div>
             <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                Category: <span className="text-blue-600 dark:text-blue-400 uppercase font-black tracking-tight">{course.category}</span>
                <span className="mx-2 text-slate-300">•</span>
                Duration: <span className="text-slate-700 dark:text-slate-300 font-bold">{course.duration}</span>
             </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
             <Settings size={18} />
             Course Admin
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 group">
             {progressPercent === 100 ? (
               <>
                 <Download size={18} />
                 Certificate
               </>
             ) : (
               <>
                 <Play size={18} className="fill-current group-hover:scale-110 transition-transform" />
                 Resume Learning
               </>
             )}
          </button>
        </div>
      </div>

      {/* Main Content: Player/Description & Module Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Course Intro / Player */}
        <div className="lg:col-span-2 space-y-8">
           {/* Player Placeholder */}
           <div className="relative aspect-video bg-black rounded-3xl overflow-hidden group shadow-2xl">
              <img 
                src={course.thumbnail} 
                alt="Player Placeholder" 
                className={`w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-20 blur-sm' : 'opacity-60'}`} 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                 <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:scale-110 transition-transform active:scale-95 shadow-2xl"
                 >
                   {isPlaying ? <Pause size={40} className="fill-current" /> : <Play size={40} className="fill-current ml-2" />}
                 </button>
                 {!isPlaying && <p className="text-white font-black text-xl uppercase tracking-widest bg-black/40 px-4 py-1 rounded-full backdrop-blur-md border border-white/10">Resume Module 3</p>}
              </div>

              {/* Player Overlay Controls */}
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                       <Zap size={12} className="text-yellow-400" />
                       PHISHING & SOCIAL ENGINEERING
                    </span>
                    <span className="text-[10px] font-bold text-white/60">12:45 / 15:00</span>
                 </div>
                 <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[85%] rounded-full" />
                 </div>
              </div>
           </div>

           {/* Description & metadata */}
           <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-6 shadow-sm">
             <div className="flex items-center gap-8 border-b border-slate-100 dark:border-slate-800 pb-6 uppercase tracking-widest font-black text-[10px] text-slate-400">
                <span className="text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 pb-6">About Course</span>
                <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">Resources</span>
                <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">Discussion</span>
                <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">Instructors</span>
             </div>
             <div className="space-y-4">
                <h3 className="text-xl font-bold dark:text-white uppercase tracking-tight">Overview</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                  {course.description} This course covers foundational security logic used in SOC2 type 2 organizations. 
                  You will learn how to identify phishing attempts, secure your workspace, and understand the core data 
                  privacy rules that protect both the company and our users.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Skill Level</p>
                      <p className="text-xs font-bold dark:text-white">Intermediate</p>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Language</p>
                      <p className="text-xs font-bold dark:text-white">English (EN)</p>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Certificate</p>
                      <p className="text-xs font-bold dark:text-white">Yes, Verified</p>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Lectures</p>
                      <p className="text-xs font-bold dark:text-white">{course.modules.length} Lessons</p>
                   </div>
                </div>
             </div>
           </div>
        </div>

        {/* Right Column: Module Sidebar */}
        <div className="space-y-6">
           {/* Progress Tracker Widget */}
           <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm border-l-4 border-l-blue-600">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="font-bold text-sm uppercase tracking-tight dark:text-white">Course Progress</h4>
                 <span className="text-xs font-black text-blue-600">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                 <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 font-medium italic mb-4">
                 {completedCount} of {course.modules.length} lessons completed
              </p>
              {progressPercent === 100 && (
                <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                   <Download size={14} />
                   Collect Certificate
                </button>
              )}
           </div>

           {/* Module List */}
           <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                 <h4 className="font-bold text-sm uppercase tracking-tight dark:text-white">Curriculum</h4>
                 <span className="text-[10px] font-bold text-slate-400">{course.modules.length} Modules</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                 {course.modules.map((module, idx) => (
                   <div 
                    key={module.id} 
                    className={`p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${module.completed ? 'opacity-100' : ''}`}
                    onClick={() => setActiveModuleId(module.id)}
                   >
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                         {module.completed ? (
                           <CheckCircle2 size={20} className="text-emerald-500" />
                         ) : (
                           <span className="text-xs font-bold text-slate-400 group-hover:hidden">{idx + 1}</span>
                         )}
                         {!module.completed && <Play size={12} className="hidden group-hover:block text-blue-600 fill-current" />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className={`text-xs font-bold truncate transition-colors ${activeModuleId === module.id ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-600'}`}>
                           {module.title}
                         </p>
                         <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 uppercase">
                               {module.type === 'Video' ? <Play size={10} /> : <FileText size={10} />}
                               {module.type}
                            </span>
                            <span className="text-[10px] font-medium text-slate-300">•</span>
                            <span className="text-[10px] font-medium text-slate-400 uppercase">{module.duration}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
