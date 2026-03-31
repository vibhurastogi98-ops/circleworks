"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Search, CheckCircle2, Heart, Clock, Loader2, ArrowRight,
  User, Shield, Activity, DollarSign
} from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from "recharts";

// --- Tab Apps Components ---

const TabPayroll = () => {
  const [status, setStatus] = useState<"draft" | "processing" | "paid">("draft");
  
  const employees = [
    { name: "Sarah Smith", role: "Engineering", amount: "$4,250.00" },
    { name: "Michael Chen", role: "Design", amount: "$3,800.00" },
    { name: "Emma Watson", role: "Marketing", amount: "$3,100.00" },
    { name: "David Lee", role: "Sales", amount: "$4,500.00" },
    { name: "Alex Johnson", role: "Support", amount: "$2,900.00" },
  ];

  const handleRun = () => {
    if (status !== "draft") return;
    setStatus("processing");
    setTimeout(() => {
      setStatus("paid");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F172A] p-6 rounded-b-xl border border-slate-700/50 shadow-inner">
      <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4">
        <div>
          <h3 className="text-white text-[18px] font-bold">Bi-Weekly Run &mdash; Q4-02</h3>
          <p className="text-slate-400 text-[13px] mt-1">Total est: $18,550.00</p>
        </div>
        <button 
          onClick={handleRun}
          disabled={status !== "draft"}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-[14px] transition-all
            ${status === "draft" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105" : 
              status === "processing" ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : 
              "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 cursor-default"}`}
        >
          {status === "draft" && "Run Payroll"}
          {status === "processing" && <><Loader2 size={16} className="animate-spin" /> Processing...</>}
          {status === "paid" && <><CheckCircle2 size={16} /> Paid ✓</>}
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col gap-3">
        {employees.map((emp, i) => (
          <div key={i} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
                {emp.name.charAt(0)}
              </div>
              <div>
                <div className="text-white text-[14px] font-bold">{emp.name}</div>
                <div className="text-slate-400 text-[12px]">{emp.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-white font-mono text-[14px]">{emp.amount}</div>
              <div className="w-24 flex justify-end">
                {status === "draft" && <span className="px-2.5 py-1 bg-slate-700/50 text-slate-400 text-[11px] rounded-md font-bold uppercase">Draft</span>}
                {status === "processing" && <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-[11px] rounded-md font-bold uppercase animate-pulse">Calculating</span>}
                {status === "paid" && (
                   <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: i * 0.1 }}
                    className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-[11px] rounded-md font-bold uppercase flex items-center gap-1"
                   >
                     Paid <CheckCircle2 size={12} />
                   </motion.span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TabEmployees = () => {
  const [search, setSearch] = useState("");
  const allEmployees = [
    { name: "John Doe", role: "CEO", dept: "Executive" },
    { name: "Sarah Smith", role: "Senior Engineer", dept: "Engineering" },
    { name: "Michael Chen", role: "Product Designer", dept: "Design" },
    { name: "Emma Watson", role: "Marketing Director", dept: "Marketing" },
    { name: "David Lee", role: "Account Executive", dept: "Sales" },
    { name: "Julia Roberts", role: "HR Manager", dept: "People" },
  ];

  const filtered = allEmployees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-[#0F172A] p-6 rounded-b-xl border border-slate-700/50 shadow-inner">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search directory (e.g., 'Sarah')..." 
          className="w-full bg-[#1E293B] border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder-slate-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
        <AnimatePresence>
          {filtered.map((emp) => (
            <motion.div 
              key={emp.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black shadow-md">
                {emp.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-white text-[15px] font-bold">{emp.name}</span>
                <span className="text-slate-400 text-[13px]">{emp.role} &middot; {emp.dept}</span>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12 text-slate-500">
              No employees found matching "{search}"
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TabBenefits = () => {
  const [selectedPlan, setSelectedPlan] = useState("Premium");
  const plans = [
    { title: "Basic HSA", price: "$0 /mo", cover: "80% coverage", desc: "High deductible, HSA eligible", icon: Shield },
    { title: "Premium", price: "$49 /mo", cover: "90% coverage", desc: "Low deductible PPO network", icon: Heart },
    { title: "Enterprise", price: "$149 /mo", cover: "100% coverage", desc: "Zero deductible, world-class", icon: Activity },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0F172A] p-6 rounded-b-xl border border-slate-700/50 shadow-inner">
      <div className="mb-6 flex flex-col gap-2 border-b border-slate-700/50 pb-4">
        <h3 className="text-white text-[18px] font-bold">2026 Open Enrollment</h3>
        <p className="text-slate-400 text-[13px]">Step 1: Select your primary medical coverage plan.</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 h-[250px]">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.title;
          return (
            <div 
              key={plan.title}
              onClick={() => setSelectedPlan(plan.title)}
              className={`relative rounded-xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between
                ${isSelected 
                  ? "bg-blue-600/10 border-2 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]" 
                  : "bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80"}`}
            >
              <div className="flex flex-col gap-3">
                <plan.icon size={28} className={isSelected ? "text-blue-400" : "text-slate-400"} />
                <h4 className="text-white font-bold text-[16px]">{plan.title}</h4>
                <div className="text-[12px] text-slate-400 border-l-2 border-slate-600 pl-2">{plan.desc}</div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-col gap-1">
                <span className="text-white font-bold text-[18px]">{plan.price}</span>
                <span className="text-emerald-400 text-[12px] font-medium">{plan.cover}</span>
              </div>
              
              {isSelected && (
                <div className="absolute top-4 right-4 text-blue-500">
                  <CheckCircle2 size={24} className="fill-blue-500/20" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TabTime = () => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if(!running) return;
    const t = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const hrs = Math.floor(time / 3600).toString().padStart(2, '0');
  const mins = Math.floor((time%3600) / 60).toString().padStart(2, '0');
  const secs = (time % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col h-full bg-[#0F172A] p-6 rounded-b-xl border border-slate-700/50 shadow-inner items-center justify-center relative">
      <div className="absolute w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="bg-[#1E293B] border border-slate-700/80 p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-8 z-10 w-full max-w-sm">
        <div className="text-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[12px] mb-2">Current Shift</p>
          <div className="text-[56px] font-black text-white tracking-widest font-mono">
            {hrs}:{mins}:{secs}
          </div>
        </div>

        <button 
          onClick={() => setRunning(!running)} 
          className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-lg border relative overflow-hidden group
            ${running ? 'bg-rose-500/20 text-rose-500 border-rose-500/50 shadow-rose-900/20' : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/40 hover:bg-emerald-500'}`}
        >
          {running ? 'Clock Out' : 'Clock In Now'}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        </button>
      </div>
    </div>
  );
};

const TabReports = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const data = [
    { month: "Jan", cost: 120 },
    { month: "Feb", cost: 135 },
    { month: "Mar", cost: 130 },
    { month: "Apr", cost: 150 },
    { month: "May", cost: 165 },
    { month: "Jun", cost: 180 },
  ];

  if (!mounted) {
    return (
      <div className="flex flex-col h-full bg-[#0F172A] p-6 rounded-b-xl border border-slate-700/50 shadow-inner">
         <div className="w-48 h-8 bg-slate-700/40 rounded animate-pulse mb-6" />
         <div className="flex-1 w-full bg-slate-700/20 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0F172A] p-6 rounded-b-xl border border-slate-700/50 shadow-inner">
      <div className="mb-6 border-b border-slate-700/50 pb-4 flex justify-between items-end">
        <div>
          <h3 className="text-white text-[18px] font-bold">Labor Expenditures overhead</h3>
          <p className="text-slate-400 text-[13px] mt-1">Trail 6 Months (in Thousands)</p>
        </div>
        <div className="text-cyan-400 font-bold text-[24px]">+18.5% <span className="text-slate-500 text-[12px] font-medium block text-right">vs Last Year</span></div>
      </div>
      
      <div className="flex-1 w-full mt-4 pr-10 relative">
        <div className="absolute inset-0 w-full h-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={data}>
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                formatter={(value) => [`$${value}k`, "Total Cost"]}
              />
              <Bar dataKey="cost" radius={[6, 6, 0, 0]} animationDuration={1000}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === data.length - 1 ? "#06B6D4" : "#3B82F6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};


// --- Main Component ---

export default function DemoSection() {
  const tabsList = ["Payroll", "Employees", "Benefits", "Time", "Reports"];
  const [activeTab, setActiveTab] = useState(tabsList[0]);

  return (
    <section className="bg-[#0A1628] py-24 w-full relative overflow-hidden">
      
      {/* Background Decoratives */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1000px] mx-auto px-6 lg:px-8 relative z-10 flex flex-col items-center">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-[36px] md:text-[48px] font-black text-white leading-tight tracking-tight mb-4">
            See CircleWorks in Action
          </h2>
          <p className="text-[18px] md:text-[20px] text-slate-400 font-medium">
            No signup required. Explore live.
          </p>
        </div>

        {/* BROWSER FRAME MOCKUP */}
        <div className="w-full bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col shadow-blue-900/20">
          
          {/* Chrome Top Bar */}
          <div className="h-12 bg-[#0A1628] border-b border-slate-700/80 flex items-center justify-between px-4 relative z-20 shadow-md">
            
            {/* Traffic Lights */}
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500/80 border border-rose-500/50" />
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80 border border-amber-500/50" />
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 border border-emerald-500/50" />
            </div>

            {/* Nav Tabs */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-slate-900 border border-slate-700/80 rounded-full p-1 shadow-inner overflow-x-auto w-full md:w-auto max-w-[calc(100%-100px)]">
              {tabsList.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 sm:px-6 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 z-10
                    ${activeTab === tab ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-blue-600 rounded-full -z-10 shadow-md shadow-blue-500/40"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
            
            {/* Right Placeholder dummy block to balance traffic lights spacing */}
            <div className="w-[50px] hidden md:block" /> 
          </div>

          {/* DYNAMIC CONTENT AREA (Fixed Height Frame) */}
          <div className="h-[450px] sm:h-[400px] w-full relative bg-[#0F172A]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 w-full h-full"
              >
                {activeTab === "Payroll" && <TabPayroll />}
                {activeTab === "Employees" && <TabEmployees />}
                {activeTab === "Benefits" && <TabBenefits />}
                {activeTab === "Time" && <TabTime />}
                {activeTab === "Reports" && <TabReports />}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* CTA FOOTER */}
        <div className="mt-16 text-center flex flex-col gap-4">
          <Link 
            href="/signup"
            className="h-[56px] px-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-[16px] flex items-center justify-center gap-3 hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] hover:scale-[1.02] transition-all duration-300 mx-auto group w-fit"
          >
            Ready to see your data? Start your free trial
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-[12px] text-slate-500 font-medium tracking-wide">
            Note: All demo data is fictional. Your real data stays private.
          </p>
        </div>

      </div>
    </section>
  );
}
