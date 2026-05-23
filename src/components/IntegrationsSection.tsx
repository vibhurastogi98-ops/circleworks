"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  MessageSquare,
  ShieldCheck,
  Globe,
  FileCheck,
  FileText,
  Heart,
  Landmark,
  Activity,
  CreditCard,
  Terminal,
} from "lucide-react";

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
    <div className="group mx-3 flex min-w-[180px] flex-shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 opacity-60 grayscale transition-all duration-300 hover:border-slate-300 hover:opacity-100 hover:grayscale-0 hover:shadow-md">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        <Icon size={18} />
      </div>
      <span className="whitespace-nowrap text-[14px] font-semibold text-slate-700">{name}</span>
    </div>
  );
};

export default function IntegrationsSection() {
  const row1 = [...INTEGRATIONS, ...INTEGRATIONS];
  const row2 = [...INTEGRATIONS.slice().reverse(), ...INTEGRATIONS.slice().reverse()];

  return (
    <section className="w-full overflow-hidden border-t border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto mb-10 max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-balance text-[30px] font-black tracking-tight text-slate-900 md:text-[38px]">
          Connects with the tools your team already uses
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[17px] font-medium text-slate-500">
          Payroll, identity, banking, hiring, communications, and accounting integrations that fit right into your existing stack.
        </p>
      </div>

      <div className="relative mb-4 w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-slate-50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-slate-50 to-transparent" />
        <div className="flex animate-marquee-left">
          {row1.map((item, i) => (
            <LogoTile key={`r1-${i}`} {...item} />
          ))}
        </div>
      </div>

      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-slate-50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-slate-50 to-transparent" />
        <div className="flex animate-marquee-right">
          {row2.map((item, i) => (
            <LogoTile key={`r2-${i}`} {...item} />
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/integrations"
          className="group inline-flex items-center gap-2 text-[15px] font-bold text-blue-600 transition-colors hover:text-blue-700"
        >
          See all 50+ integrations
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
