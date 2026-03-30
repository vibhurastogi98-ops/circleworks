"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const pressReleases = [
  { date: "March 15, 2026", title: "CircleWorks Surpasses $4B in Annual Payroll Processed", link: "#" },
  { date: "January 10, 2026", title: "CircleWorks Secures $50M Series B to Build the Future of Work Infrastructure", link: "#" },
  { date: "November 4, 2025", title: "FastCompany Names CircleWorks One of the Top 50 Innovative Companies", link: "#" },
  { date: "August 22, 2025", title: "CircleWorks Launches Native Global Contractor Payments System", link: "#" }
];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden text-center z-10 border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-white/5 text-slate-300 border border-white/10 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
          >
            Press & Media
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto"
          >
            News & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Announcements</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            The latest updates, press releases, and media highlights from CircleWorks. For press inquiries, contact <a href="mailto:press@circleworks.com" className="text-cyan-400 font-bold hover:underline">press@circleworks.com</a>.
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-16">
         {/* Left Side: Releases */}
         <div className="lg:w-2/3">
            <h2 className="text-3xl font-black text-[#0A1628] mb-8">Latest Releases</h2>
            <div className="grid grid-cols-1 gap-6">
               {pressReleases.map((pr, idx) => (
                  <a key={idx} href={pr.link} className="block bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all group">
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">{pr.date}</p>
                     <h3 className="text-xl lg:text-2xl font-black text-[#0A1628] group-hover:text-blue-600 transition-colors mb-4">{pr.title}</h3>
                     <span className="text-blue-600 font-bold text-sm tracking-wide">Read full release &rarr;</span>
                  </a>
               ))}
            </div>
         </div>

         {/* Right Side: Media Kit */}
         <div className="lg:w-1/3 space-y-8">
            <div className="bg-[#0A1628] text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-[40px] pointer-events-none" />
               <h3 className="text-2xl font-black mb-4 relative z-10">Brand Assets</h3>
               <p className="text-slate-300 font-medium mb-6 relative z-10 leading-relaxed">
                  Looking for logos, color palettes, and product screenshots? Download our official media kit.
               </p>
               <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors relative z-10 shadow-lg">
                  Download Media Kit (.zip)
               </button>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="text-xl font-black text-[#0A1628] mb-2">Company Facts</h3>
               <ul className="space-y-4 mt-6">
                  <li className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                     <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Founded</div>
                     <div className="text-lg font-black text-[#0A1628]">2022</div>
                  </li>
                  <li className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                     <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Headquarters</div>
                     <div className="text-lg font-black text-[#0A1628]">San Francisco, CA</div>
                  </li>
                  <li className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                     <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Customers</div>
                     <div className="text-lg font-black text-[#0A1628]">2,500+</div>
                  </li>
               </ul>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
