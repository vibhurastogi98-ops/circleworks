"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Send, 
  Inbox, 
  ChevronRight, 
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  PlusCircle,
  HelpCircle,
  Users
} from "lucide-react";
import { mockFeedbackRequests } from "@/data/mockPerformance";

export default function PerformanceFeedbackPage() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequests = mockFeedbackRequests.filter(r => 
    r.type === activeTab && 
    r.person.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">360 Feedback Hub</h1>
          <p className="text-slate-500 dark:text-slate-400">Request and provide anonymous or public feedback to peers across the organization.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95">
          <UserPlus size={20} />
          Request Peer Feedback
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'received' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600' : 'text-slate-500'}`}
          >
            <Inbox size={18} />
            Received ({mockFeedbackRequests.filter(r => r.type === 'received').length})
          </button>
          <button 
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'sent' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600' : 'text-slate-500'}`}
          >
            <Send size={18} />
            Sent ({mockFeedbackRequests.filter(r => r.type === 'sent').length})
          </button>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search providers..." 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 dark:text-white transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredRequests.length > 0 ? (
            <div className="space-y-3">
              {filteredRequests.map(request => (
                <div key={request.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-lg transition-all group border-l-4 border-l-purple-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img src={request.avatar} alt={request.person} className="w-12 h-12 rounded-full border border-slate-100 dark:border-slate-800" />
                      <div>
                        {activeTab === 'received' && request.isAnonymous ? (
                          <div className="flex items-center gap-2">
                             <ShieldAlert size={14} className="text-slate-400" />
                             <p className="font-bold text-slate-400 italic">Anonymous Colleague</p>
                          </div>
                        ) : (
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">{request.person}</p>
                        )}
                        <p className="text-xs text-slate-500">{request.title}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                        request.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                      }`}>
                        {request.status}
                      </span>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">{request.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                       <span className="flex items-center gap-1">
                         {request.isAnonymous ? <ShieldCheck size={14} className="text-purple-500" /> : <Users size={14} className="text-blue-500" />}
                         {request.isAnonymous ? 'Anonymous Request' : 'Standard Peer Feedback'}
                       </span>
                    </div>
                    <button className="flex items-center gap-1.5 p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold transition-all hover:bg-purple-100 active:scale-95">
                      {request.status === 'Pending' ? 'Submit Feedback' : 'View Submission'}
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <MessageSquare size={48} className="mx-auto text-slate-300" />
              <p className="text-slate-500 font-medium">No feedback requests found in this category.</p>
              <button className="text-purple-600 font-bold hover:underline">Clear Filters</button>
            </div>
          )}
        </div>

        {/* Sidebar: New Interaction / Summary */}
        <div className="space-y-6">
          {/* Quick Action */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 text-white space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Improve Your Team.</h3>
              <p className="text-xs text-purple-100 italic opacity-80">"Feedback is the breakfast of champions."</p>
            </div>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-white text-purple-600 rounded-xl font-bold text-sm shadow-xl active:scale-95 hover:bg-purple-50 transition-all">
                <Send size={18} />
                Send Kudo Instead
              </button>
              <p className="text-[10px] text-center text-purple-200">Kudos are public and boost morale!</p>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
             <div className="flex items-center gap-2 text-purple-600">
               <HelpCircle size={20} />
               <h4 className="font-bold text-sm uppercase tracking-tight">Writing Useful Feedback</h4>
             </div>
             <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Be **Specific**. Mention exact instances where a behavior was observed.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Focus on **Impact**. Explain how their actions affected the project or team.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Suggest next **Steps**. Give actionable advice for growth.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
