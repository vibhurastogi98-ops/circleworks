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
  accent?: string;
  moduleName?: string;
  initialTab?: MockTab | "payroll" | "dashboard";
}

export default function InteractiveMockup({ 
  accentColor = "#3B82F6", 
  accent,
  moduleName = "Payroll",
  initialTab = "dashboard"
}: InteractiveMockupProps) {
  const finalAccent = accent || accentColor;
  const [activeTab, setActiveTab] = useState<MockTab>(initialTab as MockTab);

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
            <div className="w-6 h-6 rounded-md flex items-center justify-center transition-colors" style={{ backgroundColor: finalAccent }}>
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
              <tab.icon size={14} style={{ color: activeTab === tab.id ? finalAccent : undefined }} />
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
                  className="text-white text-[11px] font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all opacity-90 hover:opacity-100 shadow-lg shadow-blue-900/20"
                  style={{ backgroundColor: finalAccent }}
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
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: finalAccent }} /> Salary</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Taxes</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-500" /> Benefits</div>
                     </div>
                   </div>
                   <div className="h-32 flex items-end gap-2 px-2">
                      {[60, 45, 80, 55, 90, 70, 85, 40, 65, 75, 50, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-white/5 rounded-t-sm group relative">
                           <div className="absolute bottom-0 left-0 right-0 rounded-t-sm transition-all group-hover:brightness-110" style={{ height: `${h}%`, backgroundColor: finalAccent + '88' }} />
                           <div className="absolute bottom-[30%] left-0 right-0 bg-white/10 rounded-t-sm transition-all" style={{ height: `${h/2}%` }} />
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
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: finalAccent + '22', color: finalAccent }}>
                                <CreditCard size={16} />
                              </div>
                              <div>
                                <div className="text-[13px] font-bold text-white">{batch.title}</div>
                                <div className="text-[10px] text-slate-500">Pay Date: {batch.date}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-[13px] font-black text-white">{batch.amount}</div>
                              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: finalAccent }}>{batch.status}</div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === "employees" && (
              <motion.div key="employees" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Sarah Jenkins", role: "Sr. Engineer", status: "Active", dept: "Engineering" },
                      { name: "Michael Chen", role: "Product Manager", status: "Onboarding", dept: "Product" },
                      { name: "Emily Roberts", role: "Account Exec", status: "Active", dept: "Sales" },
                      { name: "Alex Rivera", role: "HR Director", status: "Active", dept: "People" },
                    ].map((emp, i) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4 hover:bg-white/[0.08] transition-colors">
                         <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: finalAccent + '22', color: finalAccent }}>
                            {emp.name[0]}
                         </div>
                         <div className="flex-1">
                            <div className="text-[14px] font-bold text-white">{emp.name}</div>
                            <div className="text-[10px] text-slate-500">{emp.role} • {emp.dept}</div>
                         </div>
                         <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${emp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {emp.status}
                         </span>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === "hiring" && (
              <motion.div key="hiring" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                 <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                    {[
                      { stage: "Applied", count: 24, names: ["John D.", "Lisa K."] },
                      { stage: "Interview", count: 8, names: ["Mark S.", "Anna P."] },
                      { stage: "Offer", count: 2, names: ["Tom H."] },
                    ].map((stage, i) => (
                      <div key={i} className="w-64 shrink-0 bg-white/5 border border-white/10 rounded-xl p-4">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-black uppercase text-slate-400">{stage.stage}</span>
                            <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full">{stage.count}</span>
                         </div>
                         <div className="space-y-3">
                            {stage.names.map((name, j) => (
                              <div key={j} className="p-3 bg-white/5 border border-white/5 rounded-lg text-[12px] text-white font-medium border-l-2" style={{ borderLeftColor: finalAccent }}>
                                {name}
                              </div>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === "benefits" && (
              <motion.div key="benefits" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Enrollment Status</span>
                          <span className="text-[10px] text-emerald-400 font-black">92% Complete</span>
                       </div>
                       <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '92%' }} />
                       </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                       <span className="text-xs font-bold text-white mb-4 block">Active Plans</span>
                       <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center"><Heart size={16} /></div>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: finalAccent + '33', color: finalAccent }}><ShieldCheck size={16} /></div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "compliance" && (
              <motion.div key="compliance" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                 <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="divide-y divide-white/5">
                       {[
                         { task: "Federal 941 Quarterly", status: "Completed", icon: ShieldCheck, color: "text-emerald-400" },
                         { task: "State Unemployment Tax", status: "Review Required", icon: Bell, color: "text-amber-400" },
                         { task: "Labor Law Poster (Remote)", status: "Completed", icon: ShieldCheck, color: "text-emerald-400" },
                         { task: "EEO-1 Diversity Reporting", status: "In Progress", icon: Clock, color: "text-blue-400" },
                       ].map((item, i) => (
                         <div key={i} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <item.icon size={16} className={item.color} />
                               <span className="text-[13px] font-medium text-white">{item.task}</span>
                            </div>
                            <span className={`text-[10px] font-bold ${item.color}`}>{item.status}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
