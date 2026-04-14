"use client";

import React from "react";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Search, 
  Filter, 
  Award, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  BarChart2,
  GraduationCap,
  PlayCircle,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { mockCourses, mockAssignments } from "@/data/mockLearning";
import { formatDate } from "@/utils/formatDate";

export default function LearningDashboard() {
  const mandatoryCourses = mockCourses.filter(c => c.isMandatory);
  const myProgress = 75; // Mock overall progress

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Learning & Development</h1>
          <p className="text-slate-500 dark:text-slate-400">Expand your skills with personalized courses and tracks.</p>
        </div>
        <Link href="/learning/courses" className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 group">
          Explore Course Catalog
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden group shadow-2xl">
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <GraduationCap size={280} />
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full w-fit text-[10px] font-bold uppercase tracking-widest border border-white/10">
                Current Achievement
              </div>
              <h2 className="text-3xl font-bold">You're making great progress! 🚀</h2>
              <p className="text-indigo-100/80 text-sm leading-relaxed">
                You’ve completed 12 modules this month. Keep it up to reach your 2024 Engineering Certification goal.
              </p>
              <div className="pt-4 flex items-center gap-4">
                <Link 
                  href="/learning/courses" 
                  className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center gap-2"
                >
                  Continue Learning
                </Link>
                <button className="flex items-center gap-2 text-sm font-bold text-white hover:underline">
                  View Achievements <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 shadow-inner">
               <div className="relative flex items-center justify-center mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle className="text-white/20" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                    <circle className="text-white transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={364} strokeDashoffset={364 - (364 * myProgress) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                  </svg>
                  <span className="absolute text-2xl font-black">{myProgress}%</span>
               </div>
               <p className="text-xs font-bold uppercase tracking-tighter opacity-80">Mandatory Compliance</p>
            </div>
          </div>
        </div>

        {/* Quick Kpis */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <BookOpen size={28} />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-white">4</p>
              <p className="text-xs text-slate-500 uppercase font-black uppercase tracking-tight">Assigned Courses</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Award size={28} />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-white">12</p>
              <p className="text-xs text-slate-500 uppercase font-black tracking-tight">Active Badges</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Zap size={28} />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-white">450</p>
              <p className="text-xs text-slate-500 uppercase font-black tracking-tight">Learning XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Assignments & Mandatory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Assignments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
              <PlayCircle className="text-blue-600" />
              Active Assignments
            </h2>
            <Link href="/learning/courses" className="text-xs font-bold text-blue-600 hover:underline">View All My Courses</Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
             {mockAssignments.map(assignment => (
               <div key={assignment.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all border-l-4 border-l-blue-600">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                        <img 
                          src={mockCourses.find(c => c.id === assignment.courseId)?.thumbnail} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover opacity-60"
                        />
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{assignment.courseTitle}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase"><Calendar size={12} /> Due {formatDate(assignment.dueDate)}</span>
                           <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                             assignment.status === 'In Progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' : 
                             assignment.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 
                             'bg-slate-100 text-slate-400 dark:bg-slate-800'
                           }`}>
                             {assignment.status}
                           </span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="flex flex-col items-end gap-1.5 w-32 shrink-0">
                        <div className="flex items-center justify-between w-full text-[10px] font-bold text-slate-500">
                           <span>Progress</span>
                           <span>{assignment.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${assignment.progress}%` }} />
                        </div>
                     </div>
                     <Link 
                      href={`/learning/courses/${assignment.courseId}`}
                      className="px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-xs font-bold transition-all active:scale-95 hover:shadow-lg"
                     >
                        {assignment.progress > 0 ? 'Resume' : 'Start'}
                     </Link>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Compliance & Trending */}
        <div className="space-y-8">
           <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                 <ShieldCheck size={24} />
                 <h4 className="font-extrabold text-sm uppercase tracking-tight">Compliance Status</h4>
              </div>
              <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 italic leading-relaxed">System-wide mandatory training ensures we stay SOC2 compliant.</p>
              <div className="space-y-4 pt-2">
                 {mandatoryCourses.map(course => (
                   <div key={course.id} className="flex items-center justify-between gap-4">
                      <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100 truncate">{course.title}</p>
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                   </div>
                 ))}
              </div>
              <button className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                 Generate Transcript
              </button>
           </div>

           <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600">
                 <TrendingUp size={24} />
                 <h4 className="font-extrabold text-sm uppercase tracking-tight">Trending Skills</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                 {['React Server Components', 'AI Prompt Engineering', 'Public Speaking', 'UI Motion', 'Next.js 16', 'System Design'].map(skill => (
                   <span key={skill} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:border-blue-500/30 transition-all cursor-pointer text-center">
                      {skill}
                   </span>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

