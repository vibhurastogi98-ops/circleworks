"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  FileDown, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Lock,
  Eye,
  Settings
} from "lucide-react";
import Link from "next/link";
import { mockReviewCycles } from "@/data/mockPerformance";

// Internal types for the detail view
interface Participant {
  id: string;
  name: string;
  avatar: string;
  title: string;
  department: string;
  manager: string;
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Complete';
  rating?: number;
  lastUpdated: string;
}

const mockParticipants: Participant[] = [
  { id: "p1", name: "Alex Rivera", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", title: "Senior Software Engineer", department: "Engineering", manager: "Marcus Thorne", status: "Complete", rating: 4.5, lastUpdated: "2 days ago" },
  { id: "p2", name: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", title: "Product Designer", department: "Design", manager: "Vibhu Rastogi", status: "Submitted", rating: 4.0, lastUpdated: "Today" },
  { id: "p3", name: "John Doe", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", title: "QA Engineer", department: "Engineering", manager: "Marcus Thorne", status: "In Progress", lastUpdated: "1 day ago" },
  { id: "p4", name: "Emma Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", title: "Product Manager", department: "Product", manager: "Vibhu Rastogi", status: "Not Started", lastUpdated: "N/A" },
];

export default function ReviewCycleDetailPage({ params }: { params: { cycleId: string } }) {
  const [activeTab, setActiveTab] = useState<'participants' | 'calibration' | 'analytics'>('participants');
  const [searchQuery, setSearchQuery] = useState("");
  
  const cycle = mockReviewCycles.find(c => c.id === params.cycleId) || mockReviewCycles[0];

  const filteredParticipants = mockParticipants.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/performance/reviews" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-500" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{cycle.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                cycle.status === 'Active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-700'
              }`}>
                {cycle.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1"><Calendar size={14} /> {cycle.period}</span>
              <span className="flex items-center gap-1 font-bold text-red-500"><Clock size={14} /> Due {new Date(cycle.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <Settings size={18} />
            Configure
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95">
            <FileDown size={18} />
            Export Results
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Participants</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold dark:text-white">{cycle.participants}</p>
            <Users className="text-slate-300" size={24} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Overall Completion</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-blue-600">{cycle.completion}%</p>
            <CheckCircle2 className="text-blue-200" size={24} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Avg. Rating</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-emerald-600">4.12</p>
            <TrendingUp className="text-emerald-200" size={24} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Pending Actions</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-amber-500">12</p>
            <AlertCircle className="text-amber-200" size={24} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('participants')}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'participants' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Participants
          {activeTab === 'participants' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('calibration')}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'calibration' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Calibration View
          {activeTab === 'calibration' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'analytics' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Analytics
          {activeTab === 'analytics' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
        </button>
      </div>

      {/* Conditional Content */}
      {activeTab === 'participants' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Find participant..." 
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400">
                <Filter size={14} />
                Department
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400">
                <Filter size={14} />
                Status
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4">Review Status</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredParticipants.map(participant => (
                  <tr key={participant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={participant.avatar} alt={participant.name} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 p-0.5" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{participant.name}</p>
                          <p className="text-xs text-slate-500">{participant.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium dark:text-slate-400">{participant.department}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium dark:text-white">{participant.manager}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${
                        participant.status === 'Complete' ? 'text-emerald-600 dark:text-emerald-400' :
                        participant.status === 'Submitted' ? 'text-blue-600 dark:text-blue-400' :
                        participant.status === 'In Progress' ? 'text-amber-500' :
                        'text-slate-400'
                      }`}>
                        {participant.status === 'Complete' ? <CheckCircle2 size={14} /> : 
                         participant.status === 'Submitted' ? <Clock size={14} /> : null}
                        {participant.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {participant.rating ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold dark:text-white">{participant.rating}</span>
                          <div className="flex gap-0.5 text-amber-400">
                            {[1,2,3,4,5].map(s => (
                              <div key={s} className={`w-1.5 h-3 rounded-full ${s <= Math.floor(participant.rating || 0) ? 'bg-amber-400' : 'bg-slate-100 dark:bg-slate-800'}`} />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 font-mono italic">pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400" title="View Details">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'calibration' && (
        <div className="p-12 text-center bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto text-blue-600">
            <Lock size={40} />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold dark:text-white">Calibration View Locked</h3>
            <p className="text-sm text-slate-500">Calibration view will open once 75% of reviews have been submitted. Current progress: 65%.</p>
          </div>
          <div className="pt-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 text-sm">
              Request Mandatory Submissions
            </button>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <h4 className="font-bold mb-6 flex items-center gap-2 dark:text-white">
              <BarChart3 size={18} className="text-blue-600" />
              Rating Distribution
            </h4>
            <div className="flex items-end justify-between h-40 gap-4">
              {[15, 30, 45, 12, 5].map((h, i) => (
                <div key={i} className="flex-1 group flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative flex items-end overflow-hidden" style={{ height: '100%' }}>
                    <div className="w-full bg-blue-600/80 group-hover:bg-blue-500 transition-all rounded-t-lg" style={{ height: `${h}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{i + 1} ⭐</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2 dark:text-white">
              <Users size={18} className="text-purple-600" />
              Progress by Department
            </h4>
            <div className="space-y-4">
              {['Engineering', 'Product', 'Design', 'Sales'].map(dept => (
                <div key={dept} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
                    <span>{dept}</span>
                    <span>{dept === 'Engineering' ? '85%' : dept === 'Product' ? '60%' : '20%'}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: dept === 'Engineering' ? '85%' : dept === 'Product' ? '60%' : '20%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
