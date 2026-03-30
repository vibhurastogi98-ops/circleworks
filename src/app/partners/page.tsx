"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const benefits = [
  { title: "Revenue Sharing", desc: "Earn up to 20% ongoing revenue share for every client you introduce to CircleWorks.", icon: "💸" },
  { title: "Single Dashboard", desc: "Manage all of your clients' payroll runs and reports from a single, unified accountant dashboard.", icon: "🎛️" },
  { title: "Priority Support", desc: "Skip the line. Partners get direct access to dedicated VIP support reps who speak your language.", icon: "⭐" },
  { title: "Free Firm Access", desc: "When you run payroll for your own accounting firm on CircleWorks, the software is 100% free.", icon: "🤝" },
  { title: "Co-Marketing", desc: "Get listed in our partner directory and receive co-branded marketing materials to grow your practice.", icon: "📢" },
  { title: "Early Access", desc: "Preview and beta-test new features before they are released to the general public.", icon: "🚀" },
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden text-center z-10 border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 relative"
          >
            Partner Program
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto"
          >
            Grow your firm with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">CircleWorks</span>.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Built specifically for CPAs, bookkeepers, and accounting professionals. Get your own payroll for free, plus massive revenue share for referring clients.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
             <Link href="#apply" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-1">
                Apply to Partner Program
             </Link>
             <Link href="/pricing" className="px-8 py-4 bg-transparent border-2 border-slate-700 hover:border-slate-500 text-white font-bold rounded-xl transition-all">
                View Pricing
             </Link>
          </motion.div>
        </div>
      </section>

      {/* Program Benefits */}
      <section className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black text-[#0A1628] mb-4 tracking-tight">Everything you need to succeed</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">We treat our partners like an extension of our own team. You get the best tools, competitive rev-share, and unconditional support.</p>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((b, i) => (
                 <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 duration-200">
                    <div className="text-4xl mb-6 bg-slate-50 w-16 h-16 rounded-xl flex items-center justify-center border border-slate-100">{b.icon}</div>
                    <h4 className="text-xl font-bold text-[#0A1628] mb-3">{b.title}</h4>
                    <p className="text-slate-500 leading-relaxed font-medium">{b.desc}</p>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-16 items-center">
           <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-5xl font-black text-[#0A1628] mb-6 tracking-tight leading-tight">
                 One dashboard to rule them all.
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                 Say goodbye to juggling twenty different logins and browser tabs. Our Partner Dashboard lets you run payroll, pull reports, and manage access for all of your clients from a single screen.
              </p>
              
              <ul className="space-y-4 mb-10">
                 {[
                   "Global client search and quick actions", 
                   "Bird's-eye view of upcoming payroll deadlines", 
                   "One-click accountant general ledger exports",
                   "Manage staff access levels for your firm"
                 ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700 font-bold">
                       <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                       {item}
                    </li>
                 ))}
              </ul>
           </div>
           
           <div className="lg:w-1/2 relative w-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-cyan-100 blur-2xl rounded-[3rem] -z-10" />
              <div className="w-full aspect-[4/3] bg-[#0A1628] rounded-2xl shadow-2xl border border-slate-800 p-6 flex flex-col">
                 <div className="flex gap-2 mb-6 border-b border-slate-800 pb-4">
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                 </div>
                 
                 {/* Mock UI elements */}
                 <div className="flex items-center justify-between mb-8">
                    <div className="w-32 h-6 bg-slate-800 rounded-md" />
                    <div className="w-24 h-8 bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold rounded-md border border-emerald-500/30">New Client</div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="w-full h-12 bg-slate-800/50 rounded-lg flex items-center px-4 justify-between border border-slate-700/50">
                       <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-blue-500/20" />
                          <div className="w-24 h-3 bg-slate-600 rounded" />
                       </div>
                       <div className="w-16 h-4 bg-emerald-500/20 rounded" />
                    </div>
                    <div className="w-full h-12 bg-slate-800/50 rounded-lg flex items-center px-4 justify-between border border-slate-700/50">
                       <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-purple-500/20" />
                          <div className="w-32 h-3 bg-slate-600 rounded" />
                       </div>
                       <div className="w-20 h-4 bg-emerald-500/20 rounded" />
                    </div>
                    <div className="w-full h-12 bg-slate-800/50 rounded-lg flex items-center px-4 justify-between border border-slate-700/50">
                       <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-orange-500/20" />
                          <div className="w-20 h-3 bg-slate-600 rounded" />
                       </div>
                       <div className="w-16 h-4 bg-orange-500/20 rounded" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Basic Contact Form / CTA */}
      <section id="apply" className="py-32 bg-[#0A1628] text-center border-t border-white/10 relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
         <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">Apply to partner with us</h2>
            <p className="text-xl text-slate-300 mb-10 font-medium">Leave your details below and our partner team will reach out to get you enrolled within 24 hours.</p>
            
            <form className="flex flex-col gap-4 max-w-md mx-auto" onSubmit={e=>e.preventDefault()}>
               <div className="flex gap-4">
                  <input required type="text" placeholder="First Name" className="w-1/2 bg-white/5 border border-white/10 text-white placeholder-slate-400 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white/10 transition-all font-medium" />
                  <input required type="text" placeholder="Last Name" className="w-1/2 bg-white/5 border border-white/10 text-white placeholder-slate-400 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white/10 transition-all font-medium" />
               </div>
               <input required type="email" placeholder="Work Email" className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white/10 transition-all font-medium" />
               <input required type="text" placeholder="Accounting Firm Name" className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white/10 transition-all font-medium" />
               <button type="submit" className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-[#0A1628] font-black rounded-xl px-4 py-4 transition-colors text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  Submit Application
               </button>
            </form>
         </div>
      </section>

      <Footer />
    </main>
  );
}
