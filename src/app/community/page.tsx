"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden text-center z-10 border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-white/5 text-slate-300 border border-white/10 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
          >
            CircleWorks Community
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto"
          >
            Connect with peers and <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">experts.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Join over 10,000 HR leaders, payroll admins, and founders sharing knowledge in our official Slack community.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-8 py-4 bg-[#611f69] hover:bg-[#4a154b] text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-[#611f69]/40 flex items-center gap-3"
          >
             Join the Slack Community &rarr;
          </motion.button>
        </div>
      </section>

      <section className="py-24 bg-slate-50 border-t border-slate-200 text-center">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-[#0A1628] mb-12">Upcoming Events</h2>
            <div className="space-y-4 text-left">
               <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-6">
                     <div className="shrink-0 w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex flex-col items-center justify-center border border-blue-100">
                        <span className="text-xs font-black uppercase tracking-widest">May</span>
                        <span className="text-xl font-black leading-none">12</span>
                     </div>
                     <div>
                        <h4 className="text-xl font-bold text-[#0A1628] mb-1">State of HR 2026 Webinar</h4>
                        <p className="text-slate-500 font-medium">Virtual • 1:00 PM EST</p>
                     </div>
                  </div>
                  <button className="bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 px-6 py-3 rounded-lg w-full md:w-auto transition-colors">RSVP</button>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
