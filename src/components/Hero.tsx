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
          THE #1 PAYROLL & HR PLATFORM FOR USA COMPANIES
        </motion.div>

        {/* H1 HEADER */}
        <h1 className="text-[44px] sm:text-[56px] md:text-[72px] font-black text-white leading-[1.05] tracking-tight mb-6">
          <div className="overflow-hidden flex flex-wrap justify-center gap-[0.3em]">
            {line1.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={wordAnimation}
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
          </div>
          <div className="overflow-hidden flex flex-wrap justify-center gap-[0.3em]">
            {line2Part1.map((word, i) => (
              <motion.span
                key={`p1-${i}`}
                custom={line1.length + i}
                initial="hidden"
                animate="visible"
                variants={wordAnimation}
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
            {line2Part2.map((word, i) => (
              <motion.span
                key={`p2-${i}`}
                custom={line1.length + line2Part1.length + i}
                initial="hidden"
                animate="visible"
                variants={wordAnimation}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#06B6D4]"
              >
                {word}
              </motion.span>
            ))}
          </div>
        </h1>

        {/* SUBHEADLINE */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-[18px] md:text-[20px] text-slate-300 max-w-2xl leading-relaxed mb-8 font-medium"
        >
          All-in-one: Payroll &middot; HRIS &middot; ATS &middot; Benefits &middot; Time &middot; Expenses. Built for every USA company.
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
              Start Free &mdash; No Credit Card
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-cyan-600/20 blur-[100px] rounded-full z-0 pointer-events-none" />

          {/* Browser Frame */}
          <div className="relative z-10 w-full animate-floating-frame bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

            {/* Chrome Bar */}
            <div className="h-10 bg-[#0F172A] border-b border-slate-700/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-500/50" />
            </div>

            {/* Dashboard Mock UI Wrapper */}
            <div className="flex h-[300px] sm:h-[400px] md:h-[500px]">

              {/* Sidebar */}
              <div className="hidden sm:flex w-48 lg:w-60 bg-[#0F172A]/90 border-r border-slate-700/50 p-4 flex-col gap-3">
                <div className="w-32 h-4 bg-slate-700/50 rounded-md mb-4" />
                <div className="w-full h-8 bg-blue-600/20 border border-blue-500/30 rounded-md" />
                <div className="w-3/4 h-8 bg-slate-800/50 rounded-md" />
                <div className="w-4/5 h-8 bg-slate-800/50 rounded-md" />
                <div className="w-full h-8 bg-slate-800/50 rounded-md" />
                <div className="w-2/3 h-8 bg-slate-800/50 rounded-md" />
              </div>

              {/* Main Table Area */}
              <div className="flex-1 bg-[#0A1628] p-4 sm:p-6 flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="w-48 h-6 bg-slate-700/50 rounded-md" />
                  <div className="w-24 h-8 bg-blue-600 rounded-md" />
                </div>

                {/* Table Header mock */}
                <div className="w-full h-10 border-b border-slate-700/50 mt-4 flex items-center justify-between px-2">
                  <div className="w-20 h-3 bg-slate-600/50 rounded" />
                  <div className="w-16 h-3 bg-slate-600/50 rounded" />
                  <div className="w-24 h-3 bg-slate-600/50 rounded hidden sm:block" />
                  <div className="w-12 h-3 bg-slate-600/50 rounded" />
                </div>

                {/* Table Rows (5 Employees) */}
                <div className="flex flex-col gap-2 relative">
                  {/* Ghosting bottom mask for realism */}
                  <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0A1628] to-transparent z-10" />

                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full h-12 bg-[#0F172A] border border-slate-700/30 rounded-md flex items-center justify-between px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-600/40" />
                        <div className="w-24 h-3 bg-slate-500/60 rounded" />
                      </div>
                      <div className="w-20 h-3 bg-slate-500/40 rounded" />
                      <div className="w-24 h-3 bg-slate-500/40 rounded hidden sm:block" />
                      {/* Status Badge Mock */}
                      <div className="w-16 h-5 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center">
                        <div className="w-8 h-2 bg-emerald-400/60 rounded" />
                      </div>
                    </div>
                  ))}
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
            Trusted by 5,000+ US companies
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
