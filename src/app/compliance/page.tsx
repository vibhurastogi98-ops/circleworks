"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ResourceCTA from "@/components/ResourceCTA";
import Link from "next/link";

export default function CompliancePage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden z-10 border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="mb-12">
             <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Resources", href: "/guides" }, { label: "Compliance Hub" }]} variant="dark" />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-white/5 text-slate-300 border border-white/10 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 relative"
          >
            State Tax & Compliance Hub
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto"
          >
            Navigate HR compliance with <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">total confidence.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            State-by-state labor guides, minimum wage updates, and automated tax filings so you never miss a deadline or a nexus event.
          </motion.p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/pricing" className="px-8 py-4 bg-white text-[#0A1628] font-bold rounded-xl shadow-xl hover:-translate-y-1 transition-transform">View Compliance Plans</Link>
            <Link href="/contact" className="px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-colors">Speak with an Expert</Link>
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-[#0A1628]">Compliance by Category</h2>
            <p className="text-slate-500 mt-4 font-medium">Expert-reviewed guides for every US state and federal regulation.</p>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group">
               <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform">🇺🇸</div>
               <h3 className="text-2xl font-black text-[#0A1628] mb-4">State Tax Guides</h3>
               <p className="text-slate-500 mb-8 leading-relaxed font-medium">Downloadable runbooks for SUI, withholding, and wage laws across all 50 states. Standardized formats for easy reading.</p>
               <Link href="/resources/state-tax-guides" className="font-bold text-red-500 group-hover:underline">View All States &rarr;</Link>
            </div>
            <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group">
               <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform">📝</div>
               <h3 className="text-2xl font-black text-[#0A1628] mb-4">Form W-2s & 1099s</h3>
               <p className="text-slate-500 mb-8 leading-relaxed font-medium">Understand year-end tax requirements, employee distribution timelines, and ACA reporting thresholds for 2026.</p>
               <Link href="/blog/labor-law-dictionary" className="font-bold text-orange-500 group-hover:underline">Read Terminology &rarr;</Link>
            </div>
            <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group">
               <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform">🛡️</div>
               <h3 className="text-2xl font-black text-[#0A1628] mb-4">I-9 & E-Verify</h3>
               <p className="text-slate-500 mb-8 leading-relaxed font-medium">Anonymized, safe storage procedures and digital verification paths for new hires that meet latest DHS requirements.</p>
               <Link href="/product/compliance" className="font-bold text-blue-500 group-hover:underline">See Feature Details &rarr;</Link>
            </div>
         </div>
      </section>

      <ResourceCTA 
         title="Never worry about an audit again." 
         description="CircleWorks monitors 20,000+ tax jurisdictions and updates your payroll rules automatically."
      />

      <Footer />
    </main>
  );
}
