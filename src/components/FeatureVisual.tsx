"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, Clock, ShieldCheck, 
  ArrowUpRight, FileText, Globe, 
  CreditCard, PieChart, Landmark, Rocket
} from "lucide-react";

interface FeatureVisualProps {
  headline: string;
  accent: string;
  accentBg: string;
}

export default function FeatureVisual({ headline, accent, accentBg }: FeatureVisualProps) {
  const isTax = headline.toLowerCase().includes("tax") || headline.toLowerCase().includes("compliance");
  const isPayment = headline.toLowerCase().includes("payment") || headline.toLowerCase().includes("deduction");
  const isHiring = headline.toLowerCase().includes("hiring") || headline.toLowerCase().includes("career");
  const isOnboarding = headline.toLowerCase().includes("onboarding") || headline.toLowerCase().includes("checklist");
  const isSync = headline.toLowerCase().includes("connect") || headline.toLowerCase().includes("sync") || headline.toLowerCase().includes("integration");
  const isEquity = headline.toLowerCase().includes("equity") || headline.toLowerCase().includes("carta");
  const isHealthcare = headline.toLowerCase().includes("credential") || headline.toLowerCase().includes("license") || headline.toLowerCase().includes("health");
  const isPortal = headline.toLowerCase().includes("portal") || headline.toLowerCase().includes("multi-tenancy");
  const isAnalytics = headline.toLowerCase().includes("analytic") || headline.toLowerCase().includes("reporting") || headline.toLowerCase().includes("headcount");
  const isScaling = headline.toLowerCase().includes("scaling") || headline.toLowerCase().includes("growth") || headline.toLowerCase().includes("cohort");
  const isCompliance = headline.toLowerCase().includes("compliance") || headline.toLowerCase().includes("audit") || headline.toLowerCase().includes("risk");
  const isOptimization = headline.toLowerCase().includes("optimiz") || headline.toLowerCase().includes("savings") || headline.toLowerCase().includes("cost");
  const isRemote = headline.toLowerCase().includes("remote") || headline.toLowerCase().includes("global") || headline.toLowerCase().includes("provisioning");

  return (
    <div className={`w-full aspect-[4/3] rounded-3xl bg-slate-50 border border-slate-200 shadow-xl overflow-hidden relative group p-6`}>
      {/* Abstract Background Elements */}
      <div className={`absolute -top-20 -right-20 w-64 h-64 ${accentBg} opacity-20 blur-[80px] rounded-full`} />
      <div className={`absolute -bottom-20 -left-20 w-64 h-64 ${accentBg} opacity-10 blur-[80px] rounded-full`} />

      <div className="relative h-full flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Mock Terminal/Header */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
           <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-200" />
              <div className="w-2 h-2 rounded-full bg-slate-200" />
              <div className="w-2 h-2 rounded-full bg-slate-200" />
           </div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{headline} Snapshot</span>
        </div>

        <div className="flex-1 p-5 overflow-hidden">
          {isTax || isCompliance ? (
            <div className="space-y-4">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                     <Globe size={18} className="text-blue-500" />
                     <span className="text-sm font-bold text-slate-900">Multi-State Tax Filings</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">100% Compliant</span>
               </div>
               {[
                 { state: "California EDD", type: "Quarterly UI", status: "Filed", date: "Jun 12" },
                 { state: "New York Dept of Labor", type: "Monthly Withholding", status: "Processing", date: "Jun 15" },
                 { state: "Texas Workforce Comm", type: "SUTA Filing", status: "Filed", date: "Jun 10" },
                 { state: "IRS Form 941", type: "Employer Quarterly", status: "Filed", date: "Jun 01" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm">
                          <FileText size={14} />
                       </div>
                       <div>
                          <div className="text-[12px] font-bold text-slate-900">{item.state}</div>
                          <div className="text-[10px] text-slate-500">{item.type}</div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className={`text-[10px] font-bold ${item.status === 'Filed' ? 'text-emerald-500' : 'text-amber-500'}`}>{item.status}</div>
                       <div className="text-[9px] text-slate-400">{item.date}</div>
                    </div>
                 </div>
               ))}
            </div>
          ) : isEquity ? (
            <div className="space-y-4 h-full flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="text-xs font-black uppercase text-slate-400 mb-2">Automated Exercise Calculation</div>
                <div className="text-4xl font-black text-slate-900">$240,500.00</div>
                <div className="text-xs font-bold text-blue-500">Withholding Calculated via Carta API</div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Option Grant #124", val: "Exercise Pending" },
                  { label: "Tax Liability (Fed)", val: "$54,200.00" },
                  { label: "Tax Liability (CA)", val: "$22,000.00" }
                ].map((row, i) => (
                  <div key={i} className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600">{row.label}</span>
                    <span className="text-[11px] font-black text-slate-900">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : isScaling ? (
            <div className="h-full flex flex-col gap-6">
               <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-[14px] font-black text-slate-900">Scaling Benchmarks</h5>
                    <p className="text-[10px] text-slate-500">Growth trajectory vs sector avg.</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                     <Rocket size={20} />
                  </div>
               </div>
               <div className="flex-1 flex items-end gap-3 px-4">
                  {[30, 50, 40, 70, 95, 85, 100].map((h, i) => (
                    <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`flex-1 bg-indigo-500 rounded-t-lg opacity-80`}
                    />
                  ))}
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="text-[9px] font-black text-slate-400 uppercase">Automated Onboarding</div>
                     <div className="text-lg font-black text-emerald-500">Active</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="text-[9px] font-black text-slate-400 uppercase">State Nexus</div>
                     <div className="text-lg font-black text-indigo-500">All 50</div>
                  </div>
               </div>
            </div>
          ) : isAnalytics ? (
            <div className="h-full flex flex-col gap-6">
               <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-[14px] font-black text-slate-900">Attrition Prediction</h5>
                    <p className="text-[10px] text-slate-500">ML-driven retention risk modeling.</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                     <PieChart size={20} />
                  </div>
               </div>
               <div className="flex-1 flex items-end gap-3 px-4">
                  {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                    <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`flex-1 ${accent} rounded-t-lg opacity-80`}
                    />
                  ))}
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="text-[9px] font-black text-slate-400 uppercase">Retention Score</div>
                     <div className="text-lg font-black text-emerald-500">92%</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="text-[9px] font-black text-slate-400 uppercase">Growth Index</div>
                     <div className="text-lg font-black text-blue-500">+14%</div>
                  </div>
               </div>
            </div>
          ) : isHealthcare ? (
            <div className="space-y-4">
               <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <ShieldCheck className="text-emerald-600" />
                  <div>
                    <div className="text-xs font-black text-emerald-900 leading-tight">Credentialing Audit</div>
                    <div className="text-[10px] text-emerald-600">124 Certifications Verified Today</div>
                  </div>
               </div>
               {[
                 { name: "Dr. Elena Rossi", doc: "Medical License", exp: "Expired in 14d", risk: "high" },
                 { name: "Nurse James L.", doc: "BLS Certification", exp: "Active", risk: "low" },
                 { name: "Mark V. (Tech)", doc: "HIPAA Training", exp: "Renewed", risk: "low" }
               ].map((c, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{c.name[0]}</div>
                       <div>
                          <div className="text-[11px] font-bold text-slate-900">{c.name}</div>
                          <div className="text-[9px] text-slate-500">{c.doc}</div>
                       </div>
                    </div>
                    <div className={`text-[9px] font-black px-2 py-0.5 rounded-full ${c.risk === 'high' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'}`}>
                      {c.exp}
                    </div>
                 </div>
               ))}
            </div>
          ) : isPortal ? (
            <div className="h-full flex flex-col gap-4">
               <div className="flex items-center gap-2 mb-2">
                 <div className="p-2 bg-blue-600 rounded-lg text-white"><Globe size={14} /></div>
                 <span className="text-xs font-black text-slate-900 uppercase">Global Managed Accounts</span>
               </div>
               <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { name: "Acme Corp", loc: "NY, US", status: "Active" },
                    { name: "Flux AI", loc: "SF, US", status: "Active" },
                    { name: "Zenith Hub", loc: "London, UK", status: "Active" },
                    { name: "Peak Agency", loc: "Berlin, DE", status: "Active" }
                  ].map((acc, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors cursor-pointer">
                       <div className="text-[11px] font-black text-slate-900">{acc.name}</div>
                       <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] text-slate-400">{acc.loc}</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                       </div>
                    </div>
                  ))}
               </div>
               <div className="mt-auto p-4 bg-slate-900 rounded-2xl flex items-center justify-between text-white">
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Total Billable Labor</div>
                    <div className="text-xl font-black">$2,410,224.50</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                     <ArrowUpRight size={14} />
                  </div>
               </div>
            </div>
          ) : isPayment ? (
            <div className="space-y-5">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 rounded-2xl text-white">
                     <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Payout</div>
                     <div className="text-xl font-black">$142,890.12</div>
                     <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-2 font-bold">
                        <ArrowUpRight size={12} /> +12% vs last
                     </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                     <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">Fee Savings</div>
                     <div className="text-xl font-black text-blue-600">$1,240.00</div>
                     <div className="text-[10px] text-blue-400 mt-2 font-bold">Native Rails</div>
                  </div>
               </div>
               <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-3">Recent Transactions</div>
                  {[
                    { name: "Direct Deposit (84 ppl)", amount: "$124,000", icon: Landmark },
                    { name: "Contractor Payout (12 ppl)", amount: "$18,890", icon: CreditCard }
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-200/50 last:border-0">
                       <div className="flex items-center gap-2">
                          <t.icon size={14} className="text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-700">{t.name}</span>
                       </div>
                       <span className="text-[11px] font-black text-slate-900">{t.amount}</span>
                    </div>
                  ))}
               </div>
            </div>
          ) : isSync ? (
            <div className="h-full flex flex-col items-center justify-center p-4">
               <div className="flex items-center gap-10 mb-10 w-full justify-around">
                  <div className="flex flex-col items-center gap-3">
                     <div className="w-16 h-16 rounded-2xl bg-[#0A1628] flex items-center justify-center shadow-xl border border-white/10 ring-4 ring-blue-500/5">
                        <Rocket size={32} className="text-white" />
                     </div>
                     <span className="text-[10px] font-black uppercase text-slate-400">CircleWorks</span>
                  </div>

                  <div className="relative flex-1 flex items-center justify-center h-2">
                     <div className="absolute inset-0 bg-slate-100 rounded-full" />
                     <motion.div 
                        initial={{ left: -20 }}
                        animate={{ left: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute w-12 h-0.5 bg-blue-500 shadow-[0_0_10px_#2563eb]" 
                     />
                     <div className="absolute -top-6 bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1 animate-pulse">
                        <CheckCircle2 size={10} /> Live API
                     </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                     <div className={`w-16 h-16 rounded-2xl ${accentBg} flex items-center justify-center shadow-xl border border-white/5 ring-4 ring-slate-100`}>
                        <Globe size={32} className="text-white" />
                     </div>
                     <span className="text-[10px] font-black uppercase text-slate-400">Partner App</span>
                  </div>
               </div>

               <div className="w-full space-y-3">
                  {[
                    { label: "Journal Entry Sync", val: "Success", time: "2 min ago" },
                    { label: "Employee Mapping", val: "124 Mapped", time: "Active" }
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                       <div className="flex items-center gap-3">
                          <Clock size={14} className="text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-700">{row.label}</span>
                       </div>
                       <div className="text-right">
                          <div className="text-[10px] font-black text-slate-900">{row.val}</div>
                          <div className="text-[8px] text-slate-400 uppercase tracking-widest">{row.time}</div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
               <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${accent} bg-opacity-20 flex items-center justify-center`}>
                     <ShieldCheck className={accent.replace('bg-', 'text-')} />
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-slate-900">CircleWorks {headline}</h4>
                     <p className="text-[11px] text-slate-500">Intelligent automation for modern HR.</p>
                  </div>
               </div>
               <div className="flex-1 grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-2">
                       <div className="w-6 h-1 bg-slate-200 rounded-full" />
                       <div className="w-12 h-1 bg-slate-100 rounded-full" />
                       <div className="mt-auto flex justify-between items-center">
                          <div className="w-4 h-4 rounded-full bg-white border border-slate-200" />
                          <div className="w-8 h-3 rounded-full bg-emerald-100" />
                       </div>
                    </div>
                  ))}
               </div>
               <div className="mt-6 p-3 bg-blue-600 rounded-xl flex items-center justify-between text-white shadow-lg shadow-blue-200">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Run Process</span>
                  <ArrowUpRight size={16} />
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
