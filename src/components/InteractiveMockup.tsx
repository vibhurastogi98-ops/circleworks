"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, BarChart3, Clock, Heart, ShieldCheck, 
  ChevronRight, Search, Bell, Settings, Plus,
  CreditCard, Briefcase, Target, Rocket
} from "lucide-react";

type MockTab = "dashboard" | "employees" | "payroll" | "benefits" | "compliance" | "hiring";

interface InteractiveMockupProps {
  accentColor?: string;
  moduleName?: string;
  initialTab?: MockTab;
}

export default function InteractiveMockup({ 
  accentColor = "#3B82F6", 
  moduleName = "Payroll",
  initialTab = "dashboard"
}: InteractiveMockupProps) {
  const [activeTab, setActiveTab] = useState<MockTab>(initialTab);

  const tabs: { id: MockTab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "employees", label: "Employees", icon: Users },
    { id: "payroll", label: "Payroll", icon: CreditCard },
    { id: "hiring", label: "Hiring", icon: Target },
    { id: "benefits", label: "Benefits", icon: Heart },
    { id: "compliance", label: "Compliance", icon: ShieldCheck },
  ];

  return (
    <div className="w-full aspect-[4/3] rounded-2xl bg-[#0F1C2E] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col group/mockup">
      {/* Browser Bar */}
      <div className="bg-[#152336] px-4 py-3 flex items-center gap-2 border-b border-white/5 shrink-0">
        <div className="flex gap-1.5 mr-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
        </div>
        <div className="bg-[#0A1628] rounded-md px-3 py-1 text-[10px] text-slate-500 font-mono flex-1 max-w-[200px] border border-white/5">
          circleworks.app/admin/{moduleName.toLowerCase()}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-[#0A1628] border-r border-white/5 flex flex-col p-3 gap-1 shrink-0">
          <div className="flex items-center gap-2 px-3 py-4 mb-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
              <Rocket size={14} className="text-white" />
            </div>
            <span className="text-[12px] font-bold text-white tracking-tight">CircleWorks</span>
          </div>

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                activeTab === tab.id 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              <tab.icon size={14} className={activeTab === tab.id ? "text-blue-400" : ""} />
              <span className="text-[11px] font-bold tracking-wide uppercase">{tab.label}</span>
            </button>
          ))}

          <div className="mt-auto px-3 py-4 border-t border-white/5 flex items-center gap-3">
             <div className="w-6 h-6 rounded-full bg-slate-800" />
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-white">Alex Rivera</span>
               <span className="text-[9px] text-slate-500">Admin</span>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#0F1C2E] overflow-y-auto overflow-x-hidden p-6 custom-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
             <div>
               <h3 className="text-lg font-bold text-white capitalize">{activeTab}</h3>
               <p className="text-[12px] text-slate-500">Manage your company {activeTab} operations.</p>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                  <Search size={14} />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 relative">
                  <Bell size={14} />
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#0F1C2E]" />
                </div>
                <button 
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                >
                  <Plus size={14} /> New Entry
                </button>
             </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Active Employees", val: "124", change: "+12%" },
                    { label: "Avg. Payroll", val: "$182K", change: "+4%" },
                    { label: "Open Roles", val: "8", change: "-2" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                      <div className="text-xl font-black text-white mt-1">{stat.val}</div>
                      <div className={`text-[10px] mt-1 ${stat.change.startsWith("+") ? "text-emerald-400" : "text-amber-400"}`}>
                        {stat.change} vs last month
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                   <div className="flex items-center justify-between mb-6">
                     <span className="text-xs font-bold text-white">Expense Distribution</span>
                     <div className="flex gap-4 text-[10px] font-bold text-slate-500">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Salary</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Taxes</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-500" /> Benefits</div>
                     </div>
                   </div>
                   <div className="h-32 flex items-end gap-2 px-2">
                      {[60, 45, 80, 55, 90, 70, 85, 40, 65, 75, 50, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-white/5 rounded-t-sm group relative">
                           <div className="absolute bottom-0 left-0 right-0 bg-blue-500/40 rounded-t-sm transition-all group-hover:bg-blue-400/60" style={{ height: `${h}%` }} />
                           <div className="absolute bottom-[30%] left-0 right-0 bg-indigo-500/40 rounded-t-sm transition-all" style={{ height: `${h/2}%` }} />
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === "payroll" && (
              <motion.div
                key="payroll"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                   <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-400">Active Payroll Batches</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">2 Runs in Progress</span>
                   </div>
                   <div className="divide-y divide-white/5">
                      {[
                        { title: "Off-cycle Bonus Run", date: "June 14, 2026", status: "Review", amount: "$42,500.00" },
                        { title: "Standard Semi-Monthly", date: "June 15, 2026", status: "Draft", amount: "$182,490.12" },
                      ].map((batch, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group">
                           <div className="flex gap-4 items-center">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <CreditCard size={16} />
                              </div>
                              <div>
                                <div className="text-[13px] font-bold text-white">{batch.title}</div>
                                <div className="text-[10px] text-slate-500">Pay Date: {batch.date}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-[13px] font-black text-white">{batch.amount}</div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">{batch.status}</div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {(activeTab !== "dashboard" && activeTab !== "payroll") && (
              <motion.div
                key="other"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 mb-6">
                   {(() => {
                     const Icon = tabs.find(t => t.id === activeTab)?.icon;
                     return Icon ? <Icon size={32} /> : null;
                   })()}
                </div>
                <h4 className="text-xl font-black text-white mb-2">Detailed {activeTab} Portal</h4>
                <p className="text-slate-400 max-w-sm mb-8 text-sm">
                  Interactive administrative view for comprehensive {activeTab} management including real-time analytics and automation logic.
                </p>
                <div className="w-full max-w-md space-y-3 px-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                           <div className="h-2 w-1/3 bg-white/10 rounded-full" />
                           <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                        </div>
                     </div>
                   ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
