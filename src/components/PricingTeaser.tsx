"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingTeaser() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="bg-white py-20 w-full relative z-10">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center flex flex-col items-center mb-16">
          <h2 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tight leading-tight mb-4">
            Transparent Pricing for Growing Agencies
          </h2>
          <p className="text-[18px] text-slate-500 font-medium">
            Scale from 5 to 500+ — no hidden fees, no surprises, cancel anytime.
          </p>
          
          {/* TAB TOGGLE */}
          <div className="mt-8 flex items-center bg-slate-100 p-1.5 rounded-full border border-slate-200">
            <button
              onClick={() => setIsAnnual(false)}
              className={`relative px-6 py-2.5 rounded-full text-[14px] font-bold transition-colors ${
                !isAnnual ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Monthly
              {!isAnnual && (
                <motion.div
                  layoutId="pricing-tab-indicator"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`relative px-6 py-2.5 rounded-full text-[14px] font-bold transition-colors flex items-center gap-2 ${
                isAnnual ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Annual
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-widest leading-none">
                Save 20%
              </span>
              {isAnnual && (
                <motion.div
                  layoutId="pricing-tab-indicator"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* PRICING CARDS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center max-w-5xl mx-auto mb-10">
          
          {/* STARTER CARD */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 flex flex-col h-[460px] shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-[20px] font-bold text-slate-900 mb-2">Agency Starter</h3>
            <div className="min-h-[80px] flex flex-col justify-start">
              <div className="text-[14px] text-slate-500 font-semibold mb-1">Free base +</div>
              <div className="flex items-end gap-1 text-slate-900">
                <span className="text-[36px] font-black leading-none tracking-tighter">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={isAnnual ? "starter-ann-8" : "starter-mo-10"}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      ${isAnnual ? "8" : "10"}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="text-[15px] font-medium text-slate-500 mb-1">/employee/mo</span>
              </div>
            </div>
            
            <Link 
              href="/signup"
              className="mt-8 mb-8 w-full py-3.5 rounded-xl border-2 border-blue-600 text-blue-600 font-bold text-[15px] hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              Start Free Trial
            </Link>
            <div className="flex flex-col gap-4 mt-auto border-t border-slate-100 pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <span className="text-slate-600 font-medium text-[15px] leading-tight">Full-service payroll in 50 states</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <span className="text-slate-600 font-medium text-[15px] leading-tight">Basic onboarding & offboarding</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <span className="text-slate-600 font-medium text-[15px] leading-tight">Employee self-service portal</span>
              </div>
            </div>
          </div>

          {/* PRO CARD (FEATURED) */}
          <div className="relative bg-white rounded-2xl p-8 flex flex-col h-[500px] shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] md:scale-[1.03] z-10 border-0">
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-400 to-indigo-600 -z-20 p-[3px]">
              <div className="absolute inset-0 bg-white rounded-xl z-[-10]" />
            </div>

            <div className="absolute -top-4 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-[12px] font-black tracking-widest uppercase shadow-md shadow-blue-500/30">
              Most Popular
            </div>

            <h3 className="text-[20px] font-bold text-slate-900 mb-2">Agency Pro</h3>
            <div className="min-h-[80px] flex flex-col justify-start">
              <div className="text-[14px] text-blue-600 font-bold mb-1 flex items-center gap-1">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={isAnnual ? "pro-ann-base" : "pro-mo-base"}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block"
                  >
                    ${isAnnual ? "59" : "79"}/mo base +
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="flex items-end gap-1 text-slate-900">
                <span className="text-[36px] font-black leading-none tracking-tighter">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={isAnnual ? "pro-ann-14" : "pro-mo-18"}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      ${isAnnual ? "14" : "18"}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="text-[15px] font-medium text-slate-500 mb-1">/employee/mo</span>
              </div>
            </div>
            
            <Link 
              href="/signup"
              className="mt-8 mb-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[15px] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center"
            >
              Start Free Trial
            </Link>
            <div className="flex flex-col gap-4 mt-auto border-t border-slate-100 pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-slate-800 font-bold text-[15px] leading-tight">Everything in Agency Starter, plus:</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-slate-600 font-medium text-[15px] leading-tight">Time tracking & PTO management</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-slate-600 font-medium text-[15px] leading-tight">Automated state tax configurations</span>
              </div>
            </div>
          </div>

          {/* ENTERPRISE CARD */}
          <div className="bg-[#0A1628] border-2 border-slate-800 rounded-2xl p-8 flex flex-col h-[460px] shadow-xl">
            <h3 className="text-[20px] font-bold text-white mb-2">Studio Enterprise</h3>
            <div className="min-h-[80px] flex flex-col justify-start">
              <div className="text-[14px] text-slate-400 font-semibold mb-1">For large teams</div>
              <div className="flex items-end gap-1 text-white">
                <span className="text-[36px] font-black leading-none tracking-tighter">Custom</span>
                <span className="text-[15px] font-medium text-slate-400 mb-1"> pricing</span>
              </div>
            </div>
            
            <Link 
              href="/contact"
              className="mt-8 mb-8 w-full py-3.5 rounded-xl bg-white text-[#0A1628] font-bold text-[15px] hover:bg-slate-100 transition-colors flex items-center justify-center"
            >
              Talk to Sales
            </Link>
            <div className="flex flex-col gap-4 mt-auto border-t border-slate-800 pt-6">
               <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-white font-bold text-[15px] leading-tight">Everything in Agency Pro, plus:</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 font-medium text-[15px] leading-tight">Dedicated Support Manager</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 font-medium text-[15px] leading-tight">Custom ATS & API Integrations</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM LINK */}
        <div className="text-center mt-12">
          <Link href="/pricing" className="inline-flex items-center gap-2 text-blue-600 font-bold text-[16px] hover:text-blue-700 transition-colors group">
             See full pricing & feature comparison
             <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
