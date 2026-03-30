"use client";

import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ResourceCTA from "@/components/ResourceCTA";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

// --- DATA & TYPES ---

interface StateTaxData {
  name: string;
  type: "none" | "flat" | "progressive";
  rate?: number; // For flat tax
  brackets?: { threshold: number; rate: number }[]; // For progressive
}

const states: Record<string, StateTaxData> = {
  "AL": { name: "Alabama", type: "progressive", brackets: [{ threshold: 0, rate: 0.02 }, { threshold: 500, rate: 0.04 }, { threshold: 3000, rate: 0.05 }] },
  "AK": { name: "Alaska", type: "none" },
  "AZ": { name: "Arizona", type: "flat", rate: 0.025 },
  "AR": { name: "Arkansas", type: "progressive", brackets: [{ threshold: 0, rate: 0.02 }, { threshold: 5000, rate: 0.04 }, { threshold: 10000, rate: 0.044 }] },
  "CA": { name: "California", type: "progressive", brackets: [{ threshold: 0, rate: 0.01 }, { threshold: 10412, rate: 0.02 }, { threshold: 24684, rate: 0.04 }, { threshold: 38959, rate: 0.06 }, { threshold: 54081, rate: 0.08 }, { threshold: 68350, rate: 0.093 }, { threshold: 349137, rate: 0.103 }, { threshold: 418961, rate: 0.113 }, { threshold: 698271, rate: 0.123 }] },
  "CO": { name: "Colorado", type: "flat", rate: 0.044 },
  "CT": { name: "Connecticut", type: "progressive", brackets: [{ threshold: 0, rate: 0.03 }, { threshold: 10000, rate: 0.05 }, { threshold: 50000, rate: 0.055 }, { threshold: 100000, rate: 0.06 }, { threshold: 200000, rate: 0.065 }, { threshold: 250000, rate: 0.069 }, { threshold: 500000, rate: 0.0699 }] },
  "DE": { name: "Delaware", type: "progressive", brackets: [{ threshold: 2000, rate: 0.022 }, { threshold: 5000, rate: 0.039 }, { threshold: 10000, rate: 0.048 }, { threshold: 20000, rate: 0.052 }, { threshold: 25000, rate: 0.0555 }, { threshold: 60000, rate: 0.066 }] },
  "FL": { name: "Florida", type: "none" },
  "GA": { name: "Georgia", type: "flat", rate: 0.0549 },
  "HI": { name: "Hawaii", type: "progressive", brackets: [{ threshold: 0, rate: 0.014 }, { threshold: 2400, rate: 0.032 }, { threshold: 4800, rate: 0.055 }, { threshold: 9600, rate: 0.064 }, { threshold: 14400, rate: 0.068 }, { threshold: 19200, rate: 0.072 }, { threshold: 24000, rate: 0.076 }, { threshold: 36000, rate: 0.079 }, { threshold: 48000, rate: 0.0825 }, { threshold: 150000, rate: 0.09 }, { threshold: 175000, rate: 0.1 }, { threshold: 200000, rate: 0.11 }] },
  "ID": { name: "Idaho", type: "flat", rate: 0.058 },
  "IL": { name: "Illinois", type: "flat", rate: 0.0495 },
  "IN": { name: "Indiana", type: "flat", rate: 0.0305 },
  "IA": { name: "Iowa", type: "progressive", brackets: [{ threshold: 0, rate: 0.044 }, { threshold: 6000, rate: 0.0482 }, { threshold: 30000, rate: 0.057 }, { threshold: 75000, rate: 0.06 }] },
  "KS": { name: "Kansas", type: "progressive", brackets: [{ threshold: 0, rate: 0.031 }, { threshold: 15000, rate: 0.0525 }, { threshold: 30000, rate: 0.057 }] },
  "KY": { name: "Kentucky", type: "flat", rate: 0.04 },
  "LA": { name: "Louisiana", type: "progressive", brackets: [{ threshold: 0, rate: 0.0185 }, { threshold: 12500, rate: 0.035 }, { threshold: 50000, rate: 0.0425 }] },
  "ME": { name: "Maine", type: "progressive", brackets: [{ threshold: 0, rate: 0.058 }, { threshold: 26050, rate: 0.0675 }, { threshold: 61600, rate: 0.0715 }] },
  "MD": { name: "Maryland", type: "progressive", brackets: [{ threshold: 0, rate: 0.02 }, { threshold: 1000, rate: 0.03 }, { threshold: 2000, rate: 0.04 }, { threshold: 3000, rate: 0.0475 }, { threshold: 100000, rate: 0.05 }, { threshold: 125000, rate: 0.0525 }, { threshold: 150000, rate: 0.055 }, { threshold: 250000, rate: 0.0575 }] },
  "MA": { name: "Massachusetts", type: "flat", rate: 0.05 },
  "MI": { name: "Michigan", type: "flat", rate: 0.0425 },
  "MN": { name: "Minnesota", type: "progressive", brackets: [{ threshold: 0, rate: 0.0535 }, { threshold: 30070, rate: 0.068 }, { threshold: 98760, rate: 0.0785 }, { threshold: 184810, rate: 0.0985 }] },
  "MS": { name: "Mississippi", type: "progressive", brackets: [{ threshold: 0, rate: 0 }, { threshold: 10000, rate: 0.05 }] },
  "MO": { name: "Missouri", type: "progressive", brackets: [{ threshold: 0, rate: 0 }, { threshold: 1207, rate: 0.02 }, { threshold: 2414, rate: 0.025 }, { threshold: 3621, rate: 0.03 }, { threshold: 4828, rate: 0.035 }, { threshold: 6035, rate: 0.04 }, { threshold: 7242, rate: 0.045 }, { threshold: 8449, rate: 0.0495 }] },
  "MT": { name: "Montana", type: "progressive", brackets: [{ threshold: 0, rate: 0.047 }, { threshold: 20500, rate: 0.059 }] },
  "NE": { name: "Nebraska", type: "progressive", brackets: [{ threshold: 0, rate: 0.0246 }, { threshold: 3700, rate: 0.0351 }, { threshold: 22170, rate: 0.0501 }, { threshold: 35000, rate: 0.0584 }] },
  "NV": { name: "Nevada", type: "none" },
  "NH": { name: "New Hampshire", type: "none" },
  "NJ": { name: "New Jersey", type: "progressive", brackets: [{ threshold: 0, rate: 0.014 }, { threshold: 20000, rate: 0.0175 }, { threshold: 35000, rate: 0.035 }, { threshold: 40000, rate: 0.05525 }, { threshold: 75000, rate: 0.0637 }, { threshold: 500000, rate: 0.0897 }, { threshold: 1000000, rate: 0.1075 }] },
  "NM": { name: "New Mexico", type: "progressive", brackets: [{ threshold: 0, rate: 0.011 }, { threshold: 5500, rate: 0.033 }, { threshold: 11000, rate: 0.044 }, { threshold: 16000, rate: 0.059 }] },
  "NY": { name: "New York", type: "progressive", brackets: [{ threshold: 0, rate: 0.04 }, { threshold: 8500, rate: 0.045 }, { threshold: 11700, rate: 0.0525 }, { threshold: 13900, rate: 0.0585 }, { threshold: 21400, rate: 0.0625 }, { threshold: 80650, rate: 0.0685 }, { threshold: 215400, rate: 0.0965 }, { threshold: 1077550, rate: 0.103 }, { threshold: 5000000, rate: 0.109 }] },
  "NC": { name: "North Carolina", type: "flat", rate: 0.045 },
  "ND": { name: "North Dakota", type: "progressive", brackets: [{ threshold: 0, rate: 0 }, { threshold: 44725, rate: 0.0195 }, { threshold: 108300, rate: 0.025 }] },
  "OH": { name: "Ohio", type: "progressive", brackets: [{ threshold: 0, rate: 0 }, { threshold: 26050, rate: 0.02765 }, { threshold: 46100, rate: 0.03226 }, { threshold: 92150, rate: 0.0375 }, { threshold: 115300, rate: 0.0399 }] },
  "OK": { name: "Oklahoma", type: "progressive", brackets: [{ threshold: 0, rate: 0.0025 }, { threshold: 1000, rate: 0.0075 }, { threshold: 2500, rate: 0.0175 }, { threshold: 3750, rate: 0.0275 }, { threshold: 4900, rate: 0.0375 }, { threshold: 7200, rate: 0.0475 }] },
  "OR": { name: "Oregon", type: "progressive", brackets: [{ threshold: 0, rate: 0.0475 }, { threshold: 4050, rate: 0.0675 }, { threshold: 10150, rate: 0.0875 }, { threshold: 125000, rate: 0.099 }] },
  "PA": { name: "Pennsylvania", type: "flat", rate: 0.0307 },
  "RI": { name: "Rhode Island", type: "progressive", brackets: [{ threshold: 0, rate: 0.0375 }, { threshold: 73450, rate: 0.0475 }, { threshold: 166950, rate: 0.0599 }] },
  "SC": { name: "South Carolina", type: "progressive", brackets: [{ threshold: 0, rate: 0.03 }, { threshold: 3200, rate: 0.064 }] },
  "SD": { name: "South Dakota", type: "none" },
  "TN": { name: "Tennessee", type: "none" },
  "TX": { name: "Texas", type: "none" },
  "UT": { name: "Utah", type: "flat", rate: 0.0465 },
  "VT": { name: "Vermont", type: "progressive", brackets: [{ threshold: 0, rate: 0.0335 }, { threshold: 45400, rate: 0.066 }, { threshold: 110050, rate: 0.076 }, { threshold: 229550, rate: 0.0875 }] },
  "VA": { name: "Virginia", type: "progressive", brackets: [{ threshold: 0, rate: 0.02 }, { threshold: 3000, rate: 0.03 }, { threshold: 5000, rate: 0.05 }, { threshold: 17000, rate: 0.0575 }] },
  "WA": { name: "Washington", type: "none" },
  "WV": { name: "West Virginia", type: "progressive", brackets: [{ threshold: 0, rate: 0.03 }, { threshold: 10000, rate: 0.04 }, { threshold: 25000, rate: 0.045 }, { threshold: 40000, rate: 0.06 }, { threshold: 60000, rate: 0.065 }] },
  "WI": { name: "Wisconsin", type: "progressive", brackets: [{ threshold: 0, rate: 0.035 }, { threshold: 13810, rate: 0.044 }, { threshold: 27610, rate: 0.053 }, { threshold: 304170, rate: 0.0765 }] },
  "WY": { name: "Wyoming", type: "none" },
};

const federalBracketsSingle = [
  { threshold: 0, rate: 0.10 },
  { threshold: 11925, rate: 0.12 },
  { threshold: 48475, rate: 0.22 },
  { threshold: 103350, rate: 0.24 },
  { threshold: 197300, rate: 0.32 },
  { threshold: 250525, rate: 0.35 },
  { threshold: 626350, rate: 0.37 },
];

const federalBracketsMarried = [
  { threshold: 0, rate: 0.10 },
  { threshold: 23850, rate: 0.12 },
  { threshold: 96950, rate: 0.22 },
  { threshold: 206700, rate: 0.24 },
  { threshold: 394600, rate: 0.32 },
  { threshold: 501050, rate: 0.35 },
  { threshold: 751600, rate: 0.37 },
];

const standardDeduction = {
  single: 15400,
  married: 30800
};

// --- HELPER COMPONENTS ---

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-slate-200 text-xs rounded-lg shadow-2xl border border-white/10 pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function PayrollCalculator() {
  const [salary, setSalary] = useState<number>(85000);
  const [frequency, setFrequency] = useState<"weekly" | "bi-weekly" | "monthly">("monthly");
  const [workState, setWorkState] = useState<string>("");
  const [filingStatus, setFilingStatus] = useState<"single" | "married">("single");
  const [preTaxDeductions, setPreTaxDeductions] = useState<number>(0);
  // const [allowances, setAllowances] = useState<number>(0);
  
  const [localTaxes, setLocalTaxes] = useState(false);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Local storage for state persistence
  useEffect(() => {
    const savedState = localStorage.getItem("cw_payroll_state");
    if (savedState && states[savedState]) {
      setWorkState(savedState);
    }
  }, []);

  const handleStateSelect = (abbr: string) => {
    setWorkState(abbr);
    setIsDropdownOpen(false);
    localStorage.setItem("cw_payroll_state", abbr);
  };

  const filteredStates = useMemo(() => {
    return Object.entries(states).filter(([abbr, data]) => 
      data.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      abbr.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const calculations = useMemo(() => {
    // 1. Adjusted Gross Income (AGI) after pre-tax
    const taxableSalary = Math.max(0, salary - preTaxDeductions);
    
    // 2. Federal Tax
    const ded = filingStatus === "single" ? standardDeduction.single : standardDeduction.married;
    const brackets = filingStatus === "single" ? federalBracketsSingle : federalBracketsMarried;
    const federalTaxable = Math.max(0, taxableSalary - ded);
    
    let fedTax = 0;
    for (let i = 0; i < brackets.length; i++) {
        const current = brackets[i];
        const next = brackets[i + 1];
        const amountInRange = next ? Math.min(federalTaxable, next.threshold) - current.threshold : federalTaxable - current.threshold;
        if (amountInRange > 0) {
            fedTax += amountInRange * current.rate;
        } else break;
    }

    // 3. FICA
    const socialSecurity = Math.min(taxableSalary, 176100) * 0.062; // Wage base 2026 estimate
    const medicare = taxableSalary * 0.0145;
    const fica = socialSecurity + medicare;

    // 4. State Tax
    let stateTax = 0;
    const stateData = states[workState];
    if (stateData) {
        if (stateData.type === "flat") {
            stateTax = taxableSalary * (stateData.rate || 0);
        } else if (stateData.type === "progressive" && stateData.brackets) {
            for (let i = 0; i < stateData.brackets.length; i++) {
                const current = stateData.brackets[i];
                const next = stateData.brackets[i + 1];
                const amountInRange = next ? Math.min(taxableSalary, next.threshold) - current.threshold : taxableSalary - current.threshold;
                if (amountInRange > 0) {
                    stateTax += amountInRange * current.rate;
                } else break;
            }
        }
    }

    // 5. Local Taxes (NY/CA estimation)
    let localTaxVal = 0;
    if (localTaxes) {
       if (workState === "NY") localTaxVal = taxableSalary * 0.03876; // NYC estimate
       if (workState === "CA") localTaxVal = taxableSalary * 0.015; // SF/Cities estimate
    }

    const totalAnnualDeductions = fedTax + fica + stateTax + localTaxVal;
    const annualNet = taxableSalary - totalAnnualDeductions;

    const divisor = frequency === "weekly" ? 52 : frequency === "bi-weekly" ? 26 : 12;

    return {
      gross: taxableSalary / divisor,
      fedTax: fedTax / divisor,
      stateTax: (stateTax + localTaxVal) / divisor,
      fica: fica / divisor,
      deductions: (totalAnnualDeductions + preTaxDeductions) / divisor,
      net: annualNet / divisor,
      annualNet
    };
  }, [salary, frequency, workState, filingStatus, preTaxDeductions, localTaxes]);

  return (
    <main className="min-h-screen bg-[#060B13] font-sans selection:bg-cyan-200 selection:text-navy text-white">
      <Navbar />

      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden z-10">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-cyan-400/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-12 flex justify-center">
             <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Resources", href: "/guides" }, { label: "Payroll Calculator" }]} variant="dark" />
          </div>

          <div className="lg:flex items-start gap-12">
            {/* --- INPUT PANEL --- */}
            <div className="lg:w-[45%] mb-12 lg:mb-0">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="inline-block bg-white/5 text-cyan-400 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-8"
               >
                 Deel-Grade Accuracy
               </motion.div>
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-8">
                 Precision <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Net Pay</span> Analyzer.
               </h1>
               
               <div className="bg-[#0F1724] border border-white/10 rounded-[32px] p-8 lg:p-10 shadow-2xl relative">
                  <div className="space-y-8">
                     {/* Salary & Frequency */}
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                             Annual Salary 
                             <Tooltip text="Your total yearly gross pay before any taxes or personal deductions."><span className="cursor-help opacity-40">ⓘ</span></Tooltip>
                           </label>
                           <div className="relative group">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                              <input 
                                 type="number" 
                                 value={salary} 
                                 onChange={(e) => setSalary(Math.max(0, Number(e.target.value)))}
                                 className="w-full bg-[#1A2534] border border-white/5 rounded-xl pl-9 pr-4 py-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 focus:bg-[#1C2C42]" 
                              />
                           </div>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Pay Cycle</label>
                           <div className="bg-[#1A2534] p-1 rounded-xl flex border border-white/5">
                              {["weekly", "bi-weekly", "monthly"].map((f) => (
                                 <button 
                                    key={f}
                                    onClick={() => setFrequency(f as "weekly" | "bi-weekly" | "monthly")}
                                    className={`flex-1 py-3 px-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                       frequency === f 
                                       ? "bg-blue-600 text-white shadow-lg" 
                                       : "text-slate-500 hover:text-white"
                                    }`}
                                 >
                                    {f.replace("-", "")}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>

                     {/* State Selection */}
                     <div className="relative">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center justify-between">
                           Work State
                           {!workState && <span className="text-red-500 text-[8px] animate-pulse">Required *</span>}
                        </label>
                        <button 
                           onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                           className={`w-full flex items-center justify-between bg-[#1A2534] border rounded-xl px-5 py-4 text-left font-bold transition-all ${
                              workState ? "border-white/5 text-white" : "border-red-500/30 text-slate-500"
                           } ${isDropdownOpen ? "border-blue-500/50 ring-2 ring-blue-500/10" : ""}`}
                        >
                           {workState ? states[workState].name : "Select your state..."}
                           <svg className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        <AnimatePresence>
                           {isDropdownOpen && (
                              <motion.div 
                                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                 animate={{ opacity: 1, y: 0, scale: 1 }}
                                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                 className="absolute z-[100] mt-2 w-full bg-[#1C2C42] border border-white/10 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl"
                              >
                                 <div className="p-3 border-b border-white/10">
                                    <input 
                                       autoFocus
                                       type="text" 
                                       placeholder="Search 50 states..." 
                                       value={searchTerm}
                                       onChange={(e) => setSearchTerm(e.target.value)}
                                       className="w-full bg-[#24344D] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                    />
                                 </div>
                                 <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                                    {filteredStates.map(([abbr, data]) => (
                                       <button 
                                          key={abbr}
                                          onClick={() => handleStateSelect(abbr)}
                                          className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between group"
                                       >
                                          <span className="text-sm font-semibold text-slate-300 group-hover:text-white">{data.name}</span>
                                          <span className="text-[10px] font-mono text-slate-500">{abbr}</span>
                                       </button>
                                    ))}
                                    {filteredStates.length === 0 && (
                                       <div className="py-8 text-center text-slate-500 text-xs font-bold">No states match your search</div>
                                    )}
                                 </div>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>

                     {/* Filing Status & Pre-Tax */}
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Filing Status</label>
                           <div className="bg-[#1A2534] p-1 rounded-xl flex border border-white/5">
                              {["single", "married"].map((s) => (
                                 <button 
                                    key={s}
                                    onClick={() => setFilingStatus(s as "single" | "married")}
                                    className={`flex-1 py-3 px-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                       filingStatus === s 
                                       ? "bg-white text-[#0A1628] shadow-lg" 
                                       : "text-slate-500 hover:text-white"
                                    }`}
                                 >
                                    {s}
                                 </button>
                              ))}
                           </div>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                             Pre-tax Ded.
                             <Tooltip text="Contributions like 401(k), HSA, or health insurance premiums that lower your taxable income."><span className="cursor-help opacity-40">ⓘ</span></Tooltip>
                           </label>
                           <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                              <input 
                                 type="number" 
                                 value={preTaxDeductions} 
                                 onChange={(e) => setPreTaxDeductions(Math.max(0, Number(e.target.value)))}
                                 className="w-full bg-[#1A2534] border border-white/5 rounded-xl pl-9 pr-4 py-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600" 
                              />
                           </div>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-6 items-center">
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                             Local Taxes
                             <Tooltip text="Estimate city-specific income taxes (e.g., NYC, San Francisco). Only applies if your state has local income tax."><span className="cursor-help opacity-40">ⓘ</span></Tooltip>
                           </label>
                           <button 
                              onClick={() => setLocalTaxes(!localTaxes)}
                              className={`w-full h-14 rounded-xl border flex items-center px-4 transition-all ${
                                 localTaxes 
                                 ? "bg-blue-600/10 border-blue-500/50 text-white" 
                                 : "bg-[#1A2534] border-white/5 text-slate-500"
                              }`}
                           >
                              <div className={`w-8 h-4 rounded-full relative transition-colors mr-3 ${localTaxes ? "bg-blue-500" : "bg-slate-700"}`}>
                                 <motion.div 
                                    animate={{ x: localTaxes ? 16 : 2 }}
                                    className="absolute top-1 w-3 h-2 bg-white rounded-full shadow-sm"
                                 />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest">{localTaxes ? "Enabled" : "Disabled"}</span>
                           </button>
                        </div>
                        <div className="pt-6">
                           <Link href="/pricing" className="block text-[10px] font-black text-blue-400 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em] text-center">
                              Upgrade for Auto-Nexus &rarr;
                           </Link>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-8 flex items-center gap-4 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">🛡️</div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                     Your data stays local and is never stored. Calculations are based on projected <span className="text-white font-bold">2026 U.S. Federal and State Tax Codes</span>.
                  </p>
               </div>
            </div>

            {/* --- RESULTS PANEL --- */}
            <div className="lg:w-[55%] sticky top-32">
               <motion.div 
                  layout
                  className="bg-[#0F1724] border border-white/10 rounded-[40px] p-10 lg:p-14 shadow-[0_48px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group"
               >
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -z-10 group-hover:bg-blue-600/10 transition-colors duration-1000" />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                     <div>
                        <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 flex items-center gap-2">
                           Your Estimated Take-Home 
                           <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-md text-[8px] border border-cyan-500/20">{frequency}</span>
                        </div>
                        <div className="text-6xl md:text-7xl font-black text-white tracking-tighter transition-all duration-300">
                           ${calculations.net.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">Annual Savings</div>
                        <div className="text-2xl font-black text-emerald-400 bg-emerald-400/5 px-4 py-2 rounded-2xl border border-emerald-400/10">
                           ${calculations.annualNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                     </div>
                  </div>

                  {/* Chart Visualization */}
                  <div className="mb-12">
                     <div className="flex justify-between items-end mb-4 pr-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tax Impact Breakdown</span>
                        <span className="text-[10px] font-mono text-slate-500">{( (calculations.deductions / calculations.gross) * 100).toFixed(1)}% Tax Burden</span>
                     </div>
                     <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                        <div style={{ width: `${(calculations.net / calculations.gross) * 100}%` }} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000" />
                        <div style={{ width: `${(calculations.fedTax / calculations.gross) * 100}%` }} className="h-full bg-indigo-500/60 transition-all duration-1000" />
                        <div style={{ width: `${(calculations.stateTax / calculations.gross) * 100}%` }} className="h-full bg-cyan-400/80 transition-all duration-1000" />
                        <div style={{ width: `${(calculations.fica / calculations.gross) * 100}%` }} className="h-full bg-slate-600 transition-all duration-1000" />
                     </div>
                     <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                           <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Take Home
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                           <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/60" /> Federal
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                           <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400/80" /> State
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                           <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" /> FICA
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4 pt-4">
                     <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-xs">💸</div>
                           <span className="font-bold text-slate-400 text-sm">Gross Pay</span>
                        </div>
                        <span className="text-xl font-black text-white">${calculations.gross.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                     </div>
                     
                     <div className="flex items-center justify-between p-5 border border-white/5 rounded-2xl hover:bg-white/5 transition-colors group/row">
                        <div className="flex items-center gap-3">
                           <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">F</div>
                           <span className="font-bold text-slate-400 text-sm flex items-center gap-2">
                              Federal Tax
                              <Tooltip text="Federal income tax used to fund government services. Calculated after standard deduction."><span className="cursor-help opacity-40">ⓘ</span></Tooltip>
                           </span>
                        </div>
                        <span className="text-lg font-bold text-slate-300">-${calculations.fedTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                     </div>

                     <div className={`flex items-center justify-between p-5 border border-white/5 rounded-2xl transition-colors group/row ${calculations.stateTax > 0 ? "hover:bg-cyan-500/5" : "bg-emerald-500/5 border-emerald-500/10"}`}>
                        <div className="flex items-center gap-3">
                           <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${calculations.stateTax > 0 ? "bg-cyan-500/20 text-cyan-400" : "bg-emerald-500/20 text-emerald-400"}`}>S</div>
                           <span className="font-bold text-slate-400 text-sm flex items-center gap-2">
                              State Tax
                              <Tooltip text="State-specific income tax. Rates vary based on your selected work state."><span className="cursor-help opacity-40">ⓘ</span></Tooltip>
                           </span>
                        </div>
                        {calculations.stateTax > 0 ? (
                           <motion.span 
                              key={workState}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-lg font-bold text-cyan-400"
                           >
                              -${calculations.stateTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                           </motion.span>
                        ) : (
                           <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              No State Tax Applied
                           </span>
                        )}
                     </div>

                     <div className="flex items-center justify-between p-5 border border-white/5 rounded-2xl hover:bg-white/5 transition-colors group/row">
                        <div className="flex items-center gap-3">
                           <div className="w-5 h-5 rounded-md bg-slate-600/20 text-slate-400 flex items-center justify-center text-[10px]">FI</div>
                           <span className="font-bold text-slate-400 text-sm flex items-center gap-2">
                              FICA
                              <Tooltip text="Federal Insurance Contributions Act tax fund for Social Security (6.2%) and Medicare (1.45%)."><span className="cursor-help opacity-40">ⓘ</span></Tooltip>
                           </span>
                        </div>
                        <span className="text-lg font-bold text-slate-400">-${calculations.fica.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                     </div>
                  </div>

                  <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-3xl text-center space-y-6">
                     <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                        Calculators only estimate. CircleWorks executes legally-perfect payroll for teams across all 50 states automatically.
                     </p>
                     <Link href="/pricing" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0A1628] font-black rounded-xl hover:scale-105 transition-all shadow-xl">
                        Unlock Native Payroll &rarr;
                     </Link>
                  </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* --- COMPARISON SECTION --- */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 relative">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-blue-500 to-transparent opacity-30" />
         
         <div className="text-center mb-24">
            <h2 className="text-4xl font-black text-white mb-6">Built for U.S. Business.</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
               CircleWorks goes beyond math. We are a native U.S. registration engine that handles everything from nexus to worker&apos;s comp.
            </p>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
               { t: "Nexus Management", d: "We monitor employee movement across state lines and trigger tax registrations automatically.", i: "🛡️" },
               { t: "Automated Filings", d: "Federal, state, and local taxes are filed and paid to 20,000+ agencies on your behalf.", i: "📦" },
               { t: "Direct Deposit", d: "Same-day or next-day direct deposit for U.S. W-2 employees. Global for contractors.", i: "⚡" },
               { t: "Benefits Sync", d: "Sync health premiums and 401(k) contributions directly with top-tier providers.", i: "🏥" }
            ].map((f, i) => (
               <div key={i} className="p-8 bg-[#0F1724] border border-white/5 rounded-[32px] hover:border-blue-500/30 transition-all group overflow-hidden relative">
                  <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-600/5 rounded-full blur-[40px] group-hover:bg-blue-600/10 transition-colors" />
                  <div className="text-4xl mb-8 group-hover:scale-110 transition-transform origin-left">{f.i}</div>
                  <h4 className="text-xl font-bold text-white mb-4">{f.t}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.d}</p>
               </div>
            ))}
         </div>
      </section>

      <ResourceCTA 
         title="Stop guessing your payroll." 
         description="Join 1,000+ fast-growing U.S. companies who run CircleWorks for perfect multi-state compliance."
      />

      <Footer />
      
      <style jsx global>{`
        input[type='number']::-webkit-inner-spin-button, 
        input[type='number']::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </main>
  );
}
