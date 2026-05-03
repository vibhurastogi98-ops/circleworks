"use client";

import React from "react";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const BULLETS = [
  "30-day free trial — no credit card",
  "Set up in under 24 hours",
  "Cancel anytime",
];

export default function CtaSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0A1628] py-24">
      {/* Animated mesh background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[50vw] h-[50vw] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute -bottom-20 -right-20 w-[45vw] h-[45vw] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Eyebrow */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-[12px] font-bold uppercase tracking-[0.15em] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Limited-time offer — 30 days free
        </span>

        <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-black text-white tracking-tight leading-[1.1] mb-6">
          Ready to Run Your Creator Business, Agency, or Company on One Platform?
        </h2>

        {/* Subheadline */}
        <p className="text-[17px] md:text-[19px] text-slate-300 max-w-xl leading-relaxed mb-8 font-medium">
          Join 500+ creators, agencies, and companies that trust CircleWorks for Payroll & HR — so they can focus on building, not admin.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mb-8">
          <Link
            href="/signup"
            className="h-[56px] px-8 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] text-white font-semibold text-[16px] flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto"
          >
            Start Free
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/demo"
            className="h-[56px] px-8 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-[16px] flex items-center justify-center gap-2 hover:bg-white hover:text-[#0A1628] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto"
          >
            Book a Demo
          </Link>
        </div>

        {/* Trust bullets */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px] text-slate-400 font-medium">
          {BULLETS.map((b) => (
            <span key={b} className="flex items-center gap-1.5">
              <Check size={14} className="text-cyan-400" />
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
