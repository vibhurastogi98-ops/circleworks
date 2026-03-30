"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ResourceCTA from "@/components/ResourceCTA";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const categories = ["All", "Onboarding", "Payroll", "Compliance", "Hiring", "Benefits", "Templates", "Checklists"];

const allGuides = [
  { id: 1, format: "DOCX", cat: "Onboarding", title: "New Hire Offer Letter Template", desc: "Attorney-reviewed standard offer letter compliant across all 50 states.", downloads: "12,450", color: "blue" },
  { id: 2, format: "XLSX", cat: "Payroll", title: "Monthly Overtime Calculator", desc: "Instantly calculate daily and weekly overtime under California and Federal rules.", downloads: "8,234", color: "green" },
  { id: 3, format: "PDF", cat: "Compliance", title: "2026 FLSA Compliance Checklist", desc: "A 10-point checklist to audit your exempt vs. non-exempt employee classifications.", downloads: "5,110", color: "red" },
  { id: 4, format: "DOCX", cat: "Hiring", title: "Structured Interview Scorecard", desc: "Standardize your hiring process to reduce bias and document hiring decisions cleanly.", downloads: "14,300", color: "blue" },
  { id: 5, format: "PDF", cat: "Benefits", title: "Employee Benefits Guide Template", desc: "A customizable 12-page PDF presentation to explain your benefits package to new hires.", downloads: "9,600", color: "red" },
  { id: 6, format: "XLSX", cat: "Checklists", title: "Termination & Offboarding Tracker", desc: "Ensure IT revocation, final paycheck timing, and exit interviews are done smoothly.", downloads: "7,840", color: "green" },
  { id: 7, format: "DOCX", cat: "Templates", title: "Remote Work Policy Framework", desc: "A customizable policy outlining equipment stipends, core hours, and security protocols.", downloads: "11,200", color: "blue" },
  { id: 8, format: "PDF", cat: "Payroll", title: "Multi-State Tax Registration Guide", desc: "Step-by-step instructions on setting up localized tax accounts in new states.", downloads: "6,420", color: "red" },
  { id: 9, format: "XLSX", cat: "Templates", title: "Performance Review Matrix", desc: "A 9-box grid and rating calculator for managers during annual review cycles.", downloads: "18,900", color: "green" },
];

function GuidesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("cat") || "All";

  const visibleGuides = activeFilter === "All" ? allGuides : allGuides.filter(g => g.cat === activeFilter);

  const setFilter = (cat: string) => {
    if (cat === "All") {
      router.push("/guides", { scroll: false });
    } else {
      router.push(`/guides?cat=${cat}`, { scroll: false });
    }
  };

  return (
    <>
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden z-10 border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-12 flex justify-center">
             <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Resources" }]} variant="dark" />
          </div>

          <div className="text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 relative"
            >
              Free HR Templates
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[72px] font-black text-white leading-[1.1] tracking-tight mb-8"
            >
              Build your team with <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Perfect Compliance.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Download ready-to-use guides, checklists, and templates &mdash; built by HR professionals to keep your business compliant and scalable.
            </motion.p>
            
            <div className="max-w-2xl mx-auto relative mb-12 group">
               <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </div>
               <input 
                  type="text" 
                  placeholder="Search for handbooks, checklists, and calculators..." 
                  className="w-full bg-[#0F1C2E] border-2 border-slate-700/50 focus:border-cyan-400 pl-14 pr-6 py-5 rounded-2xl text-white font-bold outline-none transition-all shadow-2xl placeholder:text-slate-500" 
               />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400 font-bold text-xs tracking-[0.2em] uppercase">
               <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" /> 50+ Resources</div>
               <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" /> 10k+ Downloads</div>
               <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" /> Always Free</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative -mt-10 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200 flex flex-col lg:flex-row group hover:border-blue-200 transition-all duration-500">
              <div className="lg:w-[55%] p-10 md:p-14 lg:p-20 flex flex-col justify-center relative">
                 <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest w-max mb-8">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Most Popular Template
                 </div>
                 <h2 className="text-4xl md:text-5xl font-black text-[#0A1628] leading-tight mb-6 group-hover:text-blue-600 transition-colors tracking-tight">Complete US Employee Handbook 2026</h2>
                 <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">A fully customizable 45-page DOCX covering multi-state PTO policies, remote work security, and harassment prevention. Reviewed by top labor attorneys.</p>
                 <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-auto">
                    <button className="bg-blue-600 text-white font-bold px-10 py-4 rounded-xl hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-600/20 text-center">Free Download</button>
                    <div className="flex items-center gap-4">
                       <span className="text-slate-400 text-sm font-bold flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          10k+
                       </span>
                       <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-inner tracking-widest">DOCX</span>
                    </div>
                 </div>
              </div>
              <div className="lg:w-[45%] bg-[#F8FAFC] p-12 lg:p-20 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-blue-600/5 mix-blend-multiply" />
                 <div className="relative z-10 w-full max-w-[340px] aspect-[1/1.4] bg-white rounded-[2rem] shadow-2xl border border-slate-200 p-8 flex flex-col group-hover:-translate-y-4 group-hover:rotate-2 transition-all duration-700 group-hover:shadow-[0_40px_80px_rgba(37,99,235,0.15)]">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-600/20 shrink-0">
                       <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    </div>
                    <div className="space-y-4">
                       <div className="w-[85%] h-5 bg-slate-100 rounded-full" />
                       <div className="w-[100%] h-2.5 bg-slate-50 rounded-full" />
                       <div className="w-[90%] h-2.5 bg-slate-50 rounded-full" />
                       <div className="w-[95%] h-2.5 bg-slate-50 rounded-full" />
                    </div>
                    <div className="mt-12 space-y-4 pt-8 border-t border-slate-100 flex-1">
                       <div className="w-[70%] h-5 bg-slate-100 rounded-full" />
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-400" />
                          <div className="w-16 h-2 bg-slate-100 rounded-full" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <section className="py-24 bg-white border-b border-slate-100 min-h-[600px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-nowrap overflow-x-auto hide-scrollbar gap-2 md:gap-4 py-6 mb-8 border-b border-slate-100 group">
              {categories.map(cat => (
                 <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`shrink-0 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                       activeFilter === cat 
                       ? "bg-[#0A1628] text-white shadow-xl shadow-slate-900/20 scale-105" 
                       : "bg-white text-slate-500 border border-slate-200 hover:border-[#0A1628] hover:text-[#0A1628]"
                    }`}
                 >
                    {cat}
                 </button>
              ))}
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <AnimatePresence mode="popLayout">
                 {visibleGuides.map((guide) => (
                    <motion.div
                       key={guide.id}
                       layout
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       transition={{ duration: 0.4 }}
                       className="bg-white rounded-[32px] border border-slate-200 p-10 flex flex-col group hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200 transition-all duration-500 overflow-hidden relative cursor-pointer"
                    >
                       <div className="flex items-start justify-between mb-8">
                          <span className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-slate-100 shadow-inner">{guide.cat}</span>
                          <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl ${
                             guide.color === 'red' ? 'bg-red-50 text-red-600' :
                             guide.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>{guide.format}</span>
                       </div>
                       <h3 className="text-xl font-black text-[#0A1628] leading-tight mb-4 group-hover:text-blue-600 transition-colors tracking-tight">{guide.title}</h3>
                       <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium flex-1 line-clamp-3">{guide.desc}</p>
                       <div className="mt-auto">
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-6">
                             <span className="w-1 h-1 rounded-full bg-emerald-500" />
                             {guide.downloads} downloads
                          </div>
                          <button className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-700 font-black text-xs uppercase tracking-widest group-hover:bg-[#0A1628] group-hover:border-[#0A1628] group-hover:text-white transition-all shadow-sm">Download Free</button>
                       </div>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>

           {visibleGuides.length === 0 && (
             <div className="text-center py-32 text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-[40px] bg-slate-50">
                No templates found in this category right now.
             </div>
           )}
        </div>
      </section>

      <ResourceCTA 
         title="Need something custom?" 
         description="Our team can help you build a bespoke employee handbook and multi-state compliance strategy."
      />
    </>
  );
}

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-[#0A1628] flex items-center justify-center text-white font-black uppercase tracking-widest">Loading circleworks resources...</div>}>
        <GuidesContent />
      </Suspense>
      <Footer />
    </main>
  );
}
