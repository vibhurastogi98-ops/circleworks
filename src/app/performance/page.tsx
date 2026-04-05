"use client";

import React from "react";
import Link from "next/link";
import { 
  Trophy, 
  Target, 
  MessageSquare, 
  Clock, 
  ChevronRight, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Heart
} from "lucide-react";
import { mockReviewCycles, mockGoals, mockRecognition } from "@/data/mockPerformance";

export default function PerformanceDashboard() {
  const activeCycle = mockReviewCycles.find(c => c.status === 'Active') || mockReviewCycles[0];
  const goalStats = {
    onTrack: mockGoals.filter(g => g.status === 'On Track').length,
    atRisk: mockGoals.filter(g => g.status === 'At Risk').length,
    completed: mockGoals.filter(g => g.status === 'Completed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Track reviews, goals, and team recognition.</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Review Cycle */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={80} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider">
              <Clock size={16} />
              Active Review Cycle
            </div>
            <div>
              <h3 className="text-xl font-bold dark:text-white">{activeCycle.name}</h3>
              <p className="text-sm text-slate-500">Deadline: {new Date(activeCycle.deadline).toLocaleDateString()}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-600 dark:text-slate-400">Total Completion</span>
                <span className="text-blue-600 dark:text-blue-400">{activeCycle.completion}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-1000 ease-out" 
                  style={{ width: `${activeCycle.completion}%` }}
                />
              </div>
            </div>
            <Link 
              href={`/performance/reviews/${activeCycle.id}`}
              className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:translate-x-1 transition-transform"
            >
              View All Participants <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Goals Summary */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={80} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm uppercase tracking-wider">
              <Target size={16} />
              Goals & OKRs
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-2xl font-bold dark:text-white">{goalStats.onTrack}</p>
                <p className="text-xs text-slate-500 uppercase font-medium">On Track</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-amber-500">{goalStats.atRisk}</p>
                <p className="text-xs text-slate-500 uppercase font-medium">At Risk</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Overall Progress</span>
                <span className="font-bold text-emerald-600">45%</span>
              </div>
            </div>
            <Link 
              href="/performance/goals"
              className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:translate-x-1 transition-transform"
            >
              View Goal Tree <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* 360 Feedback */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <MessageSquare size={80} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">
              <MessageSquare size={16} />
              360 Feedback
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium dark:text-white">Feedback Requests</p>
                  <p className="text-[10px] text-slate-500">Awaiting your response</p>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </div>
            </div>
            <Link 
              href="/performance/feedback"
              className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:translate-x-1 transition-transform"
            >
              Go to Feedback Hub <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: OKR Progress & Recognition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OKR Progress Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
              <TrendingUp className="text-emerald-500" />
              Strategic OKR Progress
            </h2>
            <Link href="/performance/goals" className="text-xs font-bold text-blue-600 hover:underline px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              Manage All
            </Link>
          </div>
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800">
            {mockGoals.map(goal => (
              <div key={goal.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                        {goal.type}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{goal.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500">Owner: {goal.owner} • Due {new Date(goal.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                    goal.status === 'On Track' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                    goal.status === 'At Risk' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-900/30'
                  }`}>
                    {goal.status === 'On Track' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                    {goal.status}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        goal.status === 'On Track' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} 
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recognition Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
              <Heart className="text-red-500" />
              Latest Kudos
            </h2>
            <Link href="/performance/feedback" className="text-xs font-bold text-blue-600 hover:underline px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              Post One
            </Link>
          </div>
          <div className="space-y-3">
            {mockRecognition.map(rec => (
              <div key={rec.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 hover:shadow-lg transition-shadow border-l-4 border-l-red-500 group">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <img src={rec.fromAvatar} alt={rec.from} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" title={`From: ${rec.from}`} />
                    <img src={rec.toAvatar} alt={rec.to} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" title={`To: ${rec.to}`} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{rec.timestamp}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic group-hover:text-red-600 transition-colors leading-relaxed">"{rec.message}"</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-100 dark:border-red-900/30">
                    #{rec.category}
                  </span>
                </div>
              </div>
            ))}
            <Link 
              href="/performance/feedback"
              className="block w-full py-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              View Engagement Wall
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

