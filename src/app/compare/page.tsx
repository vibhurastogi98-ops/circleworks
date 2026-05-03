"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const competitors = [
  { name: "Gusto", slug: "gusto", desc: "Why growing companies switch from Gusto for true enterprise scalability." },
  { name: "Rippling", slug: "rippling", desc: "Compare our truly unified HRIS architecture vs Rippling's ecosystem." },
  { name: "ADP", slug: "adp", desc: "Leave the 90s UI behind. See how we beat ADP on speed and usability." },
  { name: "BambooHR", slug: "bamboohr", desc: "Adding robust payroll to your HR system instead of API workarounds." },
  { name: "Paychex", slug: "paychex", desc: "Traditional payroll processing vs modern HR speed and usability." },
  { name: "Paycom", slug: "paycom", desc: "Enterprise single-database HR vs a truly modern, transparent platform." },
];

export default function CompareHubPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden text-center z-10 border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-white/5 text-slate-300 border border-white/10 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 relative"
          >
            Compare CircleWorks
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto"
          >
            See how we stack up against the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">legacy giants.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Transparent, unbiased breakdowns of how our modern HR and payroll infrastructure compares vs the rest of the market.
          </motion.p>
        </div>
      </section>

      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid md:grid-cols-2 gap-6">
            {competitors.map((comp, idx) => (
               <Link href={`/compare/${comp.slug}`} key={idx} className="group flex flex-col justify-between bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
                  <div>
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[#0A1628] uppercase text-xs">VS</div>
                        <h3 className="text-2xl font-black text-[#0A1628]">{comp.name}</h3>
                     </div>
                     <p className="text-slate-500 mb-8 font-medium">
                        {comp.desc}
                     </p>
                  </div>
                  <div className="flex items-center text-blue-600 font-bold group-hover:gap-2 gap-1 transition-all">
                     Read the breakdown <span>&rarr;</span>
                  </div>
               </Link>
            ))}
         </div>
      </section>

      {/* CTA Layer */}
      <section className="py-24 bg-blue-600 text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
         <div className="max-w-3xl mx-auto px-4 relative z-10">
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">Ready to make the switch?</h2>
            <p className="text-xl text-blue-100 mb-10">Import your employee data directly from any major provider in under 5 minutes.</p>
            <div className="flex justify-center flex-wrap gap-4">
               <Link href="/pricing" className="bg-white text-blue-600 px-8 py-4 font-bold rounded-xl shadow-xl hover:-translate-y-1 transition-transform">
                  Start Free
               </Link>
               <Link href="/contact" className="bg-transparent border-2 border-white/30 text-white px-8 py-4 font-bold rounded-xl hover:bg-white/10 transition-colors">
                  Talk to an Expert
               </Link>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
