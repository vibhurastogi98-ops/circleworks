"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Play, FileText, CheckCircle2, Clock, Award, ChevronRight, X, Video, File, HelpCircle } from "lucide-react";
import { mockCourses, type Course } from "@/data/mockEmployeePortal";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  "Not Started": "bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300",
  "In Progress": "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  Completed: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
};

const moduleIcons: Record<string, React.ElementType> = {
  Video: Video, PDF: File, Quiz: HelpCircle, Text: FileText,
};

export default function LearningPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const mandatory = mockCourses.filter(c => c.isMandatory);
  const optional = mockCourses.filter(c => !c.isMandatory);
  const completed = mockCourses.filter(c => c.status === "Completed" && c.certificateUrl);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Learning</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Assigned courses, training progress, and certificates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Courses", value: mockCourses.length, icon: GraduationCap, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
          { label: "In Progress", value: mockCourses.filter(c => c.status === "In Progress").length, icon: Play, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Completed", value: mockCourses.filter(c => c.status === "Completed").length, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Certificates", value: completed.length, icon: Award, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Mandatory Courses */}
      {mandatory.length > 0 && (
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock size={16} className="text-red-500" /> Required Training
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mandatory.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCourse(course)}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusColors[course.status]}`}>{course.status}</span>
                  {course.dueDate && <span className="text-[11px] text-red-500 font-bold">Due {new Date(course.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                </div>
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">{course.title}</h3>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-3">{course.category} · {course.duration}</p>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all" style={{ width: `${course.progress}%` }} />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{course.progress}% complete · {course.modules.filter(m => m.completed).length}/{course.modules.length} modules</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Courses */}
      {optional.length > 0 && (
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Professional Development</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optional.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCourse(course)}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusColors[course.status]}`}>{course.status}</span>
                  {course.certificateUrl && <Award size={16} className="text-amber-500" />}
                </div>
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">{course.title}</h3>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-3">{course.category} · {course.duration}</p>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all" style={{ width: `${course.progress}%` }} />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{course.progress}% complete</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Award size={16} className="text-amber-500" /> Certificates Earned
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completed.map(course => (
              <div key={course.id} className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                  <Award size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-amber-900 dark:text-amber-200 truncate">{course.title}</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">Completed {new Date(course.completedDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <button onClick={() => toast.success("Certificate PDF downloaded")} className="text-amber-700 dark:text-amber-400 hover:text-amber-900">
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Player Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedCourse(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCourse.title}</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5">{selectedCourse.category} · {selectedCourse.duration}</p>
                </div>
                <button onClick={() => setSelectedCourse(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={18} /></button>
              </div>
              {/* Video Embed Placeholder */}
              <div className="aspect-video bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors" onClick={() => toast("Course player launching...")}>
                    <Play size={28} className="text-white ml-1" />
                  </div>
                  <p className="text-white/60 text-[13px]">Click to start course</p>
                </div>
              </div>
              {/* Modules */}
              <div className="p-5">
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-3">Course Modules</h3>
                <div className="space-y-2">
                  {selectedCourse.modules.map((mod, i) => {
                    const ModIcon = moduleIcons[mod.type] || FileText;
                    return (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${mod.completed ? "bg-emerald-50 dark:bg-emerald-900/10" : "bg-slate-50 dark:bg-slate-800/60"}`}>
                        <ModIcon size={16} className={mod.completed ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"} />
                        <span className={`text-[13px] flex-1 ${mod.completed ? "text-emerald-800 dark:text-emerald-200 font-semibold" : "text-slate-700 dark:text-slate-300"}`}>{mod.title}</span>
                        <span className="text-[11px] text-slate-500">{mod.duration}</span>
                        {mod.completed && <CheckCircle2 size={14} className="text-emerald-500" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
