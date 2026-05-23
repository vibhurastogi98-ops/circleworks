import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Building2, CheckCircle2, Copy, Share2 } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Referral Program | CircleWorks",
  description: "Refer a company to CircleWorks and earn $300 in account credit after their first payroll run.",
};

const steps = [
  {
    title: "Share link",
    description: "Send your referral link to a business that needs cleaner payroll and HR operations.",
    icon: Share2,
  },
  {
    title: "Company signs up",
    description: "Your referred company creates a CircleWorks account and starts onboarding payroll.",
    icon: Building2,
  },
  {
    title: "You earn $300",
    description: "Credit is added after the company completes its first payroll run.",
    icon: BadgeDollarSign,
  },
];

export default function ReferralPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="border-b border-blue-100 bg-white pt-32 pb-20 lg:pt-40">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
              CircleWorks Referral Program
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-[#0A1628] sm:text-5xl lg:text-6xl">
              Refer a company. Earn $300 credit.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Know a business struggling with payroll? Send them CircleWorks and earn rewards.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/me/referrals"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Open referral portal
                <ArrowRight size={17} />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50"
              >
                Start CircleWorks
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-6 shadow-sm">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Reward value</p>
                  <p className="mt-1 text-4xl font-black text-[#0A1628]">$300</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <BadgeDollarSign size={24} />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  "No limit on referrals",
                  "Credits apply to your subscription",
                  "Cash out after $600 accumulated",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <CheckCircle2 size={17} className="text-blue-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">How it works</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628]">Three steps to referral credit</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <step.icon size={22} />
                  </div>
                  <span className="text-sm font-black text-blue-200">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-black text-[#0A1628]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-blue-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Program details</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628]">Simple rewards. Clear timing.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-sm leading-7 text-slate-700">
                You earn $300 account credit when your referred company completes their first payroll run.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-sm leading-7 text-slate-700">
                No limit on referrals. Credits apply to your subscription. Cash out after $600 accumulated.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-5 rounded-lg border border-slate-200 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-[#0A1628]">Referral credit applies within 30 days of first payroll run.</p>
              <p className="mt-1 text-sm text-slate-500">See full referral terms.</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/me/referrals"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                <Copy size={16} />
                Get referral link
              </Link>
              <Link
                href="/terms"
                className="inline-flex items-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50"
              >
                Full terms
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
