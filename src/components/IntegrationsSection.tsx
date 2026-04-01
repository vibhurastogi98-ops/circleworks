"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const INTEGRATIONS = [
  { name: "QuickBooks", abbr: "QB", color: "#2CA01C" },
  { name: "Slack", abbr: "SL", color: "#4A154B" },
  { name: "Okta", abbr: "OK", color: "#007DC1" },
  { name: "Google Workspace", abbr: "GW", color: "#4285F4" },
  { name: "Checkr", abbr: "CR", color: "#1B9CFC" },
  { name: "DocuSign", abbr: "DS", color: "#FFCD00" },
  { name: "Guideline", abbr: "GL", color: "#00B386" },
  { name: "Xero", abbr: "XE", color: "#13B5EA" },
  { name: "ADP", abbr: "AD", color: "#E31B23" },
  { name: "Greenhouse", abbr: "GH", color: "#24A47F" },
  { name: "Plaid", abbr: "PL", color: "#111111" },
  { name: "Stripe", abbr: "ST", color: "#635BFF" },
  { name: "Postmark", abbr: "PM", color: "#FFDE00" },
  { name: "Twilio", abbr: "TW", color: "#F22F46" },
  { name: "GitHub", abbr: "GI", color: "#24292F" },
  { name: "Salesforce", abbr: "SF", color: "#00A1E0" },
];

const LogoTile = ({ name, abbr, color }: { name: string; abbr: string; color: string }) => (
  <div className="group flex-shrink-0 flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3.5 mx-2.5 min-w-[180px] grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-default select-none">
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-[13px] tracking-tight shadow-sm"
      style={{ backgroundColor: color }}
    >
      {abbr}
    </div>
    <span className="text-slate-700 font-semibold text-[14px] whitespace-nowrap">{name}</span>
  </div>
);

export default function IntegrationsSection() {
  // Double the list for seamless infinite scroll
  const row1 = [...INTEGRATIONS, ...INTEGRATIONS];
  const row2 = [...INTEGRATIONS.slice().reverse(), ...INTEGRATIONS.slice().reverse()];

  return (
    <section className="bg-slate-50 py-16 w-full border-t border-slate-200 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 mb-10 text-center">
        <h2 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tight leading-tight mb-4">
          Connects with Every Tool Creators, Agencies & Companies Already Use
        </h2>
        <p className="text-slate-500 text-[18px] font-medium max-w-2xl mx-auto">
          QuickBooks, Slack, Stripe, DocuSign, and 50+ more — your stack stays intact.
        </p>
      </div>

      {/* Marquee Row 1 → scrolls left */}
      <div className="relative w-full mb-4">
        <div className="flex animate-marquee-left">
          {row1.map((item, i) => (
            <LogoTile key={`r1-${i}`} {...item} />
          ))}
        </div>
      </div>

      {/* Marquee Row 2 → scrolls right */}
      <div className="relative w-full">
        <div className="flex animate-marquee-right">
          {row2.map((item, i) => (
            <LogoTile key={`r2-${i}`} {...item} />
          ))}
        </div>
      </div>

      {/* Link */}
      <div className="text-center mt-10">
        <Link
          href="/integrations"
          className="inline-flex items-center gap-2 text-blue-600 font-bold text-[15px] hover:text-blue-700 transition-colors group"
        >
          See all 50+ integrations
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
