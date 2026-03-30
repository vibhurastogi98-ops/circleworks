"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden text-center z-10 border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-400/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-slate-500/10 text-slate-400 border border-slate-500/30 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 relative"
          >
            Trust & Security
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto"
          >
            Bank-grade <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-white">security.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            As a payroll provider, protecting your company&apos;s deepest financial and personnel data is our absolute highest priority.
          </motion.p>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-wrap justify-center gap-4 mt-8"
          >
             <span className="bg-slate-800 text-white font-bold rounded-lg px-6 py-3 border border-slate-700 shadow-xl">SOC 2 Type II</span>
             <span className="bg-slate-800 text-white font-bold rounded-lg px-6 py-3 border border-slate-700 shadow-xl">HIPAA Compliant</span>
             <span className="bg-slate-800 text-white font-bold rounded-lg px-6 py-3 border border-slate-700 shadow-xl">AES-256 Encryption</span>
          </motion.div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
               <h2 className="text-3xl lg:text-4xl font-black text-[#0A1628] mb-6">Infrastructure & Encryption</h2>
               <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                  We host our primary infrastructure on Amazon Web Services (AWS) using their highest standard physical and network security standards. Data is isolated, automatically backed up hourly, and encrypted continuously.
               </p>
               <ul className="space-y-4">
                  <li className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <span className="text-2xl mt-0.5 text-blue-500">🔒</span>
                     <div>
                        <div className="font-bold text-[#0A1628]">In Transit & At Rest</div>
                        <div className="text-slate-500 text-sm mt-1">All data is encrypted in transit using TLS 1.3 and at rest with AES-256 block-level encryption.</div>
                     </div>
                  </li>
                  <li className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <span className="text-2xl mt-0.5 text-blue-500">🛡️</span>
                     <div>
                        <div className="font-bold text-[#0A1628]">WAF & DDoS Protection</div>
                        <div className="text-slate-500 text-sm mt-1">Our edge network aggressively filters malicious ingress traffic and automatically scales to absorb DDoS attacks.</div>
                     </div>
                  </li>
               </ul>
            </div>
            
            <div className="relative w-full aspect-square bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
               <div className="w-48 h-48 bg-white shadow-2xl rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-4 animate-[bounce_4s_infinite]">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-blue-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div className="font-black text-slate-400 tracking-widest text-sm">PROTECTED</div>
               </div>
            </div>
         </div>
      </section>

      {/* Program Request */}
      <section className="py-24 bg-slate-50 border-t border-slate-200 text-center relative">
         <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-[#0A1628] mb-4">Request Security Documentation</h2>
            <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
               Need our full SOC 2 Type II report, pentest results, or a completed security questionnaire for your compliance team?
            </p>
            <button className="bg-[#0A1628] hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors">
               Contact Security Team
            </button>
         </div>
      </section>

      <Footer />
    </main>
  );
}
