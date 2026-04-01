"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Check, ChevronRight } from "lucide-react";

const logos = [
  "Acme Corp",
  "Globex",
  "Soylent",
  "Initech",
  "Umbrella",
  "Stark Ind",
];

// Double the array for seamless CSS marquee scroll
const marqueeLogos = [...logos, ...logos];

export default function HeroSection() {
  const [activeMockTab, setActiveMockTab] = React.useState("Dashboard");
  const line1 = "Run Payroll & HR".split(" ");
  const line2Part1 = "The ".split(" ");
  const line2Part2 = "American Way.".split(" ");

  const wordAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.6,
        ease: [0.2, 0.65, 0.3, 0.9] as const,
      },
    }),
  };

  return (
    <div className="relative min-h-screen bg-[#0A1628] overflow-hidden flex flex-col pt-32 pb-20">

      {/* --- BACKGROUND LAYERS --- */}
      {/* 1. Animated Gradient Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 mix-blend-screen">
        <div className="bg-mesh-1 absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/30 blur-[120px]" />
        <div className="bg-mesh-2 absolute top-[20%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-cyan-600/20 blur-[100px]" />
        <div className="bg-mesh-3 absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      {/* 2. Dot-Grid Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* 3. SVG Noise Texture */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03] z-0">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>


      {/* --- CONTENT --- */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">

        {/* EYEBROW */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-cyan-400 text-[12px] font-bold uppercase tracking-[0.2em] mb-4"
        >
          THE #1 PAYROLL & HR PLATFORM FOR CREATOR AGENCIES
        </motion.div>

        {/* H1 HEADER */}
        <h1 className="text-[36px] sm:text-[48px] md:text-[60px] font-black text-white leading-[1.1] tracking-tight mb-6">
          <div className="overflow-hidden flex flex-wrap sm:flex-nowrap justify-center gap-x-[0.25em] gap-y-0">
            <motion.span
              key="h1-1"
              custom={0}
              initial="hidden"
              animate="visible"
              variants={wordAnimation}
              className="inline-block"
            >
              Pay
            </motion.span>
            <motion.span
              key="h1-2"
              custom={1}
              initial="hidden"
              animate="visible"
              variants={wordAnimation}
              className="inline-block"
            >
              Creators,
            </motion.span>
            <motion.span
              key="h1-3"
              custom={2}
              initial="hidden"
              animate="visible"
              variants={wordAnimation}
              className="inline-block"
            >
              Talent
            </motion.span>
            <motion.span
              key="h1-4"
              custom={3}
              initial="hidden"
              animate="visible"
              variants={wordAnimation}
              className="inline-block"
            >
              &
            </motion.span>
            <motion.span
              key="h1-5"
              custom={4}
              initial="hidden"
              animate="visible"
              variants={wordAnimation}
              className="inline-block"
            >
              Teams
            </motion.span>
          </div>
          <div className="overflow-hidden flex flex-wrap sm:flex-nowrap justify-center gap-x-[0.25em] gap-y-0">
            <motion.span
              key="h1-6"
              custom={5}
              initial="hidden"
              animate="visible"
              variants={wordAnimation}
              className="inline-block"
            >
              —
            </motion.span>
            <motion.span
              key="h1-7"
              custom={6}
              initial="hidden"
              animate="visible"
              variants={wordAnimation}
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#06B6D4]"
            >
              Without
            </motion.span>
            <motion.span
              key="h1-8"
              custom={7}
              initial="hidden"
              animate="visible"
              variants={wordAnimation}
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#06B6D4]"
            >
              the
            </motion.span>
            <motion.span
              key="h1-9"
              custom={8}
              initial="hidden"
              animate="visible"
              variants={wordAnimation}
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#06B6D4]"
            >
              Chaos.
            </motion.span>
          </div>
        </h1>

        {/* SUBHEADLINE */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-[18px] md:text-[20px] text-slate-300 max-w-2xl leading-relaxed mb-8 font-medium"
        >
          CircleWorks handles payroll for W-2 staff, 1099 influencers, and contractor talent — all in one platform. Built for agencies and companies running the creator economy.
        </motion.p>

        {/* CTA ROW */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center w-full"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            {/* Primary Blue Pill */}
            <Link 
              href="/signup"
              className="h-[56px] px-8 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] text-white font-semibold text-[16px] flex items-center justify-center gap-2 hover:shadow-[0_0_24px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto"
            >
              Start Free — No Credit Card
              <ChevronRight size={18} />
            </Link>

            {/* Secondary Outline */}
            <Link
              href="/demo"
              className="h-[56px] px-8 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-[16px] flex items-center justify-center gap-2 hover:bg-white hover:text-[#0A1628] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto group"
            >
              <Play size={18} className="fill-current text-white group-hover:text-[#0A1628]" />
              Watch 2-Min Demo
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><Check size={14} className="text-cyan-400" /> 30-day free trial</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-cyan-400" /> No setup fees</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-cyan-400" /> Cancel anytime</span>
          </div>
        </motion.div>

        {/* PRODUCT MOCKUP */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
          className="mt-16 w-full relative"
        >
          {/* Mockup Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/20 blur-[100px] rounded-full z-0 pointer-events-none" />

          {/* Browser Frame */}
          <div className="relative z-10 w-full bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

            {/* Chrome Bar */}
            <div className="h-10 bg-[#0F172A] border-b border-slate-700/50 flex items-center px-4 gap-4">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-48 h-5 bg-[#1E293B] rounded-md border border-slate-700/40 flex items-center px-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                   <div className="text-[10px] text-slate-500 font-mono tracking-tighter">circleworks.app/dashboard</div>
                </div>
              </div>
              <div className="w-[50px]" />
            </div>

            {/* Dashboard Mock UI Wrapper */}
            <div className="flex h-[350px] sm:h-[450px] md:h-[550px]">

              {/* Sidebar */}
              <div className="hidden sm:flex w-48 lg:w-56 bg-[#0F172A]/90 border-r border-slate-700/50 p-4 flex-col gap-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center p-1.5 text-white">
                    <div className="w-full h-full border-2 border-white rounded-full" />
                  </div>
                  <span className="text-white text-[14px] font-black tracking-tight">CircleWorks</span>
                </div>
                
                <div className="flex flex-col gap-1">
                   {["Dashboard", "Employees", "Payroll", "Benefits", "Compliance"].map((item) => (
                     <button
                       key={item}
                       onClick={() => setActiveMockTab(item)}
                       className={`h-8 rounded-lg flex items-center gap-3 px-3 transition-all duration-200 cursor-pointer w-full text-left focus:outline-none ${activeMockTab === item ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:bg-slate-800'}`}
                     >
                        <div className={`w-3.5 h-3.5 rounded ${activeMockTab === item ? 'bg-blue-400' : 'bg-slate-700'}`} />
                        <span className="text-[12px] font-bold">{item}</span>
                     </button>
                   ))}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white text-[10px] font-bold shadow-md">VR</div>
                    <div className="flex flex-col">
                      <div className="text-white text-[12px] font-bold leading-none">Vibhu Rastogi</div>
                      <div className="text-slate-500 text-[10px] font-medium mt-1 uppercase tracking-tighter">Admin Account</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 bg-[#0A1628] p-4 sm:p-8 flex flex-col gap-6 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white text-[16px] md:text-[20px] font-black">Company Snapshot</h4>
                    <p className="text-slate-500 text-[11px] md:text-[13px] font-medium">Reporting for Q1 2026</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-300 font-bold">Last 30 Days</div>
                    <div className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">+ Invite Admin</div>
                  </div>
                </div>

                {/* KPI Cards Row */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                   {[
                     { label: "Active Staff", val: "142", color: "blue" },
                     { label: "Monthly Gross", val: "$912k", color: "cyan" },
                     { label: "Tax Liability", val: "$182k", color: "emerald" }
                   ].map((kpi) => (
                     <div key={kpi.label} className="bg-[#0F172A] border border-slate-700/30 p-3 md:p-4 rounded-xl flex flex-col gap-1 shadow-sm hover:border-slate-600 transition-colors cursor-default">
                        <span className="text-slate-500 text-[10px] md:text-[12px] font-bold uppercase tracking-wider">{kpi.label}</span>
                        <span className="text-white text-[18px] md:text-[24px] font-black tracking-tight">{kpi.val}</span>
                     </div>
                   ))}
                </div>

                {/* Dashboard Chart and List Wrapper */}
                <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 relative">
                  
                  {/* Table area */}
                  <div className="flex-1 bg-[#0F172A] rounded-xl border border-slate-700/30 overflow-hidden flex flex-col shadow-sm">
                    <div className="h-10 border-b border-slate-700/30 flex items-center px-4 bg-black/10">
                      <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
                        {activeMockTab === "Dashboard" && "Active Payroll Batches"}
                        {activeMockTab === "Employees" && "Staff Directory"}
                        {activeMockTab === "Payroll" && "Payment History"}
                        {activeMockTab === "Benefits" && "Benefit Enrollments"}
                        {activeMockTab === "Compliance" && "Regulatory Postings"}
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <div className="flex flex-col divide-y divide-slate-700/20 p-2">
                        {activeMockTab === "Dashboard" && [
                          { name: "Sarah Smith", dept: "Engineering", val: "$4,250", status: "Paid" },
                          { name: "Michael Chen", dept: "Design", val: "$3,800", status: "Paid" },
                          { name: "Emma Watson", dept: "Marketing", val: "$3,100", status: "Processing" },
                          { name: "David Lee", dept: "Sales", val: "$4,500", status: "Paid" },
                          { name: "Alex Johnson", dept: "Support", val: "$2,900", status: "Paid" },
                          { name: "Julia Roberts", dept: "People", val: "$3,500", status: "Paid" }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-800/30 transition-colors cursor-default">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-blue-400 border border-slate-700">
                                  {item.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                   <div className="text-slate-200 text-[13px] font-bold">{item.name}</div>
                                   <div className="text-slate-500 text-[10px] font-medium">{item.dept}</div>
                                </div>
                             </div>
                             <div className="flex items-center gap-6">
                                <div className="text-slate-300 text-[12px] font-mono font-bold">{item.val}</div>
                                <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                  item.status === 'Paid' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                                }`}>
                                  {item.status}
                                </div>
                             </div>
                          </div>
                        ))}

                        {activeMockTab !== "Dashboard" && [
                          { name: `Mock Row for ${activeMockTab} A`, desc: "System entry verified", date: "Jan 12, 2026" },
                          { name: `Mock Row for ${activeMockTab} B`, desc: "Compliance check passed", date: "Jan 14, 2026" },
                          { name: `Mock Row for ${activeMockTab} C`, desc: "Pending review", date: "Jan 15, 2026" },
                          { name: `Mock Row for ${activeMockTab} D`, desc: "Archived record", date: "Jan 16, 2026" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-800/30 transition-colors cursor-default">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-cyan-400 border border-slate-700">
                                  {i + 1}
                                </div>
                                <div className="flex flex-col">
                                   <div className="text-slate-200 text-[13px] font-bold">{item.name}</div>
                                   <div className="text-slate-500 text-[10px] font-medium">{item.desc}</div>
                                </div>
                             </div>
                             <div className="text-slate-400 text-[11px] font-medium">{item.date}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Smaller Chart Area on Side */}
                  <div className="hidden lg:flex w-48 xl:w-56 flex-col gap-4">
                    <div className="flex-1 bg-[#0F172A] p-4 rounded-xl border border-slate-700/30 flex flex-col gap-3">
                       <span className="text-slate-500 text-[10px] font-bold uppercase">Trend Variance</span>
                       <div className="flex-1 w-full bg-slate-800/10 rounded-lg relative overflow-hidden group">
                          {/* Animated bars */}
                          <div className="absolute inset-0 flex items-end justify-around p-2 gap-1.5">
                             {[40, 70, 55, 90, 65, 80, 45].map((h, i) => (
                               <div 
                                key={i} 
                                className="w-full bg-blue-600/40 border border-blue-500/20 rounded-t-sm transition-all duration-700 hover:bg-blue-400" 
                                style={{ height: `${h}%` }}
                               />
                             ))}
                          </div>
                       </div>
                       <div className="text-[11px] font-bold text-cyan-400">+12.4% MoM</div>
                    </div>
                    <div className="h-[120px] bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-xl border border-blue-500/30 flex flex-col justify-end text-white relative overflow-hidden">
                       <div className="absolute top-2 right-2 w-12 h-12 bg-white/10 rounded-full blur-xl" />
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Tax Filing</span>
                       <span className="text-[14px] font-bold leading-tight">SOC 2 Compliance Guaranteed</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* TRUST BAR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          className="mt-16 sm:mt-20 lg:mt-24 w-full flex flex-col items-center overflow-hidden relative"
        >
          <p className="text-[13px] text-slate-400 font-bold uppercase tracking-wider mb-6 text-center">
            Trusted by 500+ Creator Agencies & Studios
          </p>

          {/* Shadow Edges to blend scrolling logos seamlessly */}
          <div className="absolute left-0 top-12 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#0A1628] to-transparent z-10" />
          <div className="absolute right-0 top-12 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#0A1628] to-transparent z-10" />

          {/* Marquee Strip */}
          <div className="flex overflow-hidden w-[200vw] sm:w-[150vw] md:w-full opacity-60 mix-blend-screen">
            <div className="flex items-center justify-around flex-nowrap min-w-full animate-marquee-css">
              {marqueeLogos.map((logo, index) => (
                <div key={index} className="flex-shrink-0 px-8 text-[18px] md:text-[22px] font-black tracking-tight text-slate-600 whitespace-nowrap">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
