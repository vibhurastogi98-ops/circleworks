"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Users, 
  Calendar, 
  Send, 
  Mail, 
  MailWarning, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  Award,
  BookOpen,
  LayoutGrid,
  List,
  UserPlus
} from "lucide-react";
import { mockAssignments } from "@/data/mockLearning";

export default function LearningAssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<'table' | 'grid'>('table');

  const filteredAssignments = mockAssignments.filter(a => 
    a.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin: Learning Assignments</h1>
          <p className="text-slate-500 dark:text-slate-400">Assign mandatory training and track company-wide course completion.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
             Bulk Assign Options
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 group">
             <UserPlus size={20} className="" />
             Assign New Course
          </button>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Assigned</p>
          <p className="text-2xl font-bold dark:text-white">1,240</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
             <TrendingUp size={12} /> +12% this month
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Avg. Completion</p>
          <p className="text-2xl font-bold dark:text-white">82%</p>
          <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold">
             <CheckCircle2 size={12} /> Exceeding Target
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Overdue Tasks</p>
          <p className="text-2xl font-bold text-red-500">14</p>
          <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold">
             <MailWarning size={12} /> Action Required
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Certificates</p>
          <p className="text-2xl font-bold dark:text-white">845</p>
          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
             <Award size={12} /> High Performance
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by employee or course..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide w-full md:w-auto">
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
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
             <Filter size={14} /> Filter Overdue
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
           <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 <th className="px-6 py-4">Employee</th>
                 <th className="px-6 py-4">Assigned Course</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4">Completion Progress</th>
                 <th className="px-6 py-4">Due Date</th>
                 <th className="px-6 py-4 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAssignments.map(assignment => (
                <tr key={assignment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                   <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <img src={assignment.employeeAvatar} alt={assignment.employeeName} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 p-0.5" />
                         <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{assignment.employeeName}</span>
                      </div>
                   </td>
                   <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <BookOpen size={14} className="text-blue-500" />
                         <span className="text-xs font-bold dark:text-slate-200 underline decoration-transparent group-hover:decoration-blue-500 transition-colors underline-offset-4 cursor-pointer">{assignment.courseTitle}</span>
                      </div>
                   </td>
                   <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 text-xs font-bold tracking-tight ${
                        assignment.status === 'Completed' ? 'text-emerald-600' : 
                        assignment.status === 'In Progress' ? 'text-blue-600' : 
                        'text-slate-400'
                      }`}>
                         {assignment.status === 'Completed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                         {assignment.status}
                      </div>
                   </td>
                   <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-[120px]">
                         <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={`h-full transition-all duration-700 ${assignment.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                              style={{ width: `${assignment.progress}%` }}
                            />
                         </div>
                         <span className="text-[10px] font-bold dark:text-white">{assignment.progress}%</span>
                      </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                         <Calendar size={14} className={new Date(assignment.dueDate) < new Date() ? 'text-red-500' : 'text-slate-400'} />
                         {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                   </td>
                   <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-blue-600 font-bold text-xs flex items-center gap-1" title="Send Reminder">
                            <Mail size={16} />
                            Notify
                         </button>
                         <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400">
                            <MoreHorizontal size={18} />
                         </button>
                      </div>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
      </div>

      {/* Bottom Action: Automatic Reminders */}
      <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl group cursor-pointer hover:border-blue-500/20 transition-all">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
               <MailWarning size={24} />
            </div>
            <div>
               <p className="text-sm font-bold dark:text-white uppercase tracking-tight">Active Auto-Reminders</p>
               <p className="text-xs text-slate-500 italic">System sends alerts 3 days before, 1 day before, and on the due date.</p>
            </div>
         </div>
         <button className="px-6 py-2 border-2 border-blue-600/50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
            Manage Automation
         </button>
      </div>
    </div>
  );
}
