"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Play, Search, Bell, ChevronDown } from "lucide-react";

const TRUST_LOGOS = [
  "Northstar",
  "BluePeak",
  "SummitOps",
  "FoundryOne",
  "Kepler Health",
  "Union & Co",
];

const MARQUEE_LOGOS = [...TRUST_LOGOS, ...TRUST_LOGOS];

const headlineLines = [
  [
    { text: "The", gradient: false },
    { text: "Payroll", gradient: false },
    { text: "&", gradient: false },
    { text: "HR", gradient: false },
    { text: "Platform", gradient: false },
    { text: "Built", gradient: false },
    { text: "for", gradient: false },
  ],
  [
    { text: "Creators,", gradient: true },
    { text: "Agencies", gradient: true },
    { text: "&", gradient: true },
    { text: "Companies.", gradient: true },
  ],
];

const payrollRows = [
  { name: "Olivia Bennett", role: "Engineering", amount: "$4,850.00", status: "Paid" },
  { name: "Marcus Rivera", role: "Operations", amount: "$3,920.00", status: "Pending" },
  { name: "Nina Patel", role: "People Ops", amount: "$4,275.00", status: "Approved" },
  { name: "Daniel Brooks", role: "Sales", amount: "$5,140.00", status: "Paid" },
  { name: "Sophia Kim", role: "Finance", amount: "$4,460.00", status: "Processing" },
];

const statusStyles: Record<string, string> = {
  Paid: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20",
  Pending: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/20",
  Approved: "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/20",
  Processing: "bg-blue-500/15 text-blue-200 ring-1 ring-blue-400/20",
};

const dashboardSections = {
  Overview: {
    eyebrow: "Command Center",
    title: "Company Payroll & HR Overview",
    description: "A single view of payroll readiness, employee changes, benefits, and approvals.",
    metrics: [
      { label: "Open Tasks", value: "18", accent: "from-blue-600/30 to-blue-400/5" },
      { label: "Due This Week", value: "7", accent: "from-cyan-500/25 to-cyan-300/5" },
      { label: "Ready", value: "94%", accent: "from-indigo-500/25 to-violet-400/5" },
    ],
  },
  "Payroll Runs": {
    eyebrow: "April 30 Payroll Run",
    title: "US Biweekly Payroll Preview",
    description: "Review earnings, benefits, taxes, and reimbursement changes before funding this run.",
    metrics: [
      { label: "Gross Payroll", value: "$84,530", accent: "from-blue-600/30 to-blue-400/5" },
      { label: "Deductions", value: "$11,264", accent: "from-cyan-500/25 to-cyan-300/5" },
      { label: "Net Pay", value: "$62,941", accent: "from-indigo-500/25 to-violet-400/5" },
    ],
  },
  Employees: {
    eyebrow: "People Ops",
    title: "Employee Changes Ready for Payroll",
    description: "Track new hires, compensation changes, departments, and profile completion in one place.",
    metrics: [
      { label: "Employees", value: "142", accent: "from-blue-600/30 to-blue-400/5" },
      { label: "New Hires", value: "8", accent: "from-cyan-500/25 to-cyan-300/5" },
      { label: "Changes", value: "12", accent: "from-indigo-500/25 to-violet-400/5" },
    ],
  },
  Benefits: {
    eyebrow: "Benefits Sync",
    title: "Benefit Deductions Matched to Payroll",
    description: "Keep medical, dental, vision, and retirement deductions aligned before each run.",
    metrics: [
      { label: "Enrollments", value: "118", accent: "from-blue-600/30 to-blue-400/5" },
      { label: "Deductions", value: "$11,264", accent: "from-cyan-500/25 to-cyan-300/5" },
      { label: "Pending", value: "3", accent: "from-indigo-500/25 to-violet-400/5" },
    ],
  },
  Time: {
    eyebrow: "Time Review",
    title: "Timesheets Ready for Approval",
    description: "Review clocked hours, overtime, PTO, and manager approvals before payroll locks.",
    metrics: [
      { label: "Hours", value: "4,928", accent: "from-blue-600/30 to-blue-400/5" },
      { label: "Overtime", value: "126", accent: "from-cyan-500/25 to-cyan-300/5" },
      { label: "Missing", value: "5", accent: "from-indigo-500/25 to-violet-400/5" },
    ],
  },
  Expenses: {
    eyebrow: "Expenses",
    title: "Approved Reimbursements Queued",
    description: "Sync approved expenses and mileage reimbursements into the next payroll batch.",
    metrics: [
      { label: "Reports", value: "36", accent: "from-blue-600/30 to-blue-400/5" },
      { label: "Approved", value: "$9,840", accent: "from-cyan-500/25 to-cyan-300/5" },
      { label: "Pending", value: "6", accent: "from-indigo-500/25 to-violet-400/5" },
    ],
  },
} as const;

const dashboardNavItems = Object.keys(dashboardSections) as Array<keyof typeof dashboardSections>;

function PayrollDashboardMockup() {
  const [activeSection, setActiveSection] = useState<keyof typeof dashboardSections>("Payroll Runs");
  const currentSection = dashboardSections[activeSection];

  return (
    <div className="hero-float relative mx-auto w-full max-w-[1100px] rounded-[28px] border border-white/10 bg-[#08111f]/90 shadow-[0_32px_120px_rgba(3,10,24,0.85)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-[18%] -bottom-10 h-24 rounded-full bg-[radial-gradient(circle,_rgba(6,182,212,0.22)_0%,_rgba(29,78,216,0.16)_35%,_rgba(10,22,40,0)_75%)] blur-2xl" />

      <div className="flex h-12 items-center gap-3 rounded-t-[28px] border-b border-white/10 bg-[#0d1727] px-4 md:px-5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2f]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex h-8 w-[55%] max-w-[420px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[11px] text-slate-400">
          <Search className="h-3.5 w-3.5" />
          <span>app.circleworks.com/payroll/runs/april-us-01</span>
        </div>
        <div className="hidden items-center gap-2 text-slate-500 md:flex">
          <Bell className="h-4 w-4" />
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" />
        </div>
      </div>

      <div className="grid min-h-[520px] grid-cols-1 overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#0b1423] p-4 lg:border-b-0 lg:border-r">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 shadow-[0_0_35px_rgba(29,78,216,0.35)]">
              <div className="h-5 w-5 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-white">CircleWorks</p>
              <p className="text-[11px] text-slate-500">Payroll Command Center</p>
            </div>
          </div>

          <div className="space-y-2">
            {dashboardNavItems.map((item) => {
              const isActive = item === activeSection;

              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => setActiveSection(item)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/20 to-cyan-400/10 text-white ring-1 ring-blue-400/25"
                      : "text-slate-400 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white"
                  }`}
                  aria-pressed={isActive}
                >
                  <span>{item}</span>
                  {isActive ? <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" /> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">Live</p>
            <p className="mt-2 text-2xl font-black text-white">$22,645</p>
            <p className="text-sm text-slate-400">Today's payroll batch total</p>
          </div>
        </aside>

        <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] p-4 md:p-6 lg:p-7">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-300">{currentSection.eyebrow}</p>
              <h3 className="mt-2 text-2xl font-black text-white md:text-[32px]">{currentSection.title}</h3>
              <p className="mt-2 max-w-xl text-sm text-slate-400 md:text-base">
                {currentSection.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                142 employees
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200">
                5 pending approvals
              </div>
            </div>
          </div>

          <div className="mb-5 grid gap-4 md:grid-cols-3">
            {currentSection.metrics.map((card) => (
              <div key={card.label} className={`rounded-3xl border border-white/10 bg-gradient-to-br ${card.accent} p-4`}>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">{card.label}</p>
                <p className="mt-3 text-2xl font-black text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0c1626]/80">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_0.8fr] gap-3 border-b border-white/10 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
              <span>Employee</span>
              <span>Department</span>
              <span>Net Amount</span>
              <span>Status</span>
            </div>
            <div>
              {payrollRows.map((row) => (
                <div
                  key={row.name}
                  className="grid grid-cols-[1.5fr_1fr_1fr_0.8fr] items-center gap-3 border-b border-white/6 px-5 py-4 last:border-b-0 hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-400/20 text-sm font-black text-cyan-100 ring-1 ring-white/10">
                      {row.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{row.name}</p>
                      <p className="text-xs text-slate-500">Biweekly salary</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300">{row.role}</p>
                  <p className="text-sm font-semibold text-white">{row.amount}</p>
                  <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold ${statusStyles[row.status]}`}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">Federal tax filing scheduled</p>
              <p className="text-xs text-slate-400">ACH debit settles Friday, 9:00 AM EST</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/12 px-3 py-1.5 text-xs font-bold text-emerald-300">
              <Check className="h-3.5 w-3.5" /> Ready to fund
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const flatWords = headlineLines.flat();

  return (
    <section className="relative flex min-h-screen overflow-hidden bg-[#0A1628] px-6 pb-24 pt-32">
      <div className="hero-mesh hero-mesh-blue" />
      <div className="hero-mesh hero-mesh-cyan" />
      <div className="hero-mesh hero-mesh-purple" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='1' cy='1' r='1' fill='white' /%3E%3C/svg%3E\")",
          backgroundSize: "24px 24px",
        }}
      />

      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045]" aria-hidden="true">
        <filter id="heroNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#heroNoise)" />
      </svg>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-[12px] font-bold uppercase tracking-[0.2em] text-cyan-400"
        >
          THE ONLY PAYROLL &amp; HR PLATFORM FOR CREATORS, AGENCIES &amp; COMPANIES
        </motion.p>

        <div className="mt-6 space-y-2">
          {headlineLines.map((line, lineIndex) => {
            const offset = headlineLines.slice(0, lineIndex).reduce((sum, current) => sum + current.length, 0);
            return (
              <h1
                key={`headline-line-${lineIndex}`}
                className="flex flex-wrap items-center justify-center gap-x-[0.22em] gap-y-2 text-[38px] font-black leading-[1.02] tracking-[-0.035em] text-white sm:text-[48px] lg:flex-nowrap lg:text-[58px] xl:text-[64px]"
              >
                {line.map((word, wordIndex) => {
                  const order = offset + wordIndex;
                  return (
                    <motion.span
                      key={`${word.text}-${order}`}
                      initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.7, delay: order * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className={word.gradient ? "bg-gradient-to-r from-[#1D4ED8] to-[#06B6D4] bg-clip-text text-transparent" : ""}
                    >
                      {word.text}
                    </motion.span>
                  );
                })}
              </h1>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: flatWords.length * 0.05 + 0.08, ease: "easeOut" }}
          className="mt-8 max-w-2xl text-[18px] leading-relaxed text-slate-300 md:text-[20px]"
        >
          All-in-one Payroll · HRIS · ATS · Benefits · Time · Expenses. Built
          for creators, agencies, and companies of every size.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: flatWords.length * 0.05 + 0.18, ease: "easeOut" }}
          className="mt-8 flex w-full flex-col items-center"
        >
          <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] px-8 text-base font-semibold text-white shadow-[0_0_0_rgba(59,130,246,0)] transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_34px_rgba(59,130,246,0.45)] sm:w-auto"
            >
              Start Free
            </Link>
            <Link
              href="/demo"
              className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 text-base font-semibold text-white transition duration-300 hover:bg-white hover:text-[#0A1628] sm:w-auto"
            >
              <Play className="h-4 w-4 fill-current" />
              Watch 2-Min Demo
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-cyan-400" /> 30-day free trial</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-cyan-400" /> No setup fees</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-cyan-400" /> Cancel anytime</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: flatWords.length * 0.05 + 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-16 w-full"
        >
          <PayrollDashboardMockup />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: flatWords.length * 0.05 + 0.42, ease: "easeOut" }}
          className="relative mt-12 w-full overflow-hidden"
        >
          <p className="text-center text-sm text-slate-400">Trusted by 5,000+ US companies</p>

          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0A1628] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0A1628] to-transparent" />

          <div className="mt-6 overflow-hidden">
            <div className="hero-marquee flex min-w-max items-center gap-14 whitespace-nowrap opacity-60 grayscale">
              {MARQUEE_LOGOS.map((logo, index) => (
                <div key={`${logo}-${index}`} className="flex items-center gap-3 text-slate-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-black uppercase tracking-[0.18em]">
                    {logo.slice(0, 2)}
                  </div>
                  <span className="text-lg font-black tracking-tight">{logo}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .hero-mesh {
          position: absolute;
          border-radius: 9999px;
          filter: blur(110px);
          opacity: 0.9;
          mix-blend-mode: screen;
          animation: heroMeshDrift 18s ease-in-out infinite alternate;
        }

        .hero-mesh-blue {
          top: -10%;
          left: -8%;
          width: 42rem;
          height: 42rem;
          background: radial-gradient(circle, rgba(29, 78, 216, 0.55) 0%, rgba(29, 78, 216, 0.12) 45%, rgba(29, 78, 216, 0) 74%);
          animation-delay: 0s;
        }

        .hero-mesh-cyan {
          top: 12%;
          right: -8%;
          width: 34rem;
          height: 34rem;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.42) 0%, rgba(6, 182, 212, 0.1) 46%, rgba(6, 182, 212, 0) 76%);
          animation-delay: -5s;
        }

        .hero-mesh-purple {
          bottom: -16%;
          left: 24%;
          width: 38rem;
          height: 38rem;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.32) 0%, rgba(99, 102, 241, 0.08) 42%, rgba(99, 102, 241, 0) 74%);
          animation-delay: -9s;
        }

        .hero-float {
          animation: heroFloat 3s ease-in-out infinite alternate;
        }

        .hero-marquee {
          animation: heroMarquee 22s linear infinite;
        }

        @keyframes heroMeshDrift {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(2.5%, -3%, 0) scale(1.05);
          }
          100% {
            transform: translate3d(-3%, 2.5%, 0) scale(0.96);
          }
        }

        @keyframes heroFloat {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-8px);
          }
        }

        @keyframes heroMarquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
