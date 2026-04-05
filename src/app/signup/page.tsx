"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";
// Clerk v7 defaults to a Signals-based API — legacy subpath keeps the
// familiar { isLoaded, signUp } shape.
import { useSignUp } from "@clerk/nextjs/legacy";

export default function SignupPage() {
  const { isLoaded, signUp } = useSignUp();

  const handleGoogleSignup = async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A1628] flex items-center justify-center p-6 relative overflow-hidden selection:bg-blue-500/30 selection:text-white">
      {/* Mesh Background */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

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

          <h1 className="text-3xl font-black text-[#0A1628] mb-4 tracking-tight leading-[1.1]">Create your account</h1>
          <p className="text-slate-500 mb-8 font-medium">Join 5,000+ businesses scaling with CircleWorks. Start your 30-day free trial today.</p>

          <div className="space-y-4 mb-8">
            <button 
              type="button" 
              onClick={handleGoogleSignup}
              disabled={!isLoaded}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 rounded-2xl text-[#0A1628] font-bold text-[15px] shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
              </svg>
              Sign up with Google
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">or</span>
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Name</label>
              <input 
                type="text" 
                placeholder="Sarah Connor" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Work Email</label>
              <input 
                type="email" 
                placeholder="sarah@corp.com" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900" 
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-5 bg-[#0A1628] text-white font-black rounded-2xl shadow-xl shadow-blue-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
            >
              Start Free Trial
            </button>

            <div className="pt-6 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 font-bold hover:underline">Log In</Link>
              </p>
            </div>
          </form>

          {/* Social Proof */}
          <div className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-2 gap-4">
             <div className="flex items-center gap-2 text-slate-400">
               <ShieldCheck size={16} className="text-emerald-500" />
               <span className="text-[11px] font-bold uppercase tracking-widest">SOC-2 Type II</span>
             </div>
             <div className="flex items-center gap-2 text-slate-400">
               <Zap size={16} className="text-amber-500" />
               <span className="text-[11px] font-bold uppercase tracking-widest">Setup in 5m</span>
             </div>
          </div>
        </motion.div>
        
        <p className="mt-8 text-center text-slate-500 text-xs font-medium max-w-[280px] mx-auto">
          By continuing, you agree to our <Link href="/legal/terms" className="underline">Terms</Link> and <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
