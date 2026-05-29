import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Share2,
  UserCheck,
} from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Referral Program | CircleWorks",
  description:
    "Refer a company to CircleWorks and earn $300 in account credit after their first paid payroll run.",
};

const steps = [
  {
    title: "Share your unique link",
    description:
      "Copy your personal referral URL, share via email, LinkedIn, or Twitter.",
    icon: Share2,
  },
  {
    title: "Your contact signs up",
    description:
      "They create a CircleWorks account using your link.",
    icon: UserCheck,
  },
  {
    title: "You earn $300 credit",
    description:
      "Credit is applied to your account when they complete their first paid payroll run.",
    icon: DollarSign,
  },
];

const programDetails = [
  "You earn $300 account credit once your referral completes their first payroll run.",
  "No limit on referrals.",
  "Credits apply to your monthly subscription.",
  "Cash out after $600 accumulated (every 2 referrals).",
  "Your referral gets 1 month free on Pro plan.",
];

export default async function ReferralPage() {
  const session = await getSession();
  const referralHref = session ? "/me/referrals" : "/login?next=/me/referrals";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
            CircleWorks Referral Program
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-tight tracking-tight text-[#0A1628] sm:text-5xl lg:text-6xl">
            Refer a company. Earn $300 credit.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg font-medium leading-8 text-slate-600">
            Know a business struggling with payroll? Send them CircleWorks and earn real
            rewards when they run their first payroll.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={referralHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Get My Referral Link
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#terms"
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-black text-slate-800 transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              See Terms
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628] md:text-4xl">
              Three steps to referral credit
            </h2>
          </div>

          <div className="relative grid gap-6 md:grid-cols-3">
            <div className="absolute left-[16.5%] right-[16.5%] top-10 hidden h-1 rounded-full bg-blue-100 md:block" />
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm"
                >
                  <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <Icon className="h-9 w-9" aria-hidden="true" />
                  </div>
                  <div className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-blue-600">
                    Step {index + 1}
                  </div>
                  <h3 className="mt-3 text-xl font-black text-[#0A1628]">{step.title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="terms" className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-blue-100 border-l-4 border-l-blue-600 bg-white p-8 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">
              Program Details
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628]">
              Simple rewards. Clear timing.
            </h2>
            <div className="mt-7 grid gap-4">
              {programDetails.map((detail) => (
                <div key={detail} className="flex items-start gap-3 text-base font-semibold text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-2xl bg-[#0A1628] p-8 text-center text-white">
            <h2 className="text-2xl font-black">Ready to share CircleWorks?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-300">
              Generate your link, track referral status, and see credit progress in your
              referral portal.
            </p>
            <Link
              href={referralHref}
              className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-[#0A1628] transition hover:bg-blue-50"
            >
              Get My Link
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
