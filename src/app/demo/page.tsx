"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MonitorPlay, Calendar, Users, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/Footer";

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-[#0A1628] selection:bg-blue-500/30 selection:text-white">
      <Navbar />
      
      {/* Mesh Background */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <section className="relative z-10 pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left Column: Value Prop */}
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[12px] font-bold uppercase tracking-[0.15em] mb-8"
              >
                <MonitorPlay size={14} className="animate-pulse" />
                Live Product Walkthrough
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8"
              >
                See <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">CircleWorks</span> in action.
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed mb-12 font-medium"
              >
                Schedule a 15-minute personalized demo with a product specialist. We'll show you how to automate your entire HR stack.
              </motion.p>

              {/* Social Proof */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-[#0A1628] bg-slate-800 overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-0.5 text-amber-400 mb-1">
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <p className="text-sm text-slate-400 font-bold tracking-wide uppercase">Trusted by 5,000+ Teams</p>
                  </div>
                </div>

                <div className="grid gap-4 max-w-md">
                  {[
                    "Native US Payroll + Tax Filing",
                    "Integrated ATS & Onboarding",
                    "Multi-state Compliance Automation",
                    "Board-ready People Analytics"
                  ].map(feature => (
                    <div key={feature} className="flex items-center gap-3 text-slate-300 font-medium">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <CheckCircle2 size={12} strokeWidth={3} />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden h-fit"
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="py-12 flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl mb-8 shadow-sm ring-8 ring-emerald-50">
                      📅
                    </div>
                    <h2 className="text-3xl font-black text-[#0A1628] mb-4 tracking-tight">Demo Scheduled!</h2>
                    <p className="text-slate-500 mb-10 max-w-xs font-medium">
                      Check your email for the calendar invitation and meeting link. We look forward to talking!
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all hover:scale-[1.02]"
                    >
                      Reschedule Demo
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="form">
                    <h2 className="text-2xl font-black text-[#0A1628] mb-8 flex items-center gap-3">
                      <Calendar className="text-blue-600" />
                      Pick a demo slot
                    </h2>
                    
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">First Name</label>
                          <input required type="text" placeholder="Alex" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Last Name</label>
                          <input required type="text" placeholder="Smith" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Work Email</label>
                        <input required type="email" placeholder="alex@company.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Company Size</label>
                        <select required defaultValue="" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat">
                          <option value="" disabled>Select employees</option>
                          <option value="1-20">1 - 20</option>
                          <option value="21-100">21 - 100</option>
                          <option value="101-500">101 - 500</option>
                          <option value="501+">501+</option>
                        </select>
                      </div>

                      <button type="submit" className="w-full relative py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl overflow-hidden group shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 mt-4">
                        <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Book Demo <ArrowRight size={20} />
                        </span>
                      </button>
                      
                      <p className="text-[11px] text-slate-400 text-center font-bold uppercase tracking-widest mt-4">
                        Available Monday — Friday, 9am - 6pm EST
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
