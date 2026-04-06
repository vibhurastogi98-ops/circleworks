"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, MessageSquare, Plus, X, ChevronDown, Send } from "lucide-react";
import { mockGoals, type Goal } from "@/data/mockEmployeePortal";
import { toast } from "sonner";

const statusStyles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  "On Track": { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
  "At Risk": { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", icon: AlertTriangle },
  Behind: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", icon: AlertTriangle },
  Completed: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", icon: CheckCircle2 },
};

export default function GoalsPage() {
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [showCheckin, setShowCheckin] = useState<string | null>(null);
  const [checkinNote, setCheckinNote] = useState("");
  const [checkinProgress, setCheckinProgress] = useState(0);

  const individualGoals = mockGoals.filter(g => g.type === "Individual");
  const teamGoals = mockGoals.filter(g => g.type === "Team");

  const handleCheckin = (goalId: string) => {
    if (!checkinNote) { toast.error("Please add a check-in note"); return; }
    toast.success("Check-in submitted!");
    setShowCheckin(null);
    setCheckinNote("");
    setCheckinProgress(0);
  };

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const status = statusStyles[goal.status];
    const StatusIcon = status.icon;
    const isExpanded = expandedGoal === goal.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 overflow-hidden"
      >
        <div className="p-5 cursor-pointer" onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}>
          <div className="flex items-start justify-between mb-3">
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${status.bg} ${status.text}`}>
              <StatusIcon size={10} /> {goal.status}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Due {new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </div>
          </div>
          <h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">{goal.title}</h3>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{goal.description}</p>
          {goal.parentGoal && (
            <p className="text-[11px] text-violet-600 dark:text-violet-400 mb-3">Aligned to: {goal.parentGoal}</p>
          )}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${goal.status === "At Risk" ? "bg-gradient-to-r from-amber-400 to-orange-500" : goal.status === "Behind" ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-violet-500 to-fuchsia-500"}`} style={{ width: `${goal.progress}%` }} />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{goal.progress}% complete</p>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-700/40 pt-4">
                {/* Manager Feedback */}
                {goal.managerFeedback && (
                  <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800/30">
                    <p className="text-[11px] font-bold text-violet-700 dark:text-violet-300 mb-1 flex items-center gap-1">
                      <MessageSquare size={12} /> Manager Feedback
                    </p>
                    <p className="text-[13px] text-violet-800 dark:text-violet-200">{goal.managerFeedback}</p>
                  </div>
                )}

                {/* Check-in History */}
                {goal.checkIns.length > 0 && (
                  <div>
                    <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">Check-in History</p>
                    <div className="space-y-2">
                      {goal.checkIns.map((ci, i) => (
                        <div key={i} className="flex gap-3 text-[12px]">
                          <span className="text-slate-400 flex-shrink-0 w-16">{new Date(ci.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <div className="flex-1">
                            <p className="text-slate-700 dark:text-slate-300">{ci.note}</p>
                            <span className="text-[11px] text-slate-500">{ci.progress}% progress</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Update */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowCheckin(goal.id); setCheckinProgress(goal.progress); }}
                  className="w-full h-9 rounded-lg border border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 text-[13px] font-bold hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Add Check-in
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Goals</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track individual and team goals, add check-ins and see progress</p>
      </div>

      {/* Individual Goals */}
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Target size={16} className="text-violet-500" /> Individual Goals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {individualGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
        </div>
      </div>

      {/* Team Goals */}
      {teamGoals.length > 0 && (
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" /> Team Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        </div>
      )}

      {/* Check-in Modal */}
      <AnimatePresence>
        {showCheckin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCheckin(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Check-in</h2>
                <button onClick={() => setShowCheckin(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Progress ({checkinProgress}%)</label>
                  <input type="range" min={0} max={100} value={checkinProgress} onChange={e => setCheckinProgress(Number(e.target.value))} className="w-full accent-violet-600" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Update Note</label>
                  <textarea value={checkinNote} onChange={e => setCheckinNote(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white resize-none" placeholder="What progress did you make?" />
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => handleCheckin(showCheckin)} className="w-full h-10 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
                  <Send size={16} /> Submit Check-in
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
