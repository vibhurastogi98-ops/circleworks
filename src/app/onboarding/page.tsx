"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Users, CheckCircle2, Clock, AlertTriangle, UserMinus, Search, Filter, Loader2 } from "lucide-react";
import { OnboardingPhase } from "@/data/mockOnboarding";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function OnboardingDashboard() {
  const { isNewUser } = useDashboardData();
  const { data: realCases, isLoading } = useOnboarding();
  const [phaseFilter, setPhaseFilter] = useState<OnboardingPhase | 'All'>('All');
  const [search, setSearch] = useState('');

  const cases = useMemo(() => {
    if (isNewUser || !realCases) return [];
    let filtered = realCases;
    if (phaseFilter !== 'All') filtered = filtered.filter(c => c.phase === phaseFilter);
    if (search) filtered = filtered.filter(c => c.employeeName.toLowerCase().includes(search.toLowerCase()));
    return filtered;
  }, [phaseFilter, search, isNewUser, realCases]);

  const tasksDueToday = useMemo(() => {
    if (isNewUser || !realCases) return [];
    return realCases.flatMap(c => c.tasks || []).filter(t => t.status === 'Pending');
  }, [realCases, isNewUser]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading onboarding pipeline...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Onboarding Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track new hire progress and pre-boarding tasks.</p>
        </div>
        <Link href="/onboarding/offboarding" className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shadow-sm">
          <UserMinus size={16} /> Start Offboarding
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Active Pre-Hires</h4>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{isNewUser ? 0 : cases.length}</div>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"><Users size={20}/></div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tasks Due Today</h4>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{tasksDueToday.length}</div>
          </div>
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg"><Clock size={20}/></div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Avg. Completion</h4>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{isNewUser ? "0%" : "0%"}</div>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg"><CheckCircle2 size={20}/></div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Overdue Tasks</h4>
            <div className="text-2xl font-bold text-red-600">{0}</div>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg"><AlertTriangle size={20}/></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex-wrap">
          {(['All', 'Pre-Hire', 'Week 1', 'Week 2', '30-60-90 Day'] as const).map(f => (
            <button
              key={f}
              onClick={() => setPhaseFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${phaseFilter === f ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pre-hires..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Active Pre-Hires List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cases.length > 0 ? cases.map(c => {
          const completed = (c.tasks || []).filter((t: any) => t.status === 'Complete').length;
          const total = (c.tasks || []).length || 1;
          const pct = c.onboardingPercent || Math.round((completed / total) * 100);

          return (
            <Link key={c.id} href={`/onboarding/${c.id}`} className="block group focus:outline-none">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-800 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <img src={c.avatar} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">{c.employeeName}</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>{c.department}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                      <span>Starts {new Date(c.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Phase Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${c.phase === 'Pre-Hire' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                      c.phase === 'Week 1' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                      c.phase === 'Week 2' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' :
                      'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'}`}>
                    {c.phase}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{pct}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="text-xs text-slate-500 flex justify-between">
                  <span>{completed} of {(c.tasks || []).length} tasks complete</span>
                  <span className="text-red-500 font-medium">{(c.tasks || []).filter((t: any) => t.status === 'Pending').length} pending</span>
                </div>
              </div>
            </Link>
          );
        }) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <Users size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No active pre-hires</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">Start by adding a candidate to the onboarding pipeline from the Hiring module.</p>
          </div>
        )}
      </div>
    </div>
  );
}
