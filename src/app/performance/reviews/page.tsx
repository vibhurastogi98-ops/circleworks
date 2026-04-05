"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  Target as TargetIcon,
  Users,
  Eye,
  FileDown,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { mockReviewCycles } from "@/data/mockPerformance";

export default function ReviewCyclesPage() {
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCycles = mockReviewCycles.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Review Cycles</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage performance evaluation periods and participant progress.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95">
          <Plus size={20} />
          Create New Cycle
        </button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search cycles..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setView('table')}
              className={`p-1.5 rounded-md transition-all ${view === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {view === 'table' ? (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Title & Period</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Completion</th>
                <th className="px-6 py-4">Participants</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCycles.map(cycle => (
                <tr key={cycle.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <Link href={`/performance/reviews/${cycle.id}`} className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                        {cycle.name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={12} />
                        {cycle.period}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                      {cycle.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${
                      cycle.status === 'Active' ? 'text-blue-600 dark:text-blue-400' :
                      cycle.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' :
                      'text-slate-400'
                    }`}>
                      {cycle.status === 'Active' ? <Clock size={14} /> : cycle.status === 'Completed' ? <CheckCircle2 size={14} /> : null}
                      {cycle.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${cycle.completion === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                          style={{ width: `${cycle.completion}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold dark:text-white">{cycle.completion}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-medium dark:text-slate-400 font-mono">
                      <Users size={14} />
                      {cycle.participants}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/performance/reviews/${cycle.id}`} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors" title="View Results">
                        <Eye size={18} />
                      </Link>
                      <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors" title="Download Report">
                        <FileDown size={18} />
                      </button>
                      <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCycles.map(cycle => (
            <div key={cycle.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-xl ${
                  cycle.status === 'Active' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                  cycle.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                  'bg-slate-50 text-slate-400 dark:bg-slate-800'
                }`}>
                  <TargetIcon size={24} />
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  cycle.status === 'Active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                  cycle.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {cycle.status}
                </div>
              </div>
              
              <div className="mb-6">
                <Link href={`/performance/reviews/${cycle.id}`}>
                  <h3 className="font-bold text-lg dark:text-white mb-2 group-hover:text-blue-600 transition-colors underline decoration-transparent group-hover:decoration-blue-600/30 underline-offset-4 uppercase tracking-tight">
                    {cycle.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Calendar size={14} />
                  {cycle.period}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium uppercase font-mono">Current Completion</span>
                  <span className="font-bold text-blue-600">{cycle.completion}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${cycle.completion}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users size={14} />
                    {cycle.participants} Participants
                  </div>
                  <Link href={`/performance/reviews/${cycle.id}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                    <ExternalLink size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
