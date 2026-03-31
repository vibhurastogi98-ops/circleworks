"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Key, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0A1628] flex items-center justify-center p-6 relative overflow-hidden selection:bg-blue-500/30 selection:text-white">
      {/* Mesh Background */}
      <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#0A1628" strokeWidth="3" />
              <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-[20px] font-black text-[#0A1628] tracking-tight">CircleWorks</span>
          </div>

          <h1 className="text-3xl font-black text-[#0A1628] mb-4 tracking-tight leading-[1.1]">Log in to your account</h1>
          <p className="text-slate-500 mb-8 font-medium">Access your unified workplace dashboard.</p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Work Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 shadow-inner" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1 pr-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Password</label>
                <Link href="/help" className="text-xs font-bold text-blue-600 hover:underline">Forgot?</Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Key size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 shadow-inner" 
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-5 bg-[#0A1628] text-white font-black text-[16px] rounded-2xl shadow-xl shadow-blue-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
            >
              Sign In
            </button>

            <div className="pt-6 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-600 font-bold hover:underline">Sign Up</Link>
              </p>
            </div>
          </form>

          {/* Identity Verification */}
          <div className="mt-10 pt-10 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
             <ShieldCheck size={16} className="text-blue-500" />
             <span className="text-[11px] font-black uppercase tracking-[0.1em]">Bank-Level 256-bit AES Encryption</span>
          </div>
        </motion.div>
        
        <div className="mt-8 flex items-center justify-center gap-6">
          <Link href="/help" className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Help</Link>
          <Link href="/status" className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Status</Link>
          <Link href="/legal/privacy" className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Privacy</Link>
        </div>
      </div>
    </main>
  );
}
