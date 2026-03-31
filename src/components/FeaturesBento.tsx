"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign, UserPlus, Heart, Clock, Shield, BarChart2,
  CheckCircle2, Activity, Eye
} from "lucide-react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";

// --- Demos & Visuals ---

const PayrollDemo = () => {
  const states = ["Draft", "Calculating", "Paid"];
  const [activeState, setActiveState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveState((prev) => (prev + 1) % states.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-2 mt-6 bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-inner">
      {states.map((st, i) => (
        <div key={st} className={`flex items-center justify-between p-2.5 rounded-lg transition-colors duration-500 ${activeState === i ? 'bg-blue-600/20 border border-blue-500/50' : 'bg-transparent border border-transparent'}`}>
           <span className={`text-[14px] font-bold tracking-wide ${activeState === i ? 'text-blue-400' : 'text-slate-500'}`}>{st}</span>
           {i < activeState || (activeState === 2 && i === 2) ? (
             <CheckCircle2 size={18} className="text-emerald-500" />
           ) : activeState === i ? (
             <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
           ) : (
             <div className="w-4 h-4 rounded-full border-2 border-slate-700" />
           )}
        </div>
      ))}
    </div>
  );
};

const AtsPipeline = () => (
  <div className="flex flex-col justify-center mt-6 h-full gap-1">
    <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-[13px] font-bold text-center shadow-sm">Applied</div>
    <div className="w-[2px] h-3 bg-slate-200 mx-auto" />
    <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200 text-blue-700 text-[13px] font-bold text-center shadow-sm relative z-10 w-[105%] -ml-[2.5%]">Screened</div>
    <div className="w-[2px] h-3 bg-slate-200 mx-auto" />
    <div className="opacity-60 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[13px] font-bold text-center">Offered</div>
    <div className="w-[2px] h-3 bg-slate-200 mx-auto" />
    <div className="opacity-40 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-700 text-[13px] font-bold text-center">Hired</div>
  </div>
);

const Benefits2x2 = () => (
  <div className="grid grid-cols-2 gap-3 mt-6 h-full pb-2">
    <div className="flex flex-col items-center justify-center bg-rose-50 text-rose-600 rounded-xl border border-rose-100 p-3 shadow-sm hover:scale-105 transition-transform">
      <Heart size={24} /> <span className="text-[11px] font-bold mt-1.5 uppercase tracking-wider">Health</span>
    </div>
    <div className="flex flex-col items-center justify-center bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-100 p-3 shadow-sm hover:scale-105 transition-transform">
      <Eye size={24} /> <span className="text-[11px] font-bold mt-1.5 uppercase tracking-wider">Vision</span>
    </div>
    <div className="flex flex-col items-center justify-center bg-amber-50 text-amber-600 rounded-xl border border-amber-100 p-3 shadow-sm hover:scale-105 transition-transform">
      <Activity size={24} /> <span className="text-[11px] font-bold mt-1.5 uppercase tracking-wider">Dental</span>
    </div>
    <div className="flex flex-col items-center justify-center bg-purple-50 text-purple-600 rounded-xl border border-purple-100 p-3 shadow-sm hover:scale-105 transition-transform">
      <DollarSign size={24} /> <span className="text-[11px] font-bold mt-1.5 uppercase tracking-wider">401k</span>
    </div>
  </div>
);

const ClockDemo = () => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if(!running) return;
    const t = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const mins = Math.floor(time / 60).toString().padStart(2, '0');
  const secs = (time % 60).toString().padStart(2, '0');

  return (
    <div className="mt-8 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 gap-4 shadow-inner">
      <div className="text-4xl font-mono font-black text-slate-800 tracking-widest bg-white px-4 py-2 border border-slate-200 shadow-sm rounded-lg">
        08:{mins}:{secs}
      </div>
      <button 
        onClick={() => setRunning(!running)} 
        className={`px-6 py-2 rounded-full text-[14px] font-bold text-white transition-all w-full shadow border focus:outline-none 
          ${running ? 'bg-rose-500 border-rose-600 shadow-rose-500/30' : 'bg-emerald-500 border-emerald-600 shadow-emerald-500/30 active:scale-95'}`}
      >
        {running ? 'Clock Out' : 'Clock In'}
      </button>
    </div>
  );
};

const ShieldDemo = () => (
   <div className="mt-8 flex-1 flex flex-col items-center justify-center relative py-6">
     <div className="absolute w-32 h-32 rounded-full border border-emerald-500/30 animate-[ping_3s_infinite]" />
     <div className="absolute w-24 h-24 rounded-full border border-emerald-500/50 animate-[ping_2s_infinite]" />
     <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] z-10 relative">
       <Shield className="text-emerald-500 fill-emerald-500/20" size={40} />
       <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
         <CheckCircle2 className="text-white" size={14} />
       </div>
     </div>
     <div className="bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-full px-5 py-2 mt-6 text-[12px] font-black tracking-widest text-emerald-600 z-20 relative">
       ALL 50 STATES AUTOMATED
     </div>
   </div>
);

const data = [
  { name: "Jan", amt: 60000 },
  { name: "Feb", amt: 85000 },
  { name: "Mar", amt: 120000 },
  { name: "Apr", amt: 155000 },
  { name: "May", amt: 195000 },
];
const AnalyticsChart = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-48 w-full mt-6 bg-slate-100/50 rounded-xl animate-pulse" />;
  }

  return (
    <div className="h-48 w-full mt-6 relative" style={{ minHeight: '192px' }}>
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data}>
            <Bar dataKey="amt" radius={[6, 6, 0, 0]} animationDuration={2000} fill="#1D4ED8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2 text-[12px] font-bold text-slate-400 tracking-wider">LABOR OVERHEAD TRENDS</div>
    </div>
  );
};


export default function FeaturesSection() {
  const cardClass = "rounded-2xl border border-gray-200 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-300 hover:scale-[1.01] flex flex-col bg-white overflow-hidden";

  return (
    <section className="bg-slate-50 py-24 w-full">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-600 text-[13px] font-black uppercase tracking-[0.2em] mb-4">THE PLATFORM</span>
          <h2 className="text-[36px] md:text-[48px] font-black text-slate-900 leading-tight mb-5 tracking-tight">
            Everything your HR team needs &mdash; one platform.
          </h2>
          <p className="text-[18px] md:text-[20px] text-slate-500 font-medium">
            Replace 7 tools. One login. One source of truth.
          </p>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
          
          {/* Row 1: Card A (col-span-2) */}
          <div className={`${cardClass} lg:col-span-2 bg-[#0A1628] hover:border-blue-500 border-slate-800`}>
            <div className="flex items-start justify-between">
              <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
                <DollarSign size={24} />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-black tracking-wider uppercase border border-emerald-500/30">P0 Core</span>
            </div>
            <h3 className="text-white text-[24px] font-bold mt-6">Run Payroll in 3 Clicks</h3>
            <p className="text-slate-400 text-[15px] mt-2 mb-2 leading-relaxed">
              All 50 states. Auto tax filing. Direct deposit in minutes. We handle the math so you don't have to.
            </p>
            <PayrollDemo />
          </div>

          {/* Row 1: Card B (col-span-1) */}
          <div className={cardClass}>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 w-fit">
              <UserPlus size={24} />
            </div>
            <h3 className="text-slate-900 text-[20px] font-bold mt-6">Hire to First Day</h3>
            <p className="text-slate-500 text-[14px] mt-2 leading-relaxed">
              Integrated ATS & Onboarding pipelines.
            </p>
            <AtsPipeline />
          </div>

          {/* Row 1: Card C (col-span-1) */}
          <div className={cardClass}>
            <div className="p-3 bg-rose-50 rounded-xl text-rose-500 w-fit">
              <Heart size={24} />
            </div>
            <h3 className="text-slate-900 text-[20px] font-bold mt-6">Benefits That Compete</h3>
            <p className="text-slate-500 text-[14px] mt-2 leading-relaxed">
              Enterprise-tier options for startups.
            </p>
            <Benefits2x2 />
          </div>

          {/* Row 2: Card D (col-span-1) */}
          <div className={cardClass}>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-500 w-fit">
              <Clock size={24} />
            </div>
            <h3 className="text-slate-900 text-[20px] font-bold mt-6">Time & Attendance</h3>
            <p className="text-slate-500 text-[14px] mt-2 leading-relaxed">
              Syncs natively to payroll batches.
            </p>
            <ClockDemo />
          </div>

          {/* Row 2: Card E (col-span-1) */}
          <div className={cardClass}>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500 w-fit">
              <Shield size={24} />
            </div>
            <h3 className="text-slate-900 text-[20px] font-bold mt-6">Tax & Compliance</h3>
            <p className="text-slate-500 text-[14px] mt-2 leading-relaxed">
              Guaranteed flawless filings everywhere.
            </p>
            <ShieldDemo />
          </div>

          {/* Row 2: Card F (col-span-2) */}
          <div className={`${cardClass} lg:col-span-2 relative`}>
            {/* Absolute decorative gradient */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
            
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 w-fit relative z-10">
              <BarChart2 size={24} />
            </div>
            <h3 className="text-slate-900 text-[24px] font-bold mt-6 relative z-10">People Analytics</h3>
            <p className="text-slate-500 text-[15px] mt-2 mb-2 leading-relaxed relative z-10 max-w-md">
              Custom labor overhead trends, EEO-1 reporting, and powerful visualization metrics straight from your core data source.
            </p>
            <AnalyticsChart />
          </div>

        </div>
      </div>
    </section>
  );
}
