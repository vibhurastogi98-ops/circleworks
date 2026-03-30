"use client";

import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ResourceCTA from "@/components/ResourceCTA";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

// Tooltip Component
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 5 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#1A2534] border border-white/10 rounded-xl text-[10px] leading-relaxed text-slate-300 shadow-2xl z-[100] pointer-events-none"
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#1A2534]" />
        </motion.div>
      )}
    </div>
  );
};

export default function ROICalculator() {
  // Inputs
  const [employees, setEmployees] = useState<string | number>(50);
  const [avgSalary, setAvgSalary] = useState<string | number>(75000);
  const [hrAdminHours, setHrAdminHours] = useState<string | number>(15); // per week
  const [payrollHours, setPayrollHours] = useState<string | number>(8);   // per month
  const [turnoverRate, setTurnoverRate] = useState<string | number>(15); // %
  const [overheadPercent, setOverheadPercent] = useState<string | number>(20); // % benefits/overhead
  
  const errors = useMemo(() => {
    const newErrors: { [key: string]: string } = {};
    if (employees === "" || Number(employees) < 1) newErrors.employees = "Must be at least 1 employee";
    if (avgSalary === "" || Number(avgSalary) <= 0) newErrors.avgSalary = "Salary must be greater than zero";
    if (hrAdminHours === "" || Number(hrAdminHours) < 0) newErrors.hrAdminHours = "Hours cannot be negative";
    if (payrollHours === "" || Number(payrollHours) < 0) newErrors.payrollHours = "Hours cannot be negative";
    return newErrors;
  }, [employees, avgSalary, hrAdminHours, payrollHours]);

  const calcs = useMemo(() => {
    const empNum = Number(employees) || 0;
    const salaryNum = Number(avgSalary) || 0;
    const hrHoursNum = Number(hrAdminHours) || 0;
    const payrollHoursNum = Number(payrollHours) || 0;
    const turnoverNum = Number(turnoverRate) || 0;
    const overheadNum = Number(overheadPercent) || 0;

    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors || empNum === 0 || salaryNum === 0) return null;

    const fullyLoadedSalary = salaryNum * (1 + overheadNum/100);
    const hourlyRate = fullyLoadedSalary / 2080;
    
    const automationFactor = 0.75;
    const costPerError = 250;
    const errorReductionFactor = 0.90;
    const turnoverReduction = 0.05;
    const costPerHire = 5000;

    const currentYearlyHours = (hrHoursNum * 52) + (payrollHoursNum * 12);
    const savedHours = currentYearlyHours * automationFactor;
    const laborSavings = savedHours * hourlyRate;

    const manualErrors = empNum * 12 * 0.01; 
    const errorSavings = (manualErrors * errorReductionFactor) * costPerError;

    const turnoverSavedCount = empNum * turnoverReduction;
    const turnoverSavings = turnoverSavedCount * costPerHire;

    const annualSoftwareCost = (empNum * 10 * 12) + 1200;

    const totalBenefit = laborSavings + errorSavings + turnoverSavings;
    const netSavings = totalBenefit - annualSoftwareCost;
    const roiPercent = (netSavings / annualSoftwareCost) * 100;
    const paybackMonths = (annualSoftwareCost / (totalBenefit / 12));

    return {
      laborSavings,
      errorSavings,
      turnoverSavings,
      totalBenefit,
      netSavings,
      roiPercent,
      paybackMonths,
      savedHours,
      manualCost: laborSavings + annualSoftwareCost + 2000,
      autoCost: annualSoftwareCost
    };
  }, [employees, avgSalary, hrAdminHours, payrollHours, turnoverRate, overheadPercent, errors]);

  const reset = () => {
    setEmployees(50);
    setAvgSalary(75000);
    setHrAdminHours(15);
    setPayrollHours(8);
  };


  return (
    <main className="min-h-screen bg-[#060B13] font-sans selection:bg-cyan-200 selection:text-navy text-white">
      <Navbar />

      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden z-10 border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[1000px] h-[1000px] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="mb-12 flex justify-center">
             <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Resources", href: "/guides" }, { label: "ROI Calculator" }]} variant="dark" />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-white/5 text-emerald-400 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-8"
          >
            EFFICIENCY AUDIT TOOL
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8"
          >
            Quantify Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Total Savings.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg lg:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Switching from manual HR and payroll to CircleWorks automation can save hundreds of hours and thousands in labor costs annually.
          </motion.p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            {/* INPUT PANEL */}
            <div className="lg:col-span-5 space-y-8">
               {Object.keys(errors).length > 0 && (
                  <motion.div 
                     initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                     className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-xs font-bold"
                  >
                     <span>⚠️</span> Multiple fields need your attention.
                  </motion.div>
               )}

               <div className="bg-[#0A1628] border border-white/10 rounded-[32px] p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-full h-[2px] transition-colors ${Object.keys(errors).length > 0 ? "bg-red-500" : "bg-gradient-to-r from-emerald-500 to-cyan-500"}`} />
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                       <span className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-sm">🛠️</span>
                       Company Profile
                    </h3>
                    <button onClick={reset} className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Reset</button>
                  </div>

                  <div className="space-y-10">
                     {/* Employees */}
                     <div className="group/field">
                        <div className="flex justify-between items-center mb-5">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             Employees
                             <Tooltip text="Total headcount including contractors."><span className="cursor-help opacity-40">ⓘ</span></Tooltip>
                           </label>
                           <input 
                              type="number"
                              value={employees} 
                              onChange={(e) => setEmployees(e.target.value)}
                              className={`w-20 bg-black/40 border rounded-lg px-2 py-1 text-right font-black text-xl outline-none transition-all ${
                                 errors.employees ? "border-red-500 bg-red-500/5 text-red-500" : "border-white/5 text-white focus:border-emerald-500/50"
                              }`}
                           />
                        </div>
                        <input 
                           type="range" min="1" max="1000" step="1" value={Number(employees) || 0} onChange={(e)=>setEmployees(Number(e.target.value))}
                           className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500" 
                        />
                        <AnimatePresence>
                           {errors.employees && (
                              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-[10px] text-red-400 font-bold mt-2">
                                 {errors.employees}
                              </motion.p>
                           )}
                        </AnimatePresence>
                     </div>

                     {/* Salary */}
                     <div className="group/field">
                        <div className="flex justify-between items-center mb-5">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             Avg. Salary ($)
                             <Tooltip text="Average annual salary across entire workforce."><span className="cursor-help opacity-40">ⓘ</span></Tooltip>
                           </label>
                           <input 
                              type="number"
                              value={avgSalary} 
                              onChange={(e) => setAvgSalary(e.target.value)}
                              className={`w-32 bg-black/40 border rounded-lg px-2 py-1 text-right font-black text-xl outline-none transition-all ${
                                 errors.avgSalary ? "border-red-500 bg-red-500/5 text-red-500" : "border-white/5 text-white focus:border-emerald-500/50"
                              }`}
                           />
                        </div>
                        <input 
                           type="range" min="30000" max="250000" step="5000" value={Number(avgSalary) || 0} onChange={(e)=>setAvgSalary(Number(e.target.value))}
                           className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500" 
                        />
                        <AnimatePresence>
                           {errors.avgSalary && (
                              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-[10px] text-red-400 font-bold mt-2">
                                 {errors.avgSalary}
                              </motion.p>
                           )}
                        </AnimatePresence>
                     </div>

                     <div className="h-px bg-white/5" />

                     {/* HR Hours */}
                     <div className="group/field">
                        <div className="flex justify-between items-center mb-5">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             HR Admin (Hrs/Wk)
                             <Tooltip text="Time spent on employee info updates, leave requests, and onboarding."><span className="cursor-help opacity-40">ⓘ</span></Tooltip>
                           </label>
                           <input 
                              type="number"
                              value={hrAdminHours} 
                              onChange={(e) => setHrAdminHours(e.target.value)}
                              className={`w-20 bg-black/40 border rounded-lg px-2 py-1 text-right font-black text-xl outline-none transition-all ${
                                 errors.hrAdminHours ? "border-red-500 bg-red-500/5 text-red-500" : "border-white/5 text-white focus:border-cyan-500/50"
                              }`}
                           />
                        </div>
                        <input 
                           type="range" min="0" max="60" step="1" value={Number(hrAdminHours) || 0} onChange={(e)=>setHrAdminHours(Number(e.target.value))}
                           className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyan-500" 
                        />
                        <AnimatePresence>
                           {errors.hrAdminHours && (
                              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-[10px] text-red-400 font-bold mt-2">
                                 {errors.hrAdminHours}
                              </motion.p>
                           )}
                        </AnimatePresence>
                     </div>

                     {/* Payroll Hours */}
                     <div className="group/field">
                        <div className="flex justify-between items-center mb-5">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             Payroll (Hrs/Mo)
                             <Tooltip text="Time spent calculating, net-to-gross, and running manual pay."><span className="cursor-help opacity-40">ⓘ</span></Tooltip>
                           </label>
                           <input 
                              type="number"
                              value={payrollHours} 
                              onChange={(e) => setPayrollHours(e.target.value)}
                              className={`w-20 bg-black/40 border rounded-lg px-2 py-1 text-right font-black text-xl outline-none transition-all ${
                                 errors.payrollHours ? "border-red-500 bg-red-500/5 text-red-500" : "border-white/5 text-white focus:border-cyan-500/50"
                              }`}
                           />
                        </div>
                        <input 
                           type="range" min="0" max="60" step="1" value={Number(payrollHours) || 0} onChange={(e)=>setPayrollHours(Number(e.target.value))}
                           className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyan-500" 
                        />
                        <AnimatePresence>
                           {errors.payrollHours && (
                              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-[10px] text-red-400 font-bold mt-2">
                                 {errors.payrollHours}
                              </motion.p>
                           )}
                        </AnimatePresence>
                     </div>
                  </div>
               </div>

               <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    &quot;We&apos;ve seen mid-market companies save over 20 hours a week just by centralizing their data in CircleWorks.&quot; — ROI Benchmark 2026
                  </p>
               </div>
            </div>

            {/* RESULTS DASHBOARD */}
            <div className="lg:col-span-7 space-y-8">
               <div className="bg-[#0F1C2E] border border-white/10 rounded-[32px] p-8 lg:p-12 shadow-2xl shadow-emerald-950/20 relative group overflow-hidden min-h-[500px] flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                     {calcs ? (
                        <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />
                           
                           <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                              <div className="text-center">
                                 <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Savings</div>
                                 <div className="text-3xl font-black text-emerald-400 tracking-tight">${calcs.netSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                              </div>
                              <div className="text-center">
                                 <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">ROI (Annual)</div>
                                 <div className="text-3xl font-black text-white tracking-tight">{calcs.roiPercent.toFixed(0)}%</div>
                              </div>
                              <div className="text-center">
                                 <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Payback Period</div>
                                 <div className="text-3xl font-black text-white tracking-tight">{calcs.paybackMonths.toFixed(1)}mo</div>
                              </div>
                              <div className="text-center">
                                 <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Time Recovered</div>
                                 <div className="text-3xl font-black text-white tracking-tight">{calcs.savedHours.toFixed(0)}h</div>
                              </div>
                           </div>

                           <div className="h-px bg-white/5 mb-12" />

                           {/* VISUALIZATION: BAR CHART */}
                           <div className="mb-12">
                              <div className="flex justify-between items-center mb-8">
                                 <h4 className="text-sm font-black text-white uppercase tracking-widest">Efficiency Breakdown</h4>
                                 <span className="text-[10px] font-bold text-slate-500">MANUAL VS CIRCLEWORKS</span>
                              </div>
                              
                              <div className="space-y-8">
                                 <div>
                                    <div className="flex items-center justify-between mb-3">
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Annual Labor Cost (Manual)</span>
                                       <span className="text-sm font-bold text-white">${calcs.manualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="w-full h-8 bg-white/5 rounded-xl overflow-hidden backdrop-blur-sm border border-white/5">
                                       <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: "100%" }}
                                          className="h-full bg-slate-700/50"
                                       />
                                    </div>
                                 </div>
                                 <div>
                                    <div className="flex items-center justify-between mb-3">
                                       <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Automation Efficiency Cost (Automated)</span>
                                       <span className="text-sm font-bold text-emerald-400">${calcs.autoCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</span>
                                    </div>
                                    <div className="w-full h-10 bg-white/5 rounded-2xl overflow-hidden backdrop-blur-sm border border-emerald-500/10 p-1">
                                       <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${(calcs.autoCost / calcs.manualCost) * 100}%` }}
                                          transition={{ type: "spring", damping: 15 }}
                                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-xl flex items-center px-4"
                                          style={{ minWidth: "20%" }}
                                       >
                                          <span className="text-[9px] font-black text-black uppercase">Savings Tier &uarr;</span>
                                       </motion.div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="grid md:grid-cols-3 gap-6">
                              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                 <div className="text-2xl mb-3">⏱️</div>
                                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admin Productivity</h5>
                                 <p className="text-lg font-black text-white">+${calcs.laborSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                              </div>
                              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                 <div className="text-2xl mb-3">📉</div>
                                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Error Reduction</h5>
                                 <p className="text-lg font-black text-white">+${calcs.errorSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                              </div>
                              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                 <div className="text-2xl mb-3">👔</div>
                                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Retention Gain</h5>
                                 <p className="text-lg font-black text-white">+${calcs.turnoverSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                              </div>
                           </div>
                        </motion.div>
                     ) : (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-12">
                           <div className="text-6xl mb-6 grayscale opacity-30">🧮</div>
                           <h4 className="text-xl font-black text-white mb-2">Calculations Paused</h4>
                           <p className="text-slate-500 font-medium">Please complete all required fields on the left to view your ROI assessment.</p>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>


               <div className="bg-white rounded-[32px] p-10 text-[#0A1628] flex flex-col md:flex-row items-center justify-between gap-8">
                  <div>
                     <h4 className="text-2xl font-black mb-2">Ready to unlock these savings?</h4>
                     <p className="text-slate-500 font-medium">Join 1,000+ businesses who automated their HR backend.</p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                     <Link href="/pricing" className="px-8 py-4 bg-[#0A1628] text-white font-black rounded-xl hover:scale-105 transition-all text-center">Unlock Savings</Link>
                     <Link href="/contact" className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-400 font-bold rounded-xl hover:bg-slate-50 transition-all text-center">Book Demo</Link>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <section className="py-32 border-t border-white/5">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20 text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Industry Comparisons</div>
            <div className="grid md:grid-cols-2 gap-12">
               <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 lg:p-14">
                  <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                     <span className="text-3xl">📝</span> The Manual Way
                  </h3>
                  <ul className="space-y-6">
                     <li className="flex items-center gap-4 text-slate-400 font-medium">
                        <span className="text-red-500">✕</span> High admin burden (15h/week)
                     </li>
                     <li className="flex items-center gap-4 text-slate-400 font-medium">
                        <span className="text-red-500">✕</span> Potential for IRS/Nexus filing errors
                     </li>
                     <li className="flex items-center gap-4 text-slate-400 font-medium">
                        <span className="text-red-500">✕</span> High turnover due to poor HR experience
                     </li>
                     <li className="flex items-center gap-4 text-slate-400 font-medium">
                        <span className="text-red-500">✕</span> Fragile spreadsheet dependencies
                     </li>
                  </ul>
               </div>
               <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[40px] p-10 lg:p-14">
                  <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                     <span className="text-3xl">✨</span> The CircleWorks Way
                  </h3>
                  <ul className="space-y-6">
                     <li className="flex items-center gap-4 text-slate-300 font-medium">
                        <span className="text-emerald-500">✓</span> Automated payroll in &lt; 10 minutes
                     </li>
                     <li className="flex items-center gap-4 text-slate-300 font-medium">
                        <span className="text-emerald-500">✓</span> Native 50-state tax compliance built-in
                     </li>
                     <li className="flex items-center gap-4 text-slate-300 font-medium">
                        <span className="text-emerald-500">✓</span> Modern self-service for all employees
                     </li>
                     <li className="flex items-center gap-4 text-slate-300 font-medium">
                        <span className="text-emerald-500">✓</span> Single source of truth (Live Dashboard)
                     </li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      <section className="py-20 text-center">
         <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest max-w-xl mx-auto">
           * Estimates based on U.S. Bureau of Labor Statistics averages and CircleWorks 2026 efficiency cohort data. Actual results may vary based on local labor costs and complexity.
         </p>
      </section>

      <ResourceCTA 
         title="Need an audited ROI report?" 
         description="Our financial analysts can build a custom business case for your stakeholders including detailed TCO and cash-flow impact."
      />

      <Footer />
    </main>
  );
}
