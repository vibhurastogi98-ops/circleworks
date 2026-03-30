"use client";

import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ResourceCTA from "@/components/ResourceCTA";
import Link from "next/link";
import { useState, useMemo } from "react";
import { stateGuides } from "@/data/states";

export default function StateTaxGuidesRoot() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "No Tax" | "Progressive" | "Flat">("All");

  const filteredStates = useMemo(() => {
    return stateGuides.filter(state => {
      const matchSearch = state.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = activeFilter === "All" 
        || (activeFilter === "No Tax" && !state.hasIncomeTax)
        || (activeFilter === "Progressive" && state.taxType === "Progressive")
        || (activeFilter === "Flat" && state.taxType === "Flat");
      return matchSearch && matchFilter;
    });
  }, [search, activeFilter]);

  return (
    <main className="min-h-screen bg-[#060B13] font-sans selection:bg-cyan-200 selection:text-navy text-white">
      <Navbar />

      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden z-10 border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="mb-12 flex justify-center">
             <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Resources", href: "/guides" }, { label: "State Tax Guides" }]} variant="dark" />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-white/5 text-cyan-400 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-8"
          >
            STATE TAX & COMPLIANCE HUB
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8"
          >
            Navigate HR compliance with <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">total confidence.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            State-by-state payroll tax guides, employer compliance rules, and filing requirements updated for 2026. Built by HR pros, for U.S. businesses.
          </motion.p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/pricing" className="px-8 py-4 bg-white text-[#0A1628] font-black rounded-xl shadow-xl hover:-translate-y-1 transition-all">View Compliance Plans</Link>
            <Link href="/contact" className="px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-all">Speak with an Expert</Link>
          </div>
        </div>
      </section>

      {/* SEARCH & FILTER SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex flex-col lg:flex-row gap-8 items-center justify-between mb-16">
            <div className="w-full lg:w-1/2 relative group">
               <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </div>
               <input 
                  type="text" 
                  placeholder="Search by state (e.g., California, Texas)..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#111A29] border-2 border-white/5 focus:border-cyan-500/50 pl-14 pr-6 py-5 rounded-2xl text-white font-bold outline-none transition-all shadow-2xl placeholder:text-slate-600 focus:bg-[#152033]" 
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-600 tracking-wider">
                  {filteredStates.length} / 50 States
               </div>
            </div>

            <div className="flex flex-wrap gap-3">
               {(["All", "No Tax", "Progressive", "Flat"] as const).map(f => (
                  <button 
                     key={f}
                     onClick={() => setActiveFilter(f)}
                     className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-[0.1em] border transition-all ${
                        activeFilter === f 
                        ? "bg-white text-[#0A1628] border-white shadow-xl scale-105" 
                        : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                     }`}
                  >
                     {f}
                  </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
               {filteredStates.map((state) => (
                  <motion.div 
                     layout
                     key={state.id}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.4 }}
                     className="group bg-[#0A1628] border border-white/10 rounded-[32px] p-8 flex flex-col hover:border-cyan-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                  >
                     <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full group-hover:bg-cyan-500/20 transition-all duration-700" />
                     
                     <div className="mb-6">
                        <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">{state.name}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                           {state.id.toUpperCase()} • 2026 Guide
                        </p>
                     </div>

                     <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 flex-1 line-clamp-2">
                        {state.summary}
                     </p>

                     <div className="flex flex-wrap gap-2 mb-8">
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${state.hasIncomeTax ? "bg-red-400/5 border-red-400/20 text-red-400" : "bg-emerald-400/5 border-emerald-400/20 text-emerald-400"}`}>
                           {state.hasIncomeTax ? "Income Tax" : "No Inc. Tax"}
                        </span>
                        {state.localTax && (
                           <span className="bg-blue-400/5 border border-blue-400/20 text-blue-400 text-[9px] font-black uppercase px-2.5 py-1 rounded-full">
                              Local Tax
                           </span>
                        )}
                        <span className="bg-white/5 border border-white/10 text-slate-500 text-[9px] font-black uppercase px-2.5 py-1 rounded-full">
                           {state.taxType}
                        </span>
                     </div>

                     <Link 
                        href={`/resources/state-tax-guides/${state.id}`} 
                        className="w-full py-4 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl group-hover:bg-white group-hover:text-[#0A1628] group-hover:border-white transition-all text-center"
                     >
                        View Guide &rarr;
                     </Link>
                  </motion.div>
               ))}
            </AnimatePresence>
            {filteredStates.length === 0 && (
               <div className="col-span-full py-32 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-[40px]">
                  <p className="text-slate-500 font-bold mb-4">No state guides found matching &quot;{search}&quot;</p>
                  <button onClick={() => { setSearch(""); setActiveFilter("All"); }} className="text-cyan-400 font-black uppercase text-xs hover:underline underline-offset-4">Reset all filters</button>
               </div>
            )}
         </div>
      </section>

      <section className="py-32 border-t border-white/5">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-8 tracking-tight">Stay compliant across <br />all 50 states.</h2>
            <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium">CircleWorks monitors 20,000+ tax jurisdictions and updates your payroll rules automatically. Never miss a nexus or a filing again.</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
               <Link href="/pricing" className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-blue-600/20">Get Started Free</Link>
               <Link href="/contact" className="px-10 py-5 bg-white/5 text-white border border-white/10 font-black rounded-2xl hover:bg-white/10 transition-all">Book a Demo</Link>
            </div>
         </div>
      </section>

      <ResourceCTA 
         title="Need high-volume compliance?" 
         description="Our enterprise team helps organizations with 250+ employees manage complex nexus issues and multi-state nexus registrations."
      />

      <Footer />
    </main>
  );
}
