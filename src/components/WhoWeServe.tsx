"use client";

import React from "react";
import { User, Users, Building, ArrowRight } from "lucide-react";
import Link from "next/link";

const CARDS = [
  {
    icon: User,
    title: "Individual Creators",
    body: "Whether you have 2 team members or 20 contractors, we handle your back-office so you can stay in your creative zone. S-corps, LLCs, sole props — we do it all.",
    color: "rose",
  },
  {
    icon: Users,
    title: "Talent & Creator Agencies",
    body: "Managing rosters of talent across states and contracts? We're your outsourced HR team. Fast onboarding, clean payments, and zero compliance risk.",
    color: "blue",
  },
  {
    icon: Building,
    title: "Media & Content Companies",
    body: "Studios, production houses, and content brands trust us to run payroll for blended teams — full-time staff and freelance creators — without missing a single filing.",
    color: "indigo",
  },
];

export default function WhoWeServe() {
  return (
    <section className="bg-slate-50 py-24 w-full border-t border-slate-200">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-blue-600 text-[13px] font-black uppercase tracking-[0.2em] mb-4">WHO WE SERVE</span>
          <h2 className="text-[36px] md:text-[48px] font-black text-slate-900 leading-tight mb-5 tracking-tight">
            Built for the People Powering the Creator Economy
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CARDS.map((card, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col group h-full">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-${card.color}-50 text-${card.color}-600`}>
                <card.icon size={32} />
              </div>
              <h3 className="text-[22px] font-bold text-slate-900 mb-4">{card.title}</h3>
              <p className="text-slate-500 text-[16px] leading-relaxed mb-8 flex-1">
                {card.body}
              </p>
              <Link 
                href="/demo" 
                className={`text-${card.color}-600 font-bold flex items-center gap-2 hover:gap-3 transition-all`}
              >
                Learn More <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
