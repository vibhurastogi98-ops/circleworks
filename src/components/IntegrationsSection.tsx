"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, MessageSquare, ShieldCheck, Globe, FileCheck, FileText, Heart, Landmark, Activity, CreditCard, Terminal } from "lucide-react";

const INTEGRATIONS = [
  { name: "QuickBooks", color: "#2CA01C" },
  { name: "Slack", color: "#4A154B" },
  { name: "Okta", color: "#007DC1" },
  { name: "Google Workspace", color: "#4285F4" },
  { name: "Checkr", color: "#1B9CFC" },
  { name: "DocuSign", color: "#FFCD00" },
  { name: "Guideline", color: "#00B386" },
  { name: "Xero", color: "#13B5EA" },
  { name: "ADP", color: "#E31B23" },
  { name: "Greenhouse", color: "#24A47F" },
  { name: "Plaid", color: "#111111" },
  { name: "Stripe", color: "#635BFF" },
  { name: "Postmark", color: "#FFDE00" },
  { name: "Twilio", color: "#F22F46" },
  { name: "GitHub", color: "#24292F" },
  { name: "Salesforce", color: "#00A1E0" },
];

const LogoTile = ({ name, color }: { name: string; color: string }) => {
  const IconMap: Record<string, React.ElementType> = {
    QuickBooks: Landmark,
    Slack: MessageSquare,
    Okta: ShieldCheck,
    "Google Workspace": Globe,
    Checkr: FileCheck,
    DocuSign: FileText,
    Guideline: Heart,
    Xero: Landmark,
    ADP: Landmark,
    Greenhouse: Activity,
    Plaid: ShieldCheck,
    Stripe: CreditCard,
    Postmark: Zap,
    Twilio: MessageSquare,
    GitHub: Terminal,
    Salesforce: Globe,
  };

  const Icon = IconMap[name] || Zap;

  return (
    <div className="group flex-shrink-0 flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3.5 mx-2.5 min-w-[180px] grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-default select-none">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        <Icon size={18} />
      </div>
      <span className="text-slate-700 font-semibold text-[14px] whitespace-nowrap">{name}</span>
    </div>
  );
};

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
