"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const updates = [
  {
    date: "March 2026",
    version: "v2.14.0",
    features: [
      { type: "Feature", title: "Automated Multi-State Tax Registration", desc: "CircleWorks now automatically detects when an employee moves states and triggers the appropriate state filing registrations on your behalf." },
      { type: "Improvement", title: "Faster Payroll Previews", desc: "We've rewritten our core calculation engine in Rust. Payroll run previews now load 40% faster for companies with over 1,000 employees." },
      { type: "Fix", title: "CSV Export Bug", desc: "Resolved an issue where custom date ranges in the GL export were off by one day in the PST time zone." }
    ]
  },
  {
    date: "February 2026",
    version: "v2.13.0",
    features: [
      { type: "Feature", title: "Custom Performance Review Templates", desc: "HR leaders can now build fully customizable 360-degree performance review cycles with flexible scoring matrices." },
      { type: "Improvement", title: "Enhanced API Rate Limits", desc: "Enterprise accounts now have access to a dedicated API pool with 10x the standard rate limits." }
    ]
  },
  {
    date: "January 2026",
    version: "v2.12.0",
    features: [
      { type: "Feature", title: "Greenhouse & Lever Built-in Integrations", desc: "Automatically sync hired candidates directly from your ATS into CircleWorks for seamless onboarding." },
      { type: "Feature", title: "New Manager Dashboard", desc: "Managers now have a dedicated view highlighting team time-off requests, upcoming birthdays, and pending expense approvals." },
      { type: "Fix", title: "Mobile App Biometric Login", desc: "Fixed an edge case preventing FaceID fallback on iOS 17." }
    ]
  }
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden text-center z-10 border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none opacity-50" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-white/5 text-slate-300 border border-white/10 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
          >
            Product Updates
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto"
          >
            See what's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">new</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            New features, core improvements, and bug fixes shipped directly to the CircleWorks platform.
          </motion.p>
        </div>
      </section>

      {/* Changelog Timeline */}
      <section className="py-24 relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="space-y-24">
            {updates.map((update, idx) => (
               <div key={idx} className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-[11px] top-10 bottom-[-96px] w-[2px] bg-slate-200 hidden md:block" />
                  
                  <div className="flex flex-col md:flex-row gap-8">
                     {/* Marker */}
                     <div className="shrink-0 w-48 pt-1">
                        <div className="font-bold text-slate-400 uppercase tracking-widest text-sm mb-1 hidden md:flex items-center gap-4">
                           <div className="w-6 h-6 rounded-full border-4 border-slate-50 bg-blue-500 shadow-sm relative z-10" />
                           {update.date}
                        </div>
                        <div className="md:hidden font-bold text-slate-400 uppercase tracking-widest text-sm mb-2">
                           {update.date}
                        </div>
                        <div className="md:ml-10 text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded w-max border border-blue-100 mt-2">
                           {update.version}
                        </div>
                     </div>
                     
                     {/* Content */}
                     <div className="flex-1 space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
                        {update.features.map((feat, fidx) => (
                           <div key={fidx} className="border-b border-slate-100 last:border-0 pb-8 last:pb-0">
                              <div className="flex items-center gap-3 mb-3">
                                 <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded ${
                                    feat.type === 'Feature' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    feat.type === 'Improvement' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                    'bg-orange-50 text-orange-600 border border-orange-100'
                                 }`}>
                                    {feat.type}
                                 </span>
                                 <h3 className="text-xl font-bold text-[#0A1628]">{feat.title}</h3>
                              </div>
                              <p className="text-slate-600 leading-relaxed font-medium pl-1">
                                 {feat.desc}
                              </p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </section>

      <Footer />
    </main>
  );
}
