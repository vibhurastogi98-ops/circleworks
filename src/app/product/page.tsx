"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ClipboardCheck,
  Clock3,
  DollarSign,
  FileCheck2,
  HeartPulse,
  LineChart,
  Receipt,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DemoSection from "@/components/DemoSection";

type ProductModule = {
  id: string;
  pill: string;
  eyebrow: string;
  name: string;
  headline: string;
  description: string;
  features: string[];
  href: string;
  icon: LucideIcon;
  accent: string;
  frame: string;
  screenshot: {
    title: string;
    route: string;
    statCards: Array<{ label: string; value: string }>;
    rows: Array<{ label: string; detail: string; status: string }>;
  };
};

const modules: ProductModule[] = [
  {
    id: "payroll",
    pill: "Payroll",
    eyebrow: "PAYROLL",
    name: "Payroll",
    headline: "Run payroll in minutes across all 50 states.",
    description:
      "Automate wages, deductions, direct deposit, tax calculations, and filing workflows in one reliable payroll command center.",
    features: [
      "50-state payroll tax calculations",
      "2-day direct deposit and off-cycle runs",
      "W-2, 1099, bonus, and final pay support",
      "Automated quarterly and annual filing workflows",
      "Gross-to-net previews before approval",
    ],
    href: "/product/payroll",
    icon: DollarSign,
    accent: "#2563EB",
    frame: "#0A1628",
    screenshot: {
      title: "May 31 regular payroll",
      route: "payroll/run",
      statCards: [
        { label: "Gross pay", value: "$184K" },
        { label: "Tax filings", value: "50" },
        { label: "Ready", value: "98%" },
      ],
      rows: [
        { label: "California Payroll", detail: "142 employees", status: "Approved" },
        { label: "Texas Contractors", detail: "38 payments", status: "Ready" },
        { label: "Federal Tax Filing", detail: "Auto-scheduled", status: "Filed" },
      ],
    },
  },
  {
    id: "hris",
    pill: "HRIS",
    eyebrow: "HRIS",
    name: "HRIS",
    headline: "Keep every employee record organized and audit-ready.",
    description:
      "Centralize employee profiles, documents, org charts, custom fields, and lifecycle changes without spreadsheet drift.",
    features: [
      "Employee system of record",
      "Dynamic org charts and manager scopes",
      "Secure document vault with permissions",
      "Custom fields for certifications and locations",
      "Employee self-service profile updates",
    ],
    href: "/product/hris",
    icon: Users,
    accent: "#4F46E5",
    frame: "#1E1B4B",
    screenshot: {
      title: "Employee directory",
      route: "employees",
      statCards: [
        { label: "Profiles", value: "428" },
        { label: "Docs", value: "1.8K" },
        { label: "Fields", value: "36" },
      ],
      rows: [
        { label: "Alyssa Grant", detail: "VP People · Remote", status: "Active" },
        { label: "Marcus Reed", detail: "Finance · Austin", status: "Active" },
        { label: "License tracking", detail: "12 renewals upcoming", status: "Synced" },
      ],
    },
  },
  {
    id: "ats",
    pill: "ATS",
    eyebrow: "ATS",
    name: "Applicant Tracking",
    headline: "Move every candidate from job post to offer faster.",
    description:
      "Post roles, track candidates, coordinate interviews, collect scorecards, and turn accepted offers into onboarding workflows.",
    features: [
      "Branded job posts and career pages",
      "Candidate pipeline stages",
      "Interview kits and scorecards",
      "Offer approvals and e-signature handoff",
      "Source and time-to-fill reporting",
    ],
    href: "/product/ats",
    icon: BriefcaseBusiness,
    accent: "#0EA5E9",
    frame: "#075985",
    screenshot: {
      title: "Hiring pipeline",
      route: "hiring/pipeline",
      statCards: [
        { label: "Open roles", value: "12" },
        { label: "Candidates", value: "214" },
        { label: "Offers", value: "6" },
      ],
      rows: [
        { label: "Payroll Specialist", detail: "Final interview", status: "Today" },
        { label: "Customer Success Lead", detail: "Offer sent", status: "Pending" },
        { label: "Product Designer", detail: "Screening", status: "New" },
      ],
    },
  },
  {
    id: "onboarding",
    pill: "Onboarding",
    eyebrow: "ONBOARDING",
    name: "Onboarding",
    headline: "Automate every step from signed offer to day one.",
    description:
      "Coordinate HR, payroll, IT, documents, and manager tasks so every new hire starts prepared.",
    features: [
      "Offer-to-day-one workflows",
      "I-9, W-4, and direct deposit tasks",
      "Equipment and access checklists",
      "Personalized welcome packets",
      "Manager reminders and launch dashboards",
    ],
    href: "/product/onboarding",
    icon: ClipboardCheck,
    accent: "#10B981",
    frame: "#065F46",
    screenshot: {
      title: "New hire plan",
      route: "onboarding",
      statCards: [
        { label: "Tasks", value: "24" },
        { label: "Complete", value: "82%" },
        { label: "Due", value: "3" },
      ],
      rows: [
        { label: "Confirm payroll details", detail: "Employee", status: "Done" },
        { label: "Prepare laptop", detail: "IT", status: "In progress" },
        { label: "Manager intro", detail: "Day 1", status: "Queued" },
      ],
    },
  },
  {
    id: "benefits",
    pill: "Benefits",
    eyebrow: "BENEFITS",
    name: "Benefits",
    headline: "Manage health, retirement, FSA, HSA, and deductions.",
    description:
      "Offer competitive benefits while keeping employee elections, eligibility, and payroll deductions aligned.",
    features: [
      "Medical, dental, vision, and retirement plans",
      "Open enrollment workflows",
      "Deduction sync into payroll",
      "Eligibility and life-event tracking",
      "Carrier-ready reports and exports",
    ],
    href: "/product/benefits",
    icon: HeartPulse,
    accent: "#E11D48",
    frame: "#881337",
    screenshot: {
      title: "Benefits enrollment",
      route: "benefits",
      statCards: [
        { label: "Eligible", value: "391" },
        { label: "Enrolled", value: "88%" },
        { label: "Plans", value: "9" },
      ],
      rows: [
        { label: "Medical PPO", detail: "Open enrollment", status: "Live" },
        { label: "401(k) Match", detail: "4% company match", status: "Synced" },
        { label: "Workers Comp", detail: "Class codes", status: "Current" },
      ],
    },
  },
  {
    id: "time",
    pill: "Time",
    eyebrow: "TIME",
    name: "Time & Scheduling",
    headline: "Turn schedules, PTO, and hours into payroll-ready data.",
    description:
      "Track clock-ins, timesheets, overtime, breaks, schedules, and PTO approvals without manual imports.",
    features: [
      "Clock in/out and mobile time capture",
      "Team schedules and open shifts",
      "PTO request routing",
      "Overtime and break alerts",
      "Payroll-ready approved hours",
    ],
    href: "/product/time",
    icon: Clock3,
    accent: "#F97316",
    frame: "#9A3412",
    screenshot: {
      title: "Time overview",
      route: "time",
      statCards: [
        { label: "Hours", value: "6.4K" },
        { label: "PTO", value: "18" },
        { label: "OT alerts", value: "4" },
      ],
      rows: [
        { label: "Seattle Shift", detail: "8:00 AM - 4:00 PM", status: "Published" },
        { label: "PTO Request", detail: "Maya Henderson", status: "Review" },
        { label: "Overtime Watch", detail: "Operations team", status: "Alert" },
      ],
    },
  },
  {
    id: "expenses",
    pill: "Expenses",
    eyebrow: "EXPENSES",
    name: "Expenses",
    headline: "Capture receipts, enforce policy, and reimburse automatically.",
    description:
      "Route employee spend through approvals and reimburse approved expenses through the next payroll run.",
    features: [
      "Receipt upload and OCR capture",
      "Custom approval policies",
      "Card and reimbursement workflows",
      "Payroll reimbursement sync",
      "Department and project coding",
    ],
    href: "/product/expenses",
    icon: Receipt,
    accent: "#0891B2",
    frame: "#164E63",
    screenshot: {
      title: "Expense queue",
      route: "expenses",
      statCards: [
        { label: "Pending", value: "21" },
        { label: "Approved", value: "$18K" },
        { label: "Policy", value: "96%" },
      ],
      rows: [
        { label: "Client Travel", detail: "$842.10", status: "Approved" },
        { label: "Office Supplies", detail: "$193.22", status: "Review" },
        { label: "Payroll Reimburse", detail: "Next run", status: "Queued" },
      ],
    },
  },
  {
    id: "performance",
    pill: "Performance",
    eyebrow: "PERFORMANCE",
    name: "Performance",
    headline: "Connect goals, reviews, feedback, and employee growth.",
    description:
      "Give managers a consistent operating rhythm for coaching, OKRs, review cycles, and learning plans.",
    features: [
      "Review cycles and calibration",
      "Goals and OKR tracking",
      "Peer and manager feedback",
      "Learning assignments",
      "Manager dashboards and reminders",
    ],
    href: "/product/performance",
    icon: Target,
    accent: "#9333EA",
    frame: "#581C87",
    screenshot: {
      title: "Growth hub",
      route: "performance",
      statCards: [
        { label: "Reviews", value: "74" },
        { label: "Goals", value: "312" },
        { label: "Courses", value: "48" },
      ],
      rows: [
        { label: "Q2 Review Cycle", detail: "Managers", status: "Open" },
        { label: "Sales Enablement", detail: "LMS course", status: "Assigned" },
        { label: "Goal check-in", detail: "Product team", status: "Due" },
      ],
    },
  },
  {
    id: "compliance",
    pill: "Compliance",
    eyebrow: "COMPLIANCE",
    name: "Compliance",
    headline: "Stay ahead of state, federal, and workforce obligations.",
    description:
      "Track ACA, EEO, tax notices, labor law posters, audit logs, and state-specific requirements from one command center.",
    features: [
      "50-state compliance coverage",
      "ACA and EEO reporting workflows",
      "Labor law poster tracking",
      "Audit logs and document history",
      "Risk alerts and remediation tasks",
    ],
    href: "/product/compliance",
    icon: ShieldCheck,
    accent: "#DC2626",
    frame: "#7F1D1D",
    screenshot: {
      title: "Compliance center",
      route: "compliance",
      statCards: [
        { label: "States", value: "50" },
        { label: "Filings", value: "12" },
        { label: "Risk", value: "Low" },
      ],
      rows: [
        { label: "ACA Review", detail: "Measurement period", status: "Ready" },
        { label: "EEO-1", detail: "Workforce report", status: "Draft" },
        { label: "Poster Update", detail: "California", status: "Posted" },
      ],
    },
  },
  {
    id: "analytics",
    pill: "Analytics",
    eyebrow: "ANALYTICS",
    name: "Analytics",
    headline: "Turn people data into forecasts and board-ready reports.",
    description:
      "Use reports, dashboards, AI insights, and workforce forecasting to understand headcount, labor cost, and growth.",
    features: [
      "40+ people and payroll reports",
      "Headcount and labor cost forecasting",
      "Compensation and turnover analysis",
      "Board-ready exports",
      "AI insights and anomaly detection",
    ],
    href: "/product/analytics",
    icon: BarChart3,
    accent: "#0D9488",
    frame: "#134E4A",
    screenshot: {
      title: "Workforce analytics",
      route: "analytics",
      statCards: [
        { label: "Reports", value: "40+" },
        { label: "Forecast", value: "+12%" },
        { label: "Insights", value: "9" },
      ],
      rows: [
        { label: "Headcount Forecast", detail: "Next 6 months", status: "Updated" },
        { label: "Payroll Trend", detail: "Department view", status: "Ready" },
        { label: "AI Insight", detail: "Attrition risk", status: "New" },
      ],
    },
  },
];

const comparisonRows = [
  { feature: "Payroll + HRIS + ATS", circleworks: "✅", gusto: "⚠️", rippling: "✅", bamboo: "⚠️" },
  { feature: "50-state payroll filing", circleworks: "✅", gusto: "✅", rippling: "✅", bamboo: "❌" },
  { feature: "Native benefits administration", circleworks: "✅", gusto: "✅", rippling: "✅", bamboo: "⚠️" },
  { feature: "Time, expenses, and performance", circleworks: "✅", gusto: "⚠️", rippling: "✅", bamboo: "⚠️" },
  { feature: "Compliance workflows", circleworks: "✅", gusto: "⚠️", rippling: "⚠️", bamboo: "⚠️" },
  { feature: "Built-in analytics", circleworks: "✅", gusto: "⚠️", rippling: "✅", bamboo: "⚠️" },
] as const;

function ModuleScreenshot({ module, alignRight }: { module: ProductModule; alignRight: boolean }) {
  const Icon = module.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: alignRight ? 40 : -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-140px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative mx-auto w-full max-w-xl ${alignRight ? "lg:rotate-3" : "lg:-rotate-3"}`}
    >
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_34px_90px_rgba(15,23,42,0.18)]">
        <div
          className="flex h-14 items-center gap-3 border-b border-white/10 px-5"
          style={{ backgroundColor: module.frame }}
        >
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="hidden min-w-0 flex-1 rounded-full bg-white/10 px-4 py-2 font-mono text-xs text-white/70 sm:block">
            app.circleworks.com/{module.screenshot.route}
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white">
            Live
          </span>
        </div>

        <div className="bg-slate-50 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                style={{ backgroundColor: module.accent }}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-950">
                  {module.screenshot.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500">Workspace preview</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              Synced
            </span>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-3">
            {module.screenshot.statCards.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-lg font-black text-slate-950">{stat.value}</div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {module.screenshot.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-slate-950">{row.label}</div>
                  <div className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                    {row.detail}
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black text-white"
                  style={{ backgroundColor: module.accent }}
                >
                  {row.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 h-24 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-400">
              <span>Activity</span>
              <LineChart className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex h-12 items-end gap-2">
              {[38, 54, 46, 72, 58, 84, 66].map((height, index) => (
                <span
                  key={height + index}
                  className="flex-1 rounded-t-lg"
                  style={{
                    height: `${height}%`,
                    backgroundColor: index === 5 ? module.accent : "#CBD5E1",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ModuleCopy({ module, alignRight }: { module: ProductModule; alignRight: boolean }) {
  const Icon = module.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-140px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={alignRight ? "lg:pl-6" : "lg:pr-6"}
    >
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
        style={{ backgroundColor: module.accent }}
      >
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="text-sm font-black uppercase tracking-[0.24em]" style={{ color: module.accent }}>
        {module.eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#0A1628] md:text-5xl">
        {module.name}
      </h2>
      <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-slate-600">
        {module.description}
      </p>
      <ul className="mt-8 grid gap-3">
        {module.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-base font-bold text-slate-700">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" strokeWidth={3} aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={module.href}
        className="mt-9 inline-flex items-center gap-2 text-base font-black text-blue-600 transition hover:gap-3 hover:text-blue-700"
      >
        Learn more about {module.name}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </motion.div>
  );
}

export default function ProductPage() {
  const [activeModule, setActiveModule] = useState(modules[0].id);
  const moduleIds = useMemo(() => modules.map((module) => module.id), []);

  useEffect(() => {
    const observers = moduleIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)
      .map((section) => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActiveModule(entry.target.id);
            }
          },
          {
            rootMargin: "-35% 0px -55% 0px",
            threshold: 0.01,
          }
        );
        observer.observe(section);
        return observer;
      });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [moduleIds]);

  const scrollToModule = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-200 selection:text-[#0A1628]">
      <Navbar />

      <section className="bg-[#0A1628] px-4 pb-24 pt-36 text-white sm:px-6 lg:px-8 lg:pb-28 lg:pt-44">
        <div className="mx-auto max-w-5xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-black leading-tight tracking-tight text-white md:text-[56px]"
          >
            One Platform. Every HR Task.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mx-auto mt-6 max-w-3xl text-lg font-medium leading-8 text-slate-300 md:text-xl"
          >
            See the complete CircleWorks platform — 10 modules, 150+ features, built for US companies.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-7 text-sm font-black text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1628]"
            >
              Start Free
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-black text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1628]"
            >
              Book a Demo
            </Link>
          </motion.div>
        </div>
      </section>

      <nav className="sticky top-16 z-40 border-b border-gray-200 bg-white py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8" aria-label="Product modules">
          {modules.map((module) => {
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => scrollToModule(module.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
                aria-current={isActive ? "true" : undefined}
              >
                {module.pill}
              </button>
            );
          })}
        </div>
      </nav>

      <div>
        {modules.map((module, index) => {
          const imageFirst = index % 2 === 0;

          return (
            <section
              key={module.id}
              id={module.id}
              className="flex min-h-screen scroll-mt-36 items-center overflow-hidden border-b border-slate-100 py-20 lg:py-24"
            >
              <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
                {imageFirst ? (
                  <>
                    <ModuleScreenshot module={module} alignRight={false} />
                    <ModuleCopy module={module} alignRight />
                  </>
                ) : (
                  <>
                    <ModuleCopy module={module} alignRight={false} />
                    <ModuleScreenshot module={module} alignRight />
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">
              Platform Consolidation
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628] md:text-5xl">
              Replace 7 tools with 1
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-6 py-4">Feature</th>
                    <th className="bg-blue-600 px-6 py-4 text-white">CircleWorks</th>
                    <th className="px-6 py-4">Gusto</th>
                    <th className="px-6 py-4">Rippling</th>
                    <th className="px-6 py-4">BambooHR</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-6 py-5 text-sm font-black text-[#0A1628]">{row.feature}</td>
                      <td className="bg-blue-50 px-6 py-5 text-2xl">{row.circleworks}</td>
                      <td className="px-6 py-5 text-2xl">{row.gusto}</td>
                      <td className="px-6 py-5 text-2xl">{row.rippling}</td>
                      <td className="px-6 py-5 text-2xl">{row.bamboo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pt-20">
        <div className="mx-auto max-w-4xl px-4 pb-12 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">
            See it live — no signup needed
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628] md:text-5xl">
            Explore CircleWorks with interactive demo data
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-600">
            Click through payroll, employees, benefits, time, and reports before creating an account.
          </p>
        </div>
        <DemoSection />
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight text-[#0A1628] md:text-5xl">
            Ready to run HR from one platform?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
            Start with the modules you need today, then add more as your team grows.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-7 text-sm font-black text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
