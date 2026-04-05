"use client";

import React, { useState } from "react";
import { 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Target, 
  Users, 
  User, 
  MoreHorizontal, 
  ArrowUpRight,
  PlusCircle,
  TrendingUp,
  LayoutGrid,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  Lock,
  Globe
} from "lucide-react";
import { mockGoals, Goal } from "@/data/mockPerformance";

// Recursive Goal Node Component
const GoalNode = ({ goal, level = 0 }: { goal: Goal, level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'text-emerald-500';
      case 'At Risk': return 'text-amber-500';
      case 'Behind': return 'text-red-500';
      case 'Completed': return 'text-blue-500';
      default: return 'text-slate-400';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Company': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Team': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Individual': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-2">
      <div 
        className={`group flex items-start gap-3 p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:border-blue-300 dark:hover:border-blue-800/50 hover:shadow-lg hover:shadow-blue-500/5 ${level > 0 ? 'ml-8 relative before:absolute before:left-[-20px] before:top-[-10px] before:bottom-[50%] before:w-[20px] before:border-l-2 before:border-b-2 before:border-slate-200 dark:before:border-slate-800 before:rounded-bl-xl' : ''}`}
      >
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`mt-1 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors ${goal.children && goal.children.length > 0 ? 'opacity-100' : 'opacity-0 cursor-default'}`}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getBadgeColor(goal.type)}`}>
                  {goal.type}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{goal.title}</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium">Owner: {goal.owner} • Due {new Date(goal.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
               <div className={`flex items-center gap-1.5 p-1 px-2.5 rounded-full text-[10px] font-bold uppercase bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 ${getStatusColor(goal.status)}`}>
                <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                {goal.status}
               </div>
               <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                <MoreHorizontal size={16} />
               </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
              <span>{goal.progress}% Complete</span>
              <span>Target: 100%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${getStatusColor(goal.status).replace('text-', 'bg-')}`} 
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <button className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-md transition-colors">
              <TrendingUp size={14} />
              Quick Check-in
            </button>
            <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded-md transition-colors">
              <PlusCircle size={14} />
              Add Key Result
            </button>
          </div>
        </div>
      </div>

      {isExpanded && goal.children && goal.children.length > 0 && (
        <div className="space-y-4">
          {goal.children.map(child => (
            <GoalNode key={child.id} goal={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function PerformanceGoalsPage() {
  const [activeView, setActiveView] = useState<'tree' | 'list'>('tree');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">OKR & Goal Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Strategize with hierarchical OKR trees from Company to Individual.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
             <button 
               onClick={() => setActiveView('tree')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'tree' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
             >
               <Target size={16} /> Tree
             </button>
             <button 
               onClick={() => setActiveView('list')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
             >
               <LayoutGrid size={16} /> List
             </button>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold shadow-xl transition-all active:scale-95 group">
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            New Goal
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-900 dark:text-white border-2 border-transparent hover:border-blue-500/20 active:scale-95 transition-all">
          <Globe size={14} className="text-purple-500" /> Company Goals
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 border-2 border-transparent hover:border-blue-500/20 active:scale-95 transition-all">
          <Users size={14} className="text-blue-500" /> Team OKRs
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 border-2 border-transparent hover:border-blue-500/20 active:scale-95 transition-all">
          <User size={14} className="text-emerald-500" /> My Goals
        </button>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
        <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
          <Filter size={14} /> More Filters
        </button>
      </div>

      {/* OKR Workspace */}
      <div className="space-y-12 pb-24">
        {mockGoals.map(goal => (
          <div key={goal.id} className="space-y-6">
             <GoalNode goal={goal} />
          </div>
        ))}
      </div>

      {/* Floating Action Hint */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3 pointer-events-none sm:pointer-events-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center gap-4 transition-all hover:shadow-blue-500/10">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm font-bold dark:text-white uppercase tracking-tight">Need to Update Progress?</p>
            <p className="text-xs text-slate-500">Quick check-in on 3 pending goals.</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:shadow-blue-500/20 transition-all pointer-events-auto">
            Review Now
          </button>
        </div>
      </div>
    </div>
  );
}
