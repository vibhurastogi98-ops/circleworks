"use client";

import React from "react";
import { ArrowRight, UserPlus, Cog, CreditCard } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    icon: UserPlus,
    title: "Tell Us About Your Team",
    body: "Share your roster — full-timers, contractors, and creator talent. We map your payroll structure, compliance needs, and benefits requirements in a free onboarding call.",
    color: "blue",
  },
  {
    icon: Cog,
    title: "We Set Everything Up",
    body: "Our team handles all the technical setup — state registrations, tax configs, contracts, and employee onboarding. You don't touch a single form.",
    color: "cyan",
  },
  {
    icon: CreditCard,
    title: "We Run It Every Pay Cycle",
    body: "Every payday, we process payroll, file taxes, and send your team a summary. You approve in one click. We handle the rest — every single time.",
    color: "emerald",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-24 w-full">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-blue-600 text-[13px] font-black uppercase tracking-[0.2em] mb-4">HOW WE WORK</span>
          <h2 className="text-[36px] md:text-[48px] font-black text-slate-900 leading-tight mb-5 tracking-tight">
            From Signed to Paid in 3 Simple Steps
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-[2px] bg-slate-100 z-0" />
          
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
              <div className={`w-[120px] h-[120px] rounded-full flex items-center justify-center mb-8 border-8 border-white shadow-xl transition-transform duration-500 group-hover:scale-110 bg-${step.color}-600 text-white`}>
                <step.icon size={48} />
              </div>
              
              <div className="bg-white px-4">
                <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">Step {idx + 1}</div>
                <h3 className="text-[22px] font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-[16px] shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all"
          >
            Book Your Free Onboarding Call <ArrowRight size={20} />
          </Link>
        </div>

      </div>
    </section>
  );
}
