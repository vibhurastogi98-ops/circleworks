"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCaseById, OnboardingTask } from "@/data/mockOnboarding";
import { ChevronLeft, CheckCircle2, Circle, SkipForward, Bell, Eye, User, Briefcase, Monitor, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";

const ROLE_ICON: Record<string, React.ElementType> = {
  HR: UserCheck,
  Manager: Briefcase,
  IT: Monitor,
  Employee: User,
};

const ROLE_COLOR: Record<string, string> = {
  HR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Manager: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  IT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Employee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function IndividualOnboarding() {
  const { employeeId } = useParams();
  const onboardingCase = useMemo(() => getCaseById(employeeId as string), [employeeId]);
  const [tasks, setTasks] = useState<OnboardingTask[]>(onboardingCase?.tasks || []);

  if (!onboardingCase) return <div className="p-12 text-center text-slate-500">Onboarding case not found.</div>;

  const completed = tasks.filter(t => t.status === 'Complete').length;
  const total = tasks.length;
  const pct = Math.round((completed / total) * 100);

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, status: t.status === 'Complete' ? 'Pending' : 'Complete' };
    }));
  };

  const skipTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Skipped' } : t));
  };

  // Group tasks by phase
  const phases = ['Pre-Hire', 'Week 1', 'Week 2', '30-60-90 Day'] as const;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <Link href="/onboarding" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-fit">
            <ChevronLeft size={16} /> Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <img src={onboardingCase.avatar} className="w-14 h-14 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover" alt="" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{onboardingCase.employeeName}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{onboardingCase.department} • Starts {formatDate(onboardingCase.startDate)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.success("Preview Portal opened in a new tab")}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors">
            <Eye size={16} /> Preview Portal
          </button>
          <button 
            onClick={() => toast.success("Reminder sent successfully to " + onboardingCase.employeeName)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Bell size={16} /> Send Reminder
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Overall Progress</h3>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{pct}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> {completed} Complete</span>
          <span className="flex items-center gap-1"><Circle size={12} className="text-slate-400" /> {tasks.filter(t=>t.status==='Pending').length} Pending</span>
          <span className="flex items-center gap-1"><SkipForward size={12} className="text-amber-500" /> {tasks.filter(t=>t.status==='Skipped').length} Skipped</span>
        </div>
      </div>

      {/* Task Stepper by Phase */}
      {phases.map(phase => {
        const phaseTasks = tasks.filter(t => t.phase === phase);
        if (phaseTasks.length === 0) return null;

        return (
          <div key={phase} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{phase}</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {phaseTasks.map(task => {
                const RoleIcon = ROLE_ICON[task.assignee] || User;
                return (
                  <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 group transition-colors">
                    {/* Toggle Button */}
                    <button onClick={() => toggleTask(task.id)} className="shrink-0 focus:outline-none">
                      {task.status === 'Complete' ? (
                        <CheckCircle2 size={22} className="text-green-500 hover:text-green-600 transition-colors" />
                      ) : task.status === 'Skipped' ? (
                        <SkipForward size={22} className="text-amber-500" />
                      ) : (
                        <Circle size={22} className="text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-colors" />
                      )}
                    </button>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium text-sm ${task.status === 'Complete' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {task.title}
                      </span>
                      <div className="text-xs text-slate-500 mt-0.5">Due: {formatDate(task.dueDate)}</div>
                    </div>

                    {/* Assignee */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${ROLE_COLOR[task.assignee]}`}>
                      <RoleIcon size={12} /> {task.assignee}
                    </span>

                    {/* Skip action */}
                    {task.status === 'Pending' && (
                      <button onClick={() => skipTask(task.id)} className="text-slate-400 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all p-1" title="Skip Task">
                        <SkipForward size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
