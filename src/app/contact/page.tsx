"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-[#0A1628] font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      {/* Background Decorators */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none opacity-50 z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none opacity-50 z-0" />

      {/* Main Container */}
      <section className="relative z-10 pt-32 pb-24 lg:pt-48 lg:pb-32 min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
           
           <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              
              {/* Left Side: Contact Information */}
              <div>
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="inline-block bg-white/5 text-slate-300 border border-white/10 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
                 >
                   Get in touch
                 </motion.div>
                 
                 <motion.h1 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 }}
                   className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6"
                 >
                   Let's talk about unifying your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">workspace</span>.
                 </motion.h1>
                 
                 <motion.p 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                   className="text-lg text-slate-400 mb-12 max-w-xl leading-relaxed"
                 >
                   Whether you have questions about scaling your payroll, managing international contractors, or custom Enterprise pricing—our team is ready to help.
                 </motion.p>
                 
                 <div className="grid sm:grid-cols-2 gap-8 lg:max-w-xl">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative group overflow-hidden">
                       <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <div className="text-3xl mb-4 text-cyan-400">✉️</div>
                       <h3 className="text-white font-bold mb-2">Support</h3>
                       <p className="text-slate-400 text-sm mb-4">We reply to most emails within 24 hours.</p>
                       <a href="mailto:support@circleworks.com" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">support@circleworks.com</a>
                    </div>
                    
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative group overflow-hidden">
                       <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <div className="text-3xl mb-4 text-cyan-400">🤝</div>
                       <h3 className="text-white font-bold mb-2">Sales</h3>
                       <p className="text-slate-400 text-sm mb-4">Call our enterprise team directly.</p>
                       <a href="tel:+18001234567" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">+1 (800) 123-4567</a>
                    </div>
                    
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 sm:col-span-2 relative group overflow-hidden">
                       <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <div className="text-3xl mb-4 text-cyan-400">📍</div>
                       <h3 className="text-white font-bold mb-2">HQ Address</h3>
                       <p className="text-slate-400 text-sm mb-1">100 Market Street, Suite 500</p>
                       <p className="text-slate-400 text-sm mb-0">San Francisco, CA 94104</p>
                    </div>
                 </div>
              </div>
              
              {/* Right Side: Form */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                 <div className="bg-white rounded-[2rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden h-full">
                    {submitted ? (
                       <div className="h-full min-h-[400px] flex flex-col justify-center items-center text-center">
                          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm ring-8 ring-emerald-50">
                             ✨
                          </div>
                          <h3 className="text-2xl font-black text-[#0A1628] mb-4">Message Sent!</h3>
                          <p className="text-slate-500 mb-8 max-w-sm">
                             Thank you for reaching out. A specialist from our team will be in touch within the next business day.
                          </p>
                          <button 
                             onClick={() => setSubmitted(false)}
                             className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                          >
                             Send another message
                          </button>
                       </div>
                    ) : (
                       <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
                          <h3 className="text-2xl font-black text-[#0A1628] mb-8">Contact Sales</h3>
                          
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">First Name <span className="text-red-500">*</span></label>
                                <input required type="text" placeholder="Sarah" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-medium shadow-sm" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Last Name <span className="text-red-500">*</span></label>
                                <input required type="text" placeholder="Connor" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-medium shadow-sm" />
                             </div>
                          </div>
                          
                          <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-700">Work Email <span className="text-red-500">*</span></label>
                             <input required type="email" placeholder="sarah@company.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-medium shadow-sm" />
                          </div>
                          
                          <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-700">Company Size <span className="text-red-500">*</span></label>
                             <div className="relative">
                                <select required defaultValue="" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-medium shadow-sm pr-10">
                                   <option value="" disabled>Select an option</option>
                                   <option value="1-50">1 - 50 Employees</option>
                                   <option value="51-200">51 - 200 Employees</option>
                                   <option value="201-1000">201 - 1,000 Employees</option>
                                   <option value="1000+">1,000+ Employees</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-700">How can we help? <span className="text-red-500">*</span></label>
                             <textarea required placeholder="Tell us about your current payroll setup and what you're looking to achieve..." rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-medium shadow-sm resize-none"></textarea>
                          </div>
                          
                          <button type="submit" className="w-full relative py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl overflow-hidden group shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 mt-4">
                             <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                             <span className="relative z-10">Submit Request</span>
                          </button>
                       </form>
                    )}
                 </div>
              </motion.div>
              
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
