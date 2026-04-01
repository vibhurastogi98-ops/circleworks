"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileUp, Download, PieChart, Users, ArrowRight } from "lucide-react";

/**
 * Templates Hub
 * Free, high-quality HR & payroll templates for scaling companies.
 */

const CATEGORIES = [
  { label: "Payroll & Tax Templates", icon: PieChart, color: "bg-blue-500", count: 12 },
  { label: "HR Policies & Handbook", icon: Users, color: "bg-emerald-500", count: 8 },
  { label: "Onboarding Checklists", icon: FileUp, color: "bg-amber-500", count: 15 }
];

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-slate-50 border-b border-slate-100 overflow-hidden text-center z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-[#0A1628] leading-[1.1] mb-6"
          >
            HR & Payroll <br/> <span className="text-emerald-600">Templates.</span>
          </motion.h1>
          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto font-medium">
            Everything you need to run high-performance HR, compliance, and payroll for free.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {CATEGORIES.map((cat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-10 rounded-3xl border border-slate-100 shadow-sm bg-white hover:shadow-xl transition-all flex flex-col items-start group"
            >
              <div className={`w-14 h-14 ${cat.color}/10 rounded-2xl flex items-center justify-center mb-8 border ${cat.color}/20 text-white`}>
                <cat.icon className={cat.color.replace('bg-', 'text-')} size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#0A1628] mb-2">{cat.label}</h3>
              <p className="text-slate-500 mb-8 font-medium">{cat.count} files available</p>
              <button className="text-[#0A1628] font-black text-sm flex items-center gap-2 group-hover:gap-3 transition-all hover:text-emerald-600">
                Browse Templates <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="bg-[#0A1628] rounded-[40px] p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
          <h2 className="text-3xl font-black text-white mb-4 relative z-10">Looking for custom templates?</h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto font-medium relative z-10">
            Tell us what kind of compliance or payroll template you need, and our experts will help build it for you.
          </p>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 px-12 rounded-2xl transition-all shadow-xl shadow-emerald-900/40 relative z-10">
            Request a Template
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
