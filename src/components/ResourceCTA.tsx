"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ResourceCTAProps {
  title?: string;
  description?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
}

export default function ResourceCTA({ 
  title = "Ready to build your team on a solid base?", 
  description = "Join 1,000+ businesses who handle payroll, benefits, and compliance in one native platform.",
  primaryCTA = { label: "Get Started Free", href: "/pricing" },
  secondaryCTA = { label: "Book a Demo", href: "/contact" }
}: ResourceCTAProps) {
  return (
    <section className="py-24 bg-[#0A1628] relative overflow-hidden text-white border-t border-white/5">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black mb-6"
        >
          {title}
        </motion.h2>
        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Link href={primaryCTA.href} className="px-8 py-4 bg-white text-[#0A1628] font-bold rounded-xl hover:scale-105 transition-transform shadow-lg">{primaryCTA.label}</Link>
           <Link href={secondaryCTA.href} className="px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-colors">{secondaryCTA.label}</Link>
        </div>
        <p className="mt-8 text-xs font-mono text-slate-500 uppercase tracking-widest opacity-60">
           No credit card required • 30-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}
