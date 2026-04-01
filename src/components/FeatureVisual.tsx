"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, Clock, ShieldCheck, 
  ArrowUpRight, FileText, Globe, 
  CreditCard, PieChart, Landmark, Rocket, Briefcase, Star, BarChart2, UserPlus
} from "lucide-react";

interface FeatureVisualProps {
  headline: string;
  accent: string;
  accentBg: string;
}

export default function FeatureVisual({ headline, accent, accentBg }: FeatureVisualProps) {
  const isTax = headline.toLowerCase().includes("tax") || headline.toLowerCase().includes("compliance") || headline.toLowerCase().includes("audit") || headline.toLowerCase().includes("risk") || headline.toLowerCase().includes("filing") || headline.toLowerCase().includes("legal") || headline.toLowerCase().includes("poster") || headline.toLowerCase().includes("reporting");
  const isPayment = headline.toLowerCase().includes("payment") || headline.toLowerCase().includes("deduction");
  const isHiring = headline.toLowerCase().includes("hiring") || headline.toLowerCase().includes("career") || headline.toLowerCase().includes("ats") || headline.toLowerCase().includes("job") || headline.toLowerCase().includes("candidate") || headline.toLowerCase().includes("recruiting") || headline.toLowerCase().includes("interview") || headline.toLowerCase().includes("offer") || headline.toLowerCase().includes("background check") || headline.toLowerCase().includes("scorecard");
  const isOnboarding = headline.toLowerCase().includes("onboarding") || headline.toLowerCase().includes("checklist") || headline.toLowerCase().includes("welcome") || headline.toLowerCase().includes("i-9") || headline.toLowerCase().includes("w-4") || headline.toLowerCase().includes("e-verify") || headline.toLowerCase().includes("eligibility") || headline.toLowerCase().includes("handbook") || headline.toLowerCase().includes("task");
  const isSync = headline.toLowerCase().includes("connect") || headline.toLowerCase().includes("sync") || headline.toLowerCase().includes("integration") || headline.toLowerCase().includes("api") || headline.toLowerCase().includes("mapping") || headline.toLowerCase().includes("ledger");
  const isEquity = headline.toLowerCase().includes("equity") || headline.toLowerCase().includes("stock") || headline.toLowerCase().includes("carta") || headline.toLowerCase().includes("cap table");
  const isHealthcare = headline.toLowerCase().includes("health") || headline.toLowerCase().includes("benefit") || headline.toLowerCase().includes("medical") || headline.toLowerCase().includes("dental") || headline.toLowerCase().includes("vision") || headline.toLowerCase().includes("401k") || headline.toLowerCase().includes("insurance") || headline.toLowerCase().includes("enrollment") || headline.toLowerCase().includes("broker") || headline.toLowerCase().includes("hsa") || headline.toLowerCase().includes("fsa");
  const isPortal = headline.toLowerCase().includes("portal") || headline.toLowerCase().includes("directory") || headline.toLowerCase().includes("org chart") || headline.toLowerCase().includes("multi-tenancy") || headline.toLowerCase().includes("profiles") || headline.toLowerCase().includes("self-serve");
  const isAnalytics = headline.toLowerCase().includes("analytic") || headline.toLowerCase().includes("reporting") || headline.toLowerCase().includes("headcount") || headline.toLowerCase().includes("report") || headline.toLowerCase().includes("forecasting") || headline.toLowerCase().includes("dashboard") || headline.toLowerCase().includes("burn") || headline.toLowerCase().includes("trend") || headline.toLowerCase().includes("parity") || headline.toLowerCase().includes("visual");
  const isScaling = headline.toLowerCase().includes("scaling") || headline.toLowerCase().includes("growth") || headline.toLowerCase().includes("cohort") || headline.toLowerCase().includes("automation") || headline.toLowerCase().includes("workflow");
  const isOptimization = headline.toLowerCase().includes("optimiz") || headline.toLowerCase().includes("savings") || headline.toLowerCase().includes("cost");
  const isRemote = headline.toLowerCase().includes("remote") || headline.toLowerCase().includes("global") || headline.toLowerCase().includes("provisioning");
  const isScheduling = headline.toLowerCase().includes("scheduling") || headline.toLowerCase().includes("time tracking") || headline.toLowerCase().includes("shift") || headline.toLowerCase().includes("clock") || headline.toLowerCase().includes("timesheet") || headline.toLowerCase().includes("pto") || headline.toLowerCase().includes("attendance") || headline.toLowerCase().includes("leave") || headline.toLowerCase().includes("swap");
  const isPerformance = headline.toLowerCase().includes("performance") || headline.toLowerCase().includes("review") || headline.toLowerCase().includes("feedback") || headline.toLowerCase().includes("goal") || headline.toLowerCase().includes("okr") || headline.toLowerCase().includes("lms") || headline.toLowerCase().includes("learning") || headline.toLowerCase().includes("training") || headline.toLowerCase().includes("360") || headline.toLowerCase().includes("1-on-1");
  const isExpenses = headline.toLowerCase().includes("expense") || headline.toLowerCase().includes("receipt") || headline.toLowerCase().includes("ocr") || headline.toLowerCase().includes("reimburse") || headline.toLowerCase().includes("policy") || headline.toLowerCase().includes("claim") || headline.toLowerCase().includes("scanning") || headline.toLowerCase().includes("rules");
  const isPayrollCategory = headline.toLowerCase().includes("payroll") || headline.toLowerCase().includes("paycheck") || headline.toLowerCase().includes("w-2") || headline.toLowerCase().includes("1099") || headline.toLowerCase().includes("payout") || headline.toLowerCase().includes("direct deposit") || headline.toLowerCase().includes("deduction") || headline.toLowerCase().includes("garnishment") || headline.toLowerCase().includes("payout");

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
          {isHiring ? (
            <div className="h-full flex flex-col gap-4">
               {/* SEO Update ── Hiring & ATS Mockup ── */}
               <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2">
                     <Briefcase size={16} className="text-emerald-600" />
                     <span className="text-[11px] font-black text-slate-900 uppercase">Talent Pipeline</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               </div>
               <div className="space-y-3 flex-1">
                  {[
                    { name: "Caleb J.", role: "Sr. Designer", stage: "Interview", color: "blue" },
                    { name: "Mina K.", role: "Ops Lead", stage: "Offer Sent", color: "purple" },
                    { name: "Jordan W.", role: "Accountancy", stage: "Applied", color: "slate" },
                  ].map((cand, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-sm hover:border-emerald-200 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{cand.name[0]}</div>
                          <div>
                             <div className="text-[11px] font-bold text-slate-900">{cand.name}</div>
                             <div className="text-[9px] text-slate-500">{cand.role}</div>
                          </div>
                       </div>
                       <div className={`text-[8px] font-black px-2 py-0.5 rounded-full bg-${cand.color}-50 text-${cand.color}-600 border border-${cand.color}-100`}>
                          {cand.stage}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : isExpenses ? (
            <div className="h-full flex flex-col gap-4">
               {/* SEO Update ── Expenses & OCR Mockup ── */}
               <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl mb-1">
                  <div className="flex items-center gap-2">
                     <FileText size={16} className="text-rose-500" />
                     <span className="text-[11px] font-black text-slate-900 uppercase">Expense Claims</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">OCR Active</span>
               </div>
               <div className="space-y-3 flex-1 overflow-hidden">
                  {[
                    { merchant: "Uber", amount: "$24.50", status: "Approved", color: "emerald" },
                    { merchant: "Starbucks", amount: "$12.00", status: "Scanning...", color: "blue" },
                    { merchant: "Office Depot", amount: "$142.99", status: "Flagged", color: "rose" },
                  ].map((exp, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-sm">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><CreditCard size={14} className="text-slate-400" /></div>
                          <div>
                             <div className="text-[11px] font-bold text-slate-900">{exp.merchant}</div>
                             <div className="text-[9px] text-slate-500">{exp.amount}</div>
                          </div>
                       </div>
                       <div className={`text-[8px] font-black px-2 py-0.5 rounded-full bg-${exp.color}-50 text-${exp.color}-600 border border-${exp.color}-100`}>
                          {exp.status}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : isOnboarding ? (
            <div className="h-full flex flex-col gap-4">
               {/* SEO Update ── Onboarding Mockup ── */}
               <div className="flex items-center gap-2 mb-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <UserPlus size={16} className="text-purple-600" />
                  <span className="text-xs font-black text-slate-900 uppercase">Onboarding Checklist</span>
               </div>
               <div className="space-y-2 flex-1 overflow-hidden">
                  {[
                    { task: "Federal W-4 Form", status: "Completed", color: "emerald" },
                    { task: "Employee Handbook", status: "In Progress", color: "blue" },
                    { task: "Direct Deposit Setup", status: "Pending", color: "slate" },
                    { task: "I-9 Verification", status: "Completed", color: "emerald" },
                  ].map((task, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between">
                       <span className="text-[11px] font-bold text-slate-700 truncate pr-2">{task.task}</span>
                       <div className="flex items-center gap-2 shrink-0">
                          <div className={`w-2 h-2 rounded-full bg-${task.color}-500`} />
                          <span className="text-[9px] font-black text-slate-400">{task.status}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : isPayrollCategory ? (
             <div className="space-y-4">
                {/* SEO Update ── Detailed Payroll Mockup ── */}
                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl">
                   <div className="flex justify-between items-center mb-6">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Pay Cycle</div>
                      <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded font-black">AUTO-RUN ON</span>
                   </div>
                   <div className="text-3xl font-black mb-2">$84,204.50</div>
                   <div className="text-[11px] text-slate-400">Est. Cash Requirement &middot; Friday, June 20th</div>
                </div>
                <div className="space-y-2">
                   {[
                     { label: "Net Pay", val: "$62,100.00" },
                     { label: "Employer Taxes", val: "$8,405.12" },
                     { label: "Benefits Funding", val: "$13,699.38" }
                   ].map((row, i) => (
                      <div key={i} className="flex justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                         <span className="text-[11px] font-bold text-slate-600">{row.label}</span>
                         <span className="text-[11px] font-black text-slate-900">{row.val}</span>
                      </div>
                   ))}
                </div>
             </div>
          ) : isRemote ? (
            <div className="h-full flex flex-col gap-4">
               {/* SEO Update ── Remote Workplace Mockup ── */}
               <div className="flex items-center gap-2 mb-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <Globe size={16} className="text-blue-600" />
                  <span className="text-xs font-black text-slate-900 uppercase">Global Workplace</span>
               </div>
               <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
                  {[
                    { country: "United Kingdom", staff: "12 people", status: "Compliant" },
                    { country: "Germany", staff: "5 people", status: "Compliant" },
                    { country: "Canada", staff: "8 people", status: "Nexus Active" },
                    { country: "Singapore", staff: "3 people", status: "Pending" },
                  ].map((loc, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col justify-between">
                       <div className="text-[11px] font-black text-slate-900">{loc.country}</div>
                       <div className="text-[9px] text-slate-500 mt-1">{loc.staff}</div>
                       <div className="mt-3 flex items-center justify-between">
                          <div className={`w-1.5 h-1.5 rounded-full ${loc.status === 'Compliant' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="text-[8px] font-bold text-slate-400">{loc.status}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : isOptimization ? (
            <div className="h-full flex flex-col gap-4 justify-center">
               {/* SEO Update ── Cost Optimization Mockup ── */}
               <div className="text-center mb-6">
                  <div className="text-[10px] font-black text-slate-400 uppercase mb-2">Annualized Savings Potential</div>
                  <div className="text-4xl font-black text-emerald-500">$84,200.00</div>
                  <div className="text-[10px] text-slate-500 mt-2 font-bold italic">via Automated Tax Incentives</div>
               </div>
               <div className="space-y-2">
                  {[
                    { label: "Employer Tax Credit", amount: "$12,400" },
                    { label: "Health Benefit Optimization", amount: "$8,500" },
                    { label: "Overlap Reduction", amount: "$4,200" }
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl items-center">
                       <span className="text-[11px] font-bold text-slate-700">{row.label}</span>
                       <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-emerald-600">+{row.amount}</span>
                          <ArrowUpRight size={12} className="text-emerald-500" />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : isPerformance ? (
            <div className="h-full flex flex-col gap-4">
               {/* SEO Update ── Performance Review Mockup ── */}
               <div className="flex items-center gap-2 mb-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <Star size={16} className="text-amber-500" />
                  <span className="text-xs font-black text-slate-900 uppercase">Quarterly Reviews</span>
               </div>
               <div className="space-y-3 flex-1 overflow-hidden">
                  {[
                    { name: "John Miller", score: "4.8/5", status: "Completed", color: "emerald" },
                    { name: "Sarah Wayne", score: "Pending", status: "Self-Review", color: "blue" },
                    { name: "Alex Rivera", score: "4.2/5", status: "Completed", color: "emerald" },
                  ].map((review, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-sm">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{review.name[0]}</div>
                          <div className="text-[11px] font-bold text-slate-900">{review.name}</div>
                       </div>
                       <div className="text-right">
                          <div className="text-[10px] font-black text-slate-900">{review.score}</div>
                          <div className={`text-[8px] font-black uppercase tracking-wider text-${review.color}-500`}>{review.status}</div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : isScheduling ? (
            <div className="h-full flex flex-col gap-4">
               {/* SEO Update ── Scheduling Mockup ── */}
               <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl mb-1">
                  <div className="flex items-center gap-2">
                     <Clock size={16} className="text-blue-500" />
                     <span className="text-[11px] font-black text-slate-900 uppercase">Shift Roster</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Total Hours: 142.5</span>
               </div>
               <div className="grid grid-cols-2 gap-3 flex-1">
                  {[
                    { name: "Morning Shift", time: "08:00 - 16:00", staff: 12, color: "blue" },
                    { name: "Day Shift", time: "10:00 - 18:00", staff: 8, color: "indigo" },
                    { name: "Evening Shift", time: "16:00 - 00:00", staff: 14, color: "emerald" },
                    { name: "On-Call", time: "Emergency", staff: 2, color: "rose" },
                  ].map((shift, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
                       <div className="flex flex-col">
                          <div className="text-[11px] font-black text-slate-900 truncate">{shift.name}</div>
                          <div className="text-[9px] text-slate-500">{shift.time}</div>
                       </div>
                       <div className="flex items-center justify-between mt-3">
                          <div className="flex -space-x-1.5">
                             {[1, 2, 3].map(j => (
                               <div key={j} className="w-5 h-5 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                                  {j}
                               </div>
                             ))}
                          </div>
                          <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-full bg-${shift.color}-50 text-${shift.color}-600 border border-${shift.color}-100`}>
                             {shift.staff} Active
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : isHiring ? (
            <div className="h-full flex flex-col gap-4">
               {/* SEO Update ── Hiring Pipeline Mockup ── */}
               <div className="flex items-center gap-2 mb-2">
                  <Briefcase size={16} className="text-blue-600" />
                  <span className="text-xs font-black text-slate-900 uppercase">Hiring Pipeline</span>
               </div>
               <div className="flex gap-3 overflow-hidden h-full">
                  {[
                    { stage: "Applied", names: ["John D.", "Sarah K."], count: 12 },
                    { stage: "Interview", names: ["Mark S.", "Anna P."], count: 4 },
                    { stage: "Offer", names: ["Tom H."], count: 1 }
                  ].map((stage, i) => (
                    <div key={i} className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex flex-col gap-2">
                       <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-400 uppercase">{stage.stage}</span>
                          <span className="text-[8px] px-1.5 py-0.5 bg-white border border-slate-200 rounded-full font-bold">{stage.count}</span>
                       </div>
                       <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                          {stage.names.map((name, j) => (
                            <div key={j} className="p-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 shadow-sm">
                              {name}
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : isTax ? (
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
