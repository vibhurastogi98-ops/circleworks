"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Minus,
  ChevronDown,
  Users,
  Building2,
  BarChart3,
  ArrowRight,
  Phone,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import ResponsiveContainer from "@/components/charts/MeasuredResponsiveContainer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Types ─────────────────────────────────────────────────────────────────
type BillingCycle = "monthly" | "annual";
type ComparisonValue = boolean | string;
type ComparisonRow = {
  feature: string;
  contractor: ComparisonValue;
  starter: ComparisonValue;
  pro: ComparisonValue;
  enterprise: ComparisonValue;
};

const FILING_INCLUDED_MESSAGE =
  "Tax filing included on every plan — federal, state & local, filed automatically. No hidden fees.";
const FILING_COMPARISON_MESSAGE =
  "Competitors often add filing fees at quarter-end, year-end, or for local jurisdictions. CircleWorks includes filing in every plan so payroll costs stay predictable.";

// ─── Animated Number ───────────────────────────────────────────────────────
function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [displayed, setDisplayed] = useState(value);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const duration = 400;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(from + (to - from) * ease);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
      else {
        fromRef.current = to;
        setDisplayed(to);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return (
    <span>
      {prefix}
      {decimals > 0 ? displayed.toFixed(decimals) : Math.round(displayed)}
      {suffix}
    </span>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────
const COMPARISON_TABLE: { category: string; rows: ComparisonRow[] }[] = [
  {
    category: "Core Payroll",
    rows: [
      {
        feature: "Full W-2 Payroll Processing",
        contractor: false,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "W-2 Payroll in All 50 States + DC",
        contractor: false,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Payroll Tax Filing & Payments",
        contractor: false,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Filing included — no filing add-ons",
        contractor: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "W-2 Generation",
        contractor: false,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Automatic 1099-NEC Filing",
        contractor: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Unlimited 1099 Payments",
        contractor: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Multi-state Payroll",
        contractor: false,
        starter: true,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "HR & People",
    rows: [
      {
        feature: "HRIS & Employee Records",
        contractor: false,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Onboarding Workflows",
        contractor: false,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Contractor Self-service",
        contractor: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "I-9 / E-Verify",
        contractor: false,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Hiring / ATS",
        contractor: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Benefits Administration",
        contractor: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Performance Reviews & OKRs",
        contractor: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Learning Management (LMS)",
        contractor: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Time & Finance",
    rows: [
      {
        feature: "Time Tracking & Scheduling",
        contractor: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "PTO & Leave Management",
        contractor: false,
        starter: "Basic",
        pro: true,
        enterprise: true,
      },
      {
        feature: "Expense Management",
        contractor: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Contractor Payments",
        contractor: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "International Payments",
        contractor: true,
        starter: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Intelligence & Learning",
    rows: [
      {
        feature: "Standard Reports",
        contractor: false,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Advanced Analytics",
        contractor: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "AI Circe Assistant",
        contractor: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Custom Dashboards",
        contractor: false,
        starter: false,
        pro: "5",
        enterprise: "Unlimited",
      },
    ],
  },
  {
    category: "Security & Integrations",
    rows: [
      {
        feature: "Mobile App (iOS & Android)",
        contractor: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Accountant Access",
        contractor: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "QuickBooks / Xero Sync",
        contractor: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "API + Webhooks",
        contractor: false,
        starter: false,
        pro: "Add-on",
        enterprise: true,
      },
      {
        feature: "20+ Integrations",
        contractor: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "SSO / SAML",
        contractor: false,
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        feature: "Custom Roles & Permissions",
        contractor: false,
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        feature: "Dedicated Customer Success Mgr",
        contractor: false,
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        feature: "Enterprise SLA",
        contractor: false,
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        feature: "White-label Accountant Portal",
        contractor: false,
        starter: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
];

const FAQS = [
  {
    q: "Is CircleWorks really free to start?",
    a: "Yes! The Starter plan is completely free. You pay $8/employee/mo for payroll processing, but the platform itself has no base fee, no contracts, and no setup cost.",
  },
  {
    q: "Do you charge per payroll run?",
    a: "No. Unlimited runs on every plan.",
  },
  {
    q: "How does the 60-day money-back guarantee work?",
    a: "If you upgrade to an annual Pro or Enterprise plan and aren't fully satisfied within the first 60 days, we'll refund 100% of your purchase — no questions asked.",
  },
  {
    q: "Can I switch between plans anytime?",
    a: "Absolutely. You can upgrade or downgrade at any point. Upgrading is instant; downgrades take effect at the end of your current billing period.",
  },
  {
    q: "How is pricing calculated for part-time employees?",
    a: "Every active employee on payroll in a given month counts as one 'employee seat.' Part-time, full-time, and temporary workers are all counted the same way.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No card needed for the Starter plan. You only enter payment info when you upgrade to Pro or add paid modules.",
  },
  {
    q: "What's the difference between Starter and Pro?",
    a: "Starter covers core payroll, HRIS, and compliance for smaller teams. Pro adds the full HR suite — ATS, Benefits, Time Tracking, Expenses, Performance, LMS, and AI Circe.",
  },
  {
    q: "Do you handle multi-state payroll?",
    a: "Yes. CircleWorks natively supports all 50 U.S. states and Washington D.C., including complex local taxes like NYC, Yonkers, and Pennsylvania localities.",
  },
  {
    q: "Can my accountant access CircleWorks?",
    a: "Yes! All plans include a free accountant portal where you can invite your CPA to export payroll journals, run reports, and access tax documents.",
  },
  {
    q: "What integrations come with Pro?",
    a: "Pro includes 20+ integrations: QuickBooks, Xero, Slack, Google Workspace, Checkr, Guideline 401k, Ramp, Brex, Linear, and more. Enterprise adds custom API + Webhooks.",
  },
  {
    q: "Is there a discount for nonprofits?",
    a: "Yes! 501(c)(3) organizations receive 25% off all paid plans. Contact our sales team with your determination letter to apply the discount.",
  },
];

const ENTERPRISE_LOGOS = [
  "Shopify",
  "WeWork",
  "DoorDash",
  "Samsara",
  "Toast",
  "Gusto Partners",
];

// ─── Cell renderer ─────────────────────────────────────────────────────────
function TableCell({ value }: { value: ComparisonValue }) {
  if (value === true)
    return (
      <Check className="mx-auto text-emerald-500" size={20} strokeWidth={3} />
    );
  if (value === false)
    return <Minus className="mx-auto text-slate-300" size={20} />;
  if (value === "Add-on")
    return (
      <span className="text-orange-500 font-bold text-xs bg-orange-50 px-2 py-0.5 rounded-full">
        {value}
      </span>
    );
  return <span className="text-slate-600 text-sm font-semibold">{value}</span>;
}

// ─── FAQ Item ──────────────────────────────────────────────────────────────
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border border-slate-200 rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-lg font-bold text-slate-900 pr-4">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="shrink-0 text-slate-400" size={22} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0 text-slate-600 text-[15px] leading-relaxed border-t border-slate-100 bg-white">
              <p className="pt-4">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [employees, setEmployees] = useState(25);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAnnual = billing === "annual";

  // Per-seat pricing
  const contractorBase = 35;
  const contractorSeat = 6;
  const starterSeat = isAnnual ? 6.72 : 8;
  const proBase = isAnnual ? 66 : 79;
  const proSeat = isAnnual ? 11.76 : 14;

  // Calculator numbers
  const starterCost = starterSeat * employees;
  const proCost = proBase + proSeat * employees;
  const typicalStack = employees * 45; // typical HR stack per employee

  const chartData = [
    {
      name: "CircleWorks Starter",
      cost: Math.round(starterCost),
      fill: "#3B82F6",
    },
    { name: "CircleWorks Pro", cost: Math.round(proCost), fill: "#6366F1" },
    { name: "Typical Stack", cost: Math.round(typicalStack), fill: "#94A3B8" },
  ];

  // FAQ JSON-LD
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="min-h-screen bg-white font-sans">
        <Navbar />

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 bg-[#0A1628] overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.25),transparent)]" />
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-[56px] font-black text-white leading-tight mb-5">
                Simple pricing for every US company
              </h1>
              <p className="text-xl text-slate-300 mb-6">
                No contracts. No setup fees. Cancel anytime.
              </p>

              <div className="mx-auto mb-4 flex max-w-3xl flex-col gap-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-left shadow-lg shadow-emerald-950/20 sm:flex-row sm:items-start">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400/20">
                  <Check className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">
                    {FILING_INCLUDED_MESSAGE}
                  </p>
                  <p className="mt-1 text-sm text-emerald-100/80">
                    Built into every tier, including Contractor.
                  </p>
                </div>
              </div>

              <div className="mx-auto mb-10 max-w-2xl rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300">
                {FILING_COMPARISON_MESSAGE}
              </div>

              {/* Billing Toggle */}
              <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full bg-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${billing === "monthly" ? "bg-white text-[#0A1628]" : "bg-white/10 text-slate-300 hover:bg-white/15"}`}
                  aria-pressed={billing === "monthly"}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("annual")}
                  className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-colors ${isAnnual ? "bg-white text-[#0A1628]" : "bg-white/10 text-slate-300 hover:bg-white/15"}`}
                  aria-pressed={isAnnual}
                >
                  Annual
                  <motion.span
                    animate={{ scale: isAnnual ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                    className="text-xs font-black text-emerald-900 bg-emerald-400 px-2.5 py-0.5 rounded-full"
                  >
                    Save 17%
                  </motion.span>
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── PRICING CARDS ────────────────────────────────────────────── */}
        <section className="relative z-10 -mt-12 pb-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
              {/* CONTRACTOR */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0 }}
                className="bg-white rounded-lg border border-emerald-200 p-8 shadow-lg flex flex-col"
              >
                <div className="mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    Contractor-only teams
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-4 mb-2">
                    Contractor
                  </h2>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black text-slate-900">
                      $<AnimatedNumber value={contractorBase} />
                    </span>
                    <span className="text-lg text-slate-400 font-semibold pb-1">
                      /mo base
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 text-slate-600">
                    <span className="text-2xl font-black text-emerald-600">
                      $<AnimatedNumber value={contractorSeat} />
                    </span>
                    <span className="text-sm">per paid contractor/month</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-2">
                    Billed only in months a contractor is paid
                  </p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {[
                    "Unlimited 1099 payments",
                    "Automatic 1099-NEC filing",
                    "Contractor self-service",
                    "International payments",
                    "No W-2 payroll",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-slate-700 text-sm font-medium"
                    >
                      <Check
                        className="text-emerald-500 shrink-0"
                        size={18}
                        strokeWidth={3}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup?plan=contractor"
                  id="contractor-cta"
                  className="w-full text-center px-6 py-3.5 rounded-full bg-emerald-600 text-white font-bold text-[15px] hover:bg-emerald-700 transition-colors"
                >
                  Start Free
                </Link>
              </motion.div>

              {/* STARTER */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="bg-white rounded-lg border border-[#0A1628] p-8 shadow-lg flex flex-col"
              >
                <div className="mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    Best for 1-50 employees
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-4 mb-2">
                    Starter
                  </h2>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black text-slate-900">
                      Free
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 text-slate-600">
                    <span className="text-2xl font-black text-blue-600">
                      $
                      <AnimatedNumber
                        value={starterSeat}
                        decimals={isAnnual ? 2 : 0}
                      />
                    </span>
                    <span className="text-sm">per employee/month</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-2">
                    Platform fee: $0/mo forever
                  </p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {[
                    "Full Payroll",
                    "All 50 States",
                    "HRIS",
                    "Onboarding",
                    "Compliance",
                    "I-9/E-Verify",
                    "Mobile App",
                    "Accountant Access",
                    "Standard Reports",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-slate-700 text-sm font-medium"
                    >
                      <Check
                        className="text-emerald-500 shrink-0"
                        size={18}
                        strokeWidth={3}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  id="starter-cta"
                  className="w-full text-center px-6 py-3.5 rounded-full border-2 border-blue-600 text-blue-600 font-bold text-[15px] hover:bg-blue-50 transition-colors"
                >
                  Start Free — No Card
                </Link>
              </motion.div>

              {/* PRO — featured card */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative rounded-lg p-[2px] bg-gradient-to-b from-blue-500 via-indigo-500 to-cyan-500 shadow-[0_0_60px_rgba(99,102,241,0.4)] xl:scale-[1.04] z-10 flex flex-col"
              >
                <div className="bg-white rounded-md p-8 flex flex-col h-full">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>

                  <div className="mb-6 mt-2">
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      Best for 10–250 employees
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-4 mb-2">
                      Pro
                    </h2>
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-4xl font-black text-slate-900">
                        $<AnimatedNumber value={proBase} />
                        <span className="text-lg text-slate-400 font-semibold">
                          /mo
                        </span>
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 text-slate-600">
                      <span className="text-2xl font-black text-indigo-600">
                        $
                        <AnimatedNumber
                          value={proSeat}
                          decimals={isAnnual ? 2 : 0}
                        />
                      </span>
                      <span className="text-sm">per employee/month</span>
                    </div>
                    {isAnnual && (
                      <p className="text-emerald-600 text-sm font-bold mt-2">
                        You save ${Math.round((79 - 66) * 12)}/year
                      </p>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Everything in Starter, plus:
                  </p>
                  <ul className="space-y-3 flex-1 mb-8">
                    {[
                      "ATS",
                      "Benefits Admin",
                      "Time & Scheduling",
                      "Expenses",
                      "Performance Reviews",
                      "LMS",
                      "AI Circe",
                      "Advanced Reports",
                      "20+ Integrations",
                    ].map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-3 text-slate-700 text-sm font-medium"
                      >
                        <Check
                          className="text-indigo-500 shrink-0"
                          size={18}
                          strokeWidth={3}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup"
                    id="pro-cta"
                    className="w-full text-center px-6 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[15px] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-shadow"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </motion.div>

              {/* ENTERPRISE */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="bg-[#0A1628] rounded-lg p-8 shadow-lg flex flex-col border border-white/10"
              >
                <div className="mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
                    250+ employees
                  </span>
                  <h2 className="text-2xl font-black text-white mt-4 mb-2">
                    Enterprise
                  </h2>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black text-white">
                      Custom pricing
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">
                    Built for 250+ employee companies
                  </p>
                </div>

                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Everything in Pro, plus:
                </p>
                <ul className="space-y-3 flex-1 mb-8">
                  {[
                    "SSO/SAML",
                    "Custom Roles",
                    "API + Webhooks",
                    "Dedicated CSM",
                    "SLA",
                    "White-label Accountant Portal",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-slate-300 text-sm font-medium"
                    >
                      <Check
                        className="text-cyan-400 shrink-0"
                        size={18}
                        strokeWidth={3}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  id="enterprise-cta"
                  className="w-full text-center px-6 py-3.5 rounded-full border-2 border-white/30 text-white font-bold text-[15px] hover:bg-white/10 transition-colors"
                >
                  Talk to Sales
                </Link>
              </motion.div>
            </div>

            {/* Money-back Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-3 mt-10 text-slate-600"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Check className="text-emerald-600" size={18} strokeWidth={3} />
              </div>
              <span className="font-semibold text-[15px]">
                <strong className="text-slate-900">
                  60-day money-back guarantee
                </strong>{" "}
                on annual plans
              </span>
            </motion.div>
          </div>
        </section>

        {/* ── FEATURE COMPARISON TABLE ──────────────────────────────────── */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-black text-slate-900 mb-3">
                Compare all features
              </h2>
              <p className="text-slate-500 text-lg">
                See exactly what&apos;s included in every plan.
              </p>
            </div>

            {/* Scrollable table on mobile */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
              <table className="w-full min-w-[940px] border-separate border-spacing-0 text-sm">
                {/* Sticky header */}
                <thead className="sticky top-0 z-20">
                  <tr className="bg-[#0A1628] text-white">
                    <th className="sticky left-0 z-30 bg-[#0A1628] text-left p-5 font-bold text-slate-300 w-[32%] min-w-[230px]">
                      Feature
                    </th>
                    <th className="p-5 text-center font-black text-emerald-300">
                      Contractor
                    </th>
                    <th className="p-5 text-center font-black">Starter</th>
                    <th className="p-5 text-center font-black text-blue-300">
                      Pro
                    </th>
                    <th className="p-5 text-center font-black">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_TABLE.map((group) => (
                    <React.Fragment key={group.category}>
                      {/* Category header */}
                      <tr className="bg-[#0A1628] text-white">
                        <td className="sticky left-0 z-10 bg-[#0A1628] px-5 py-3 text-xs font-black uppercase tracking-widest text-blue-200">
                          {group.category}
                        </td>
                        <td className="px-5 py-3" />
                        <td className="px-5 py-3" />
                        <td className="px-5 py-3" />
                        <td className="px-5 py-3" />
                      </tr>
                      {group.rows.map((row, i) => {
                        const rowBg = i % 2 === 0 ? "bg-white" : "bg-slate-50";

                        return (
                          <tr key={row.feature} className={rowBg}>
                            <td
                              className={`sticky left-0 z-10 px-5 py-3.5 text-slate-700 font-medium ${rowBg}`}
                            >
                              {row.feature}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <TableCell value={row.contractor} />
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <TableCell value={row.starter} />
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <TableCell value={row.pro} />
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <TableCell value={row.enterprise} />
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── CALCULATOR WIDGET ────────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3 block">
                Cost Calculator
              </span>
              <h2 className="text-4xl font-black text-slate-900 mb-3">
                Estimate your cost
              </h2>
              <p className="text-slate-500 text-lg">
                See exactly what you&apos;d pay — and how much you&apos;d save.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-8 md:p-12">
              {/* Slider */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <label
                    htmlFor="employee-slider"
                    className="text-slate-700 font-bold text-lg flex items-center gap-2"
                  >
                    <Users size={22} className="text-blue-600" /> Number of
                    employees
                  </label>
                  <div className="text-3xl font-black text-blue-600">
                    {employees}
                  </div>
                </div>
                <input
                  id="employee-slider"
                  type="range"
                  min={1}
                  max={500}
                  value={employees}
                  onChange={(e) => setEmployees(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-md"
                />
                <div className="flex justify-between text-slate-400 text-xs mt-2 font-medium">
                  <span>1</span>
                  <span>125</span>
                  <span>250</span>
                  <span>375</span>
                  <span>500</span>
                </div>
              </div>

              {/* Cost cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="bg-white rounded-lg p-5 border border-slate-200 text-center">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                    Starter / mo
                  </div>
                  <div className="text-3xl font-black text-blue-600">
                    $<AnimatedNumber value={starterCost} />
                  </div>
                  <div className="text-slate-500 text-xs mt-1">
                    ${employees} × $
                    <AnimatedNumber
                      value={starterSeat}
                      decimals={isAnnual ? 2 : 0}
                    />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-5 border-2 border-indigo-300 text-center shadow-md">
                  <div className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">
                    Pro / mo
                  </div>
                  <div className="text-3xl font-black text-indigo-600">
                    $<AnimatedNumber value={proCost} />
                  </div>
                  <div className="text-slate-500 text-xs mt-1">
                    ${proBase} base + ${employees} × $
                    <AnimatedNumber
                      value={proSeat}
                      decimals={isAnnual ? 2 : 0}
                    />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-5 border border-slate-200 text-center">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                    Typical Stack / mo
                  </div>
                  <div className="text-3xl font-black text-slate-400">
                    $<AnimatedNumber value={typicalStack} />
                  </div>
                  <div className="text-slate-500 text-xs mt-1">
                    ${employees} × $45 avg
                  </div>
                </div>
              </div>

              {/* Savings callout */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div>
                  <div className="font-black text-emerald-900 text-xl">
                    Save $
                    <AnimatedNumber
                      value={Math.max(0, typicalStack - proCost)}
                    />
                    /mo with CircleWorks Pro
                  </div>
                  <div className="text-emerald-700 text-sm font-medium">
                    vs. a typical fragmented HR tool stack for {employees}{" "}
                    employees
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-64 relative" style={{ minHeight: "256px" }}>
                <div className="absolute inset-0">
                  {!isMounted ? (
                    <div className="w-full h-full bg-slate-100/50 rounded-xl animate-pulse flex items-center justify-center">
                      <BarChart3
                        className="text-slate-300 animate-bounce"
                        size={40}
                      />
                    </div>
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height={256}
                      minWidth={1}
                      minHeight={1}
                    >
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{
                            fontSize: 11,
                            fontWeight: 700,
                            fill: "#64748B",
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#94A3B8" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip
                          formatter={(value) => [`$${value ?? 0}/mo`, ""]}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            fontWeight: 700,
                          }}
                        />
                        <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-black text-slate-900 mb-3">
                Frequently asked questions
              </h2>
              <p className="text-slate-500 text-lg">
                Everything you need to know about pricing.
              </p>
            </div>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── ENTERPRISE CALLOUT ───────────────────────────────────────── */}
        <section className="py-24 bg-[#0A1628] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_70%_50%,rgba(59,130,246,0.15),transparent)]" />
          <div className="max-w-5xl mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <Building2
                  className="text-blue-400 mb-6 mx-auto lg:mx-0"
                  size={48}
                />
                <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                  Need more? Let us build
                  <br />a custom plan.
                </h2>
                <p className="text-slate-400 text-xl mb-8 max-w-xl">
                  Dedicated infrastructure, custom SLAs, volume pricing, and a
                  hand-held implementation — built for companies with 250+
                  employees.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/contact"
                    id="enterprise-sales-cta"
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[16px] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-shadow"
                  >
                    <Phone size={18} /> Talk to Sales
                  </Link>
                  <Link
                    href="/product"
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-bold text-[16px] hover:bg-white/10 transition-colors"
                  >
                    Explore Platform <ArrowRight size={18} />
                  </Link>
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="bg-white/5 border border-white/10 rounded-lg p-8">
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6">
                    Trusted by enterprise teams
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    {ENTERPRISE_LOGOS.map((logo) => (
                      <div
                        key={logo}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center justify-center"
                      >
                        <span className="text-slate-300 font-bold text-sm">
                          {logo}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center border-t border-white/10 pt-6">
                    {[
                      ["99.99%", "Uptime SLA"],
                      ["<2ms", "API p95"],
                      ["24/7", "Support"],
                    ].map(([val, label]) => (
                      <div key={label}>
                        <div className="text-2xl font-black text-white">
                          {val}
                        </div>
                        <div className="text-slate-500 text-xs font-semibold mt-1">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}

export default PricingPage;
