"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Rocket, Check, ShieldCheck, Zap, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/Footer";

export default function TrialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: ""
  });

  return (
    <main className="min-h-screen bg-[#0A1628] selection:bg-blue-500/30 selection:text-white">
      <Navbar />
      
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <section className="relative z-10 pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left Column: Trial Value Prop */}
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-bold uppercase tracking-[0.15em] mb-8"
              >
                <Zap size={14} className="fill-emerald-400" />
                30-Day Risk-Free Trial
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8"
              >
                Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Future</span> of HR.
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed mb-12 font-medium"
              >
                Run payroll, manage benefits, and hire top talent in one unified platform. No credit card required. Cancel anytime.
              </motion.p>

              <div className="space-y-6 max-w-md">
                {[
                  "Full access to all platform features",
                  "Free implementation specialist support",
                  "Unlimited payroll runs for 30 days",
                  "Automated multi-state tax setup"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-4 text-slate-200 font-bold tracking-wide">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-emerald-500/20">
                      <Check size={14} strokeWidth={4} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              
              <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10 flex items-start gap-5">
                 <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah Connor" className="w-14 h-14 rounded-full border-2 border-blue-500/50" />
                 <div>
                    <p className="text-slate-300 italic mb-3 font-medium">"Setting up CircleWorks took less than 10 minutes. It's the most intuitive payroll platform we've ever used."</p>
                    <p className="text-white font-bold text-sm">Sarah C. <span className="text-slate-500 font-medium ml-2">CEO @ Vanta Labs</span></p>
                 </div>
              </div>
            </div>

            {/* Right Column: Trial Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
            >
                 <div className="flex flex-col">
                   <h2 className="text-2xl font-black text-[#0A1628] mb-8">Start your free trial</h2>
                   <form className="space-y-5" onSubmit={(e) => { 
                      e.preventDefault(); 
                      setLoading(true);
                      // Persistent Context: Save signup progress for dashboard onboarding
                      localStorage.setItem("circleworks_signup_progress", JSON.stringify({
                        name: formData.name,
                        companyName: formData.companyName,
                        timestamp: new Date().toISOString()
                      }));
                      // Delay slightly for effect then redirect to Clerk
                      setTimeout(() => {
                        router.push("/sign-up");
                      }, 1000);
                   }}>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Full Name</label>
                        <input 
                          required 
                          type="text" 
                          placeholder="Sarah Connor" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" 
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Work Email</label>
                        <input 
                          required 
                          type="email" 
                          placeholder="sarah@company.com" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" 
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Company Name</label>
                        <input 
                          required 
                          type="text" 
                          placeholder="Acme Inc." 
                          value={formData.companyName}
                          onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" 
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full relative py-5 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-black rounded-2xl overflow-hidden group shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {loading ? (
                            <>Creating account... <Loader2 size={20} className="animate-spin" /></>
                          ) : (
                            <>Launch Platform <ArrowRight size={20} /></>
                          )}
                        </span>
                      </button>
                      
                      <p className="text-[12px] text-slate-500 text-center font-medium mt-4">
                        By signing up, you agree to our <Link href="/legal/terms" className="text-blue-600 font-bold hover:underline">Terms of Service</Link>.
                      </p>
                   </form>

                   <div className="mt-10 pt-10 border-t border-slate-100 flex items-center justify-between text-slate-400">
                      <div className="flex flex-col items-center">
                        <ShieldCheck size={20} className="text-blue-500 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Secure TLS</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Rocket size={20} className="text-amber-500 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Fast Setup</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Check size={20} className="text-emerald-500 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Risk Free</span>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
