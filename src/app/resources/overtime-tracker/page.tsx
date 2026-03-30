"use client";

import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ResourceCTA from "@/components/ResourceCTA";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { stateGuides } from "@/data/states";

// State Overtime Rules Configuration
const OT_RULES = {
  california: {
    name: "California",
    hasDaily: true,
    dailyOTLimit: 8,
    dailyDTLimit: 12,
    has7thDayRules: true,
    weeklyLimit: 40,
  },
  default: {
    hasDaily: false,
    weeklyLimit: 40,
  }
};

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

export default function OvertimeTracker() {
  const [selectedStateId, setSelectedStateId] = useState("california");
  const [hourlyRate, setHourlyRate] = useState<number | "">(35);
  const [hours, setHours] = useState<number[]>([8, 8, 8, 8, 8, 0, 0]); // Mon-Sun
  const [useCAAdvanced, setUseCAAdvanced] = useState(true);
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleHourChange = (idx: number, val: string) => {
    const newHours = [...hours];
    const n = val === "" ? 0 : parseFloat(val);
    newHours[idx] = Math.min(24, Math.max(0, n));
    setHours(newHours);
  };

  const calcs = useMemo(() => {
    const rate = Number(hourlyRate) || 0;
    const isCA = selectedStateId === "california" && useCAAdvanced;
    
    let regularHours = 0;
    let otHours = 0; // 1.5x
    let dtHours = 0; // 2.0x

    if (isCA) {
      const is7thDayWorkedInWeek = hours.every(h => h > 0);
      
      hours.forEach((h, idx) => {
        // 7th consecutive day rule
        if (idx === 6 && is7thDayWorkedInWeek) {
          const dayReg = Math.min(8, h);
          const dayOT = h > 8 ? h - 8 : 0;
          otHours += dayReg;
          dtHours += dayOT;
        } else {
          // Daily Rule
          const dayReg = Math.min(8, h);
          const dayOT = h > 8 ? Math.min(4, h - 8) : 0;
          const dayDT = h > 12 ? h - 12 : 0;
          
          regularHours += dayReg;
          otHours += dayOT;
          dtHours += dayDT;
        }
      });

      // Weekly Rule (California): Any hours over 40 in a workweek that aren't already daily OT
      const totalRegInWeek = regularHours;
      if (totalRegInWeek > 40) {
        const excess = totalRegInWeek - 40;
        regularHours = 40;
        otHours += excess;
      }
    } else {
      // Federal / Standard 40h Rule
      const totalHours = hours.reduce((a, b) => a + b, 0);
      regularHours = Math.min(40, totalHours);
      otHours = Math.max(0, totalHours - 40);
      dtHours = 0;
    }

    const regPay = regularHours * rate;
    const otPay = otHours * rate * 1.5;
    const dtPay = dtHours * rate * 2.0;

    return {
      isCA,
      regularHours,
      otHours,
      dtHours,
      totalHours: hours.reduce((a, b) => a + b, 0),
      regPay,
      otPay,
      dtPay,
      totalPay: regPay + otPay + dtPay
    };
  }, [hours, hourlyRate, selectedStateId, useCAAdvanced]);

  const breakWarnings = useMemo(() => {
    return hours.map((h, i) => (h > 5 && selectedStateId === "california" ? i : null)).filter(x => x !== null) as number[];
  }, [hours, selectedStateId]);

  return (
    <main className="min-h-screen bg-[#060B13] font-sans selection:bg-orange-200 selection:text-navy text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden z-10 border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[1000px] h-[1000px] bg-orange-600/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="mb-8 flex justify-center">
             <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Resources", href: "/guides" }, { label: "Overtime Tracker" }]} variant="dark" />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-white/5 text-orange-400 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6"
          >
            FLSA COMPLIANCE TOOL
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6"
          >
             Precision <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Overtime Tracking.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg lg:text-xl text-slate-400 mb-6 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Stay compliant with federal FLSA and state labor laws including daily overtime, weekly limits, and double-time rules.
          </motion.p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Supports all 50 U.S. states with advanced California rules
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Panel: Configuration & Timesheet */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#0A1628] border border-white/10 rounded-[40px] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
               <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="relative group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                       Work State (Required)
                       <Tooltip text="Select the state where the work is physically performed to apply correct labor laws."><span className="cursor-help opacity-40">ⓘ</span></Tooltip>
                    </label>
                    <select 
                       value={selectedStateId}
                       onChange={(e) => setSelectedStateId(e.target.value)}
                       className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer"
                    >
                       {stateGuides.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
                    </select>
                    <div className="absolute right-6 bottom-5 pointer-events-none text-slate-500">▼</div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Hourly Rate ($)</label>
                    <input 
                       type="number" 
                       value={hourlyRate}
                       onChange={(e) => setHourlyRate(e.target.value === "" ? "" : parseFloat(e.target.value))}
                       className={`w-full bg-black/40 border rounded-2xl px-6 py-4 text-white font-bold outline-none transition-all ${
                          hourlyRate === "" || Number(hourlyRate) <= 0 ? "border-red-500 bg-red-500/5" : "border-white/10 focus:border-orange-500"
                       }`} 
                    />
                    { (hourlyRate === "" || Number(hourlyRate) <= 0) && <p className="text-[9px] text-red-500 font-bold mt-2">Please enter a valid rate</p> }
                  </div>
               </div>

               {selectedStateId === "california" && (
                  <div className="mb-12 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl flex items-center justify-between">
                     <span className="text-xs font-bold text-orange-400">Apply California Advanced Rules (Daily + 7th Day)?</span>
                     <button 
                        onClick={() => setUseCAAdvanced(!useCAAdvanced)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${useCAAdvanced ? "bg-orange-500" : "bg-slate-700"}`}
                     >
                        <motion.div 
                           animate={{ x: useCAAdvanced ? 26 : 4 }}
                           className="w-4 h-4 bg-white rounded-full absolute top-1"
                        />
                     </button>
                  </div>
               )}
               <div className="bg-black/20 rounded-3xl overflow-hidden border border-white/5">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-white/[0.02] border-b border-white/5">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Day</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Hours</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Metrics</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {days.map((day, i) => (
                          <tr key={day} className="group hover:bg-white/[0.01] transition-colors">
                             <td className="px-8 py-3 font-black text-sm leading-tight">{day}</td>
                             <td className="px-8 py-3">
                                <div className="flex justify-center">
                                   <input 
                                     type="number"
                                     value={hours[i]}
                                     onChange={(e) => handleHourChange(i, e.target.value)}
                                     className={`w-20 bg-black/40 border rounded-xl px-4 py-2 text-center font-black text-lg outline-none transition-all ${
                                       hours[i] > 12 ? "border-red-500 text-red-400" : hours[i] > 8 ? "border-orange-500/50 text-orange-400" : "border-white/5 text-white"
                                     }`}
                                   />
                                </div>
                                {breakWarnings.includes(i) && (
                                   <p className="text-[7px] text-center text-orange-500/60 font-black mt-1 uppercase">⚠ Missing Break Warning</p>
                                )}
                             </td>
                             <td className="px-8 py-3 text-right">
                                <div className="flex flex-col items-end gap-1">
                                   {hours[i] > 12 && calcs.isCA && <span className="text-[9px] font-black text-red-500 uppercase">Double Time</span>}
                                   {hours[i] > 8 && <span className="text-[9px] font-black text-orange-500 uppercase">Daily OT</span>}
                                   {hours[i] < 0 && <span className="text-[9px] font-black text-red-500 uppercase">Invalid</span>}
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>

            {/* Educational Info */}
            <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                  <h4 className="text-white font-black text-lg mb-4">What is the FLSA?</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 italic">The Fair Labor Standards Act is federal law established in 1938 to ensure fair pay and limit excessive hours.</p>
                  <ul className="space-y-2">
                     <li className="flex items-center gap-3 text-xs text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Weekly OT after 40 hours</li>
                     <li className="flex items-center gap-3 text-xs text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Minimum wage protection</li>
                     <li className="flex items-center gap-3 text-xs text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Record-keeping standards</li>
                  </ul>
               </div>
               <div className="bg-orange-500/5 rounded-3xl p-6 border border-orange-500/10">
                  <h4 className="text-white font-black text-lg mb-4">California Rules</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">California has the strictest rules in the U.S. providing daily protection for workers.</p>
                  <div className="space-y-4">
                     <div className="flex justify-between text-[10px] font-black uppercase text-orange-500/80"><span>8 - 12 Hours Day</span> <span>1.5x</span></div>
                     <div className="flex justify-between text-[10px] font-black uppercase text-red-500/80"><span>12+ Hours Day</span> <span>2.0x</span></div>
                     <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>7th Consecutive</span> <span>Premium</span></div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Panel: Live Snapshot */}
          <div className="lg:col-span-4 sticky top-32 space-y-8">
             <div className="bg-[#0F1C2E] border border-white/10 rounded-[40px] p-8 shadow-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] to-transparent pointer-events-none" />
                <h3 className="text-xl font-black text-white mb-6 flex items-center justify-between">
                   Pay Summary
                   <span className="text-[10px] font-black bg-white/5 text-slate-500 px-3 py-1 rounded-full uppercase">{selectedStateId}</span>
                </h3>

                <div className="space-y-6">
                   {/* Hours Breakdown */}
                   <div className="space-y-4">
                      <div className="flex justify-between items-center group/item">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           Regular Hours
                           <Tooltip text="Standard work hours charged at 1.0x rate. Limited to 40 per week or 8 per day."><span className="cursor-help opacity-30">ⓘ</span></Tooltip>
                         </span>
                         <span className="text-white font-black text-lg">{calcs.regularHours.toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Overtime (1.5x)</span>
                         <span className="text-orange-400 font-black text-lg">{calcs.otHours.toFixed(1)}h</span>
                      </div>
                      {calcs.dtHours > 0 && (
                         <div className="flex justify-between items-center text-red-500">
                            <span className="text-[10px] font-black uppercase tracking-widest">Double Time (2.0x)</span>
                            <span className="font-black text-lg text-red-500">{calcs.dtHours.toFixed(1)}h</span>
                         </div>
                      )}
                      
                      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Weekly Total</span>
                        <span className="text-2xl font-black text-white tracking-tighter">{calcs.totalHours.toFixed(1)}h</span>
                      </div>
                   </div>

                   {/* Pay Breakdown */}
                   <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-xs text-slate-500 font-medium">Regular Pay</span>
                         <span className="text-sm font-black text-white">${calcs.regPay.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs text-slate-500 font-medium">Premium Pay (OT+DT)</span>
                         <span className="text-sm font-black text-orange-400">+${(calcs.otPay + calcs.dtPay).toLocaleString()}</span>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                         <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estimated Weekly Gross</div>
                         <div className="text-3xl font-black text-white tracking-tight">${calcs.totalPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-[40px] p-8 text-[#0A1628] shadow-2xl">
                <h4 className="text-2xl font-black mb-3">Eliminate compliance anxiety.</h4>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed text-sm">Automate your complex multi-state payroll calculations with CircleWorks.</p>
                <div className="space-y-3">
                   <Link href="/pricing" className="block w-full py-4 bg-[#0A1628] text-white font-black rounded-2xl hover:scale-[1.02] transition-all text-xs uppercase tracking-widest text-center">Get Started Free</Link>
                   <Link href="/contact" className="block w-full py-4 bg-white border-2 border-[#0A1628] text-[#0A1628] font-black rounded-2xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest text-center">Book a Demo</Link>
                </div>
             </div>
          </div>
        </div>
      </section>

      <ResourceCTA 
         title="Need an audit-proof timesheet system?" 
         description="Our enterprise time tracking handles meal penalties, split-shifts, and local ordinances for your entire distributed workforce."
      />

      <Footer />
    </main>
  );
}
