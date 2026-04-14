"use client";

import React, { useState } from "react";
import { GripVertical, Plus, Trash2, Save, Key, Mail, CheckCircle2, ShieldAlert } from "lucide-react";
import { STAGES } from "@/data/mockAts";

export default function AtsSettings() {
  const [stages, setStages] = useState(STAGES);
  const [activeTab, setActiveTab] = useState<'Pipeline'|'Emails'|'Scorecard'|'Integrations'|'Compliance'>('Pipeline');

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ATS Configuration</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your recruitment pipelines, templates, and API accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 rounded-lg text-sm font-bold transition-colors shadow-sm">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         
         {/* Settings Nav */}
         <div className="md:col-span-1 flex flex-col gap-2">
            {[
               { id: 'Pipeline', label: 'Pipeline Stages', icon: GripVertical },
               { id: 'Emails', label: 'Email Templates', icon: Mail },
               { id: 'Scorecard', label: 'Global Scorecards', icon: CheckCircle2 },
               { id: 'Integrations', label: 'Job Boards API', icon: Key },
               { id: 'Compliance', label: 'Compliance Features', icon: ShieldAlert },
            ].map(tab => (
               <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 p-3 rounded-lg text-left text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}`}
               >
                  <tab.icon size={16} className={activeTab === tab.id ? 'opacity-100' : 'opacity-50'} />
                  {tab.label}
               </button>
            ))}
         </div>

         {/* Settings Content */}
         <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 sm:p-8 min-h-[500px]">
            
            {activeTab === 'Pipeline' && (
               <div className="flex flex-col gap-6 animate-in slide-in-from-right-2">
                  <div>
                     <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Global Pipeline Stages</h2>
                     <p className="text-sm text-slate-500">Define the default columns that appear in your Kanban board. Drag to reorder.</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                     {stages.map((stage, i) => (
                        <div key={stage.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl group cursor-move hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                           <GripVertical size={18} className="text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                           <div className={`w-3 h-3 rounded-full shrink-0 ${stage.color}`} />
                           <input type="text" value={stage.title} onChange={(e) => {
                              const next = [...stages]; next[i].title = e.target.value; setStages(next);
                           }} className="flex-1 bg-transparent border-none outline-none font-medium text-slate-900 dark:text-white" />
                           <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Delete Stage">
                              <Trash2 size={16} />
                           </button>
                        </div>
                     ))}
                     
                     <button className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900">
                        <Plus size={18} /> Add New Stage
                     </button>
                  </div>
               </div>
            )}

            {activeTab === 'Integrations' && (
               <div className="flex flex-col gap-6 animate-in slide-in-from-right-2">
                  <div>
                     <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Job Board API Configurations</h2>
                     <p className="text-sm text-slate-500">Provide Keys to enable automatic 1-click publishing during job creation.</p>
                  </div>

                  <div className="flex flex-col gap-6">
                     <div className="space-y-3 p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-8 h-8 rounded bg-[#0A66C2] text-white flex items-center justify-center font-bold text-lg">in</div>
                           <h3 className="font-bold text-slate-900 dark:text-white">LinkedIn Recruiter Integration</h3>
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-slate-500 mb-1">API Key</label>
                           <input type="password" value="************************" className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" readOnly />
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-slate-500 mb-1">Company ID</label>
                           <input type="text" value="circleworks-inc" className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" readOnly />
                        </div>
                     </div>

                     <div className="space-y-3 p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center font-bold italic text-lg">I</div>
                           <h3 className="font-bold text-slate-900 dark:text-white">Indeed Direct Application Hook</h3>
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-slate-500 mb-1">Syndication Token</label>
                           <input type="text" placeholder="Paste Indeed token here..." className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'Compliance' && (
               <div className="flex flex-col gap-6 animate-in slide-in-from-right-2">
                  <div>
                     <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Hiring Compliance Guardrails</h2>
                     <p className="text-sm text-slate-500">Review enabled compliance rules, fair-chance settings, and regional restrictions.</p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                     <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                           <ShieldAlert className="text-blue-600" size={20} />
                           <h3 className="font-bold text-slate-900 dark:text-white">Ban-the-Box Jurisdictions</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                           Background checks are delayed until after conditional offers in these locations. Criminal history questions are also blocked from application forms. The list is automatically updated annually.
                        </p>
                        <div className="flex flex-wrap gap-2">
                           {['California (LA, SF)', 'New York (NYC)', 'Massachusetts', 'Illinois (Chicago)', 'New Jersey', 'Washington (Seattle)', 'Colorado (Denver)'].map(j => (
                              <span key={j} className="px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wide">
                                 {j}
                              </span>
                           ))}
                           <span className="px-3 py-1.5 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 border-dashed rounded-lg text-xs font-bold uppercase tracking-wide cursor-help" title="Active background check compliance rules update annually">
                              + 14 More
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            )}


            {(activeTab === 'Emails' || activeTab === 'Scorecard') && (
               <div className="flex flex-col items-center justify-center h-[400px] text-slate-500 animate-in slide-in-from-right-2 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                     {activeTab === 'Emails' ? <Mail size={24}/> : <CheckCircle2 size={24}/>}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Configuration Available Soon</h3>
                  <p className="max-w-xs text-sm">We are actively building the global template editor for {activeTab.toLowerCase()}. Check back in an upcoming release.</p>
               </div>
            )}

         </div>
      </div>
    </div>
  );
}
