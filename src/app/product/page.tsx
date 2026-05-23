"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  GraduationCap,
  HeartPulse,
  Network,
  Receipt,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Module = {
  id: string;
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  link: string;
  icon: React.ElementType;
  visualTitle: string;
  metrics: Array<{ label: string; value: string }>;
  rows: Array<{ label: string; detail: string; status: string }>;
};

const MODULES: Module[] = [
  {
    id: "payroll",
    name: "Payroll",
    eyebrow: "Payroll",
    title: "Run payroll in minutes, across all 50 states.",
    description:
      "Automate payroll, direct deposit, tax calculations, and filings in one reliable workflow.",
    features: [
      "50-state payroll runs",
      "Automated tax filing",
      "W-2 and 1099 support",
      "Off-cycle pay and bonuses",
    ],
    link: "/product/payroll",
    icon: CreditCard,
    visualTitle: "Payroll Run",
    metrics: [
      { label: "Net pay", value: "$184k" },
      { label: "Tax filings", value: "50" },
      { label: "Ready", value: "98%" },
    ],
    rows: [
      {
        label: "California Payroll",
        detail: "142 employees",
        status: "Approved",
      },
      { label: "Texas Contractors", detail: "38 payments", status: "Ready" },
      {
        label: "Federal Tax Filing",
        detail: "Auto-scheduled",
        status: "Filed",
      },
    ],
  },
  {
    id: "hris",
    name: "HRIS",
    eyebrow: "HRIS",
    title: "Keep every employee record organized and searchable.",
    description:
      "Centralize employee data, documents, org charts, and custom fields without spreadsheet drift.",
    features: [
      "Employee records",
      "Org chart",
      "Custom fields",
      "Secure document storage",
    ],
    link: "/product/hris",
    icon: Network,
    visualTitle: "Employee Directory",
    metrics: [
      { label: "Profiles", value: "428" },
      { label: "Docs", value: "1.8k" },
      { label: "Fields", value: "36" },
    ],
    rows: [
      { label: "Alyssa Grant", detail: "VP People · Remote", status: "Active" },
      { label: "Marcus Reed", detail: "Finance · Austin", status: "Active" },
      {
        label: "Custom field set",
        detail: "Region, license, union",
        status: "Synced",
      },
    ],
  },
  {
    id: "hiring",
    name: "Hiring / ATS",
    eyebrow: "Hiring / ATS",
    title: "Post jobs, track candidates, and hire faster.",
    description:
      "Manage every opening from job post to offer letter with a collaborative recruiting pipeline.",
    features: [
      "Branded job posts",
      "Candidate pipelines",
      "Interview scorecards",
      "Offer management",
    ],
    link: "/product/ats",
    icon: BriefcaseBusiness,
    visualTitle: "Hiring Pipeline",
    metrics: [
      { label: "Open roles", value: "12" },
      { label: "Candidates", value: "214" },
      { label: "Offers", value: "6" },
    ],
    rows: [
      {
        label: "Payroll Specialist",
        detail: "Final interview",
        status: "Today",
      },
      {
        label: "Customer Success Lead",
        detail: "Offer sent",
        status: "Pending",
      },
      { label: "Product Designer", detail: "Screening", status: "New" },
    ],
  },
  {
    id: "onboarding",
    name: "Onboarding",
    eyebrow: "Onboarding",
    title: "Automate the path from offer to day one.",
    description:
      "Coordinate HR, IT, payroll, and manager tasks so every new hire starts prepared.",
    features: [
      "Offer-to-day-one workflows",
      "I-9 and W-4 tasks",
      "Equipment checklists",
      "Welcome packets",
    ],
    link: "/product/onboarding",
    icon: ClipboardCheck,
    visualTitle: "New Hire Plan",
    metrics: [
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
  {
    id: "benefits",
    name: "Benefits",
    eyebrow: "Benefits",
    title: "Manage health, retirement, FSA, and workers comp.",
    description:
      "Offer competitive benefits and keep payroll deductions aligned with enrollment changes.",
    features: [
      "Health plan enrollment",
      "401k deductions",
      "FSA and HSA support",
      "Workers comp tracking",
    ],
    link: "/product/benefits",
    icon: HeartPulse,
    visualTitle: "Benefits Enrollment",
    metrics: [
      { label: "Eligible", value: "391" },
      { label: "Enrolled", value: "88%" },
      { label: "Plans", value: "9" },
    ],
    rows: [
      { label: "Medical PPO", detail: "Open enrollment", status: "Live" },
      { label: "401k Match", detail: "4% company match", status: "Synced" },
      { label: "Workers Comp", detail: "Class codes", status: "Current" },
    ],
  },
  {
    id: "time",
    name: "Time & Scheduling",
    eyebrow: "Time & Scheduling",
    title: "Track clock-ins, schedules, PTO, and overtime.",
    description:
      "Turn time data into payroll-ready hours without manual imports or late approvals.",
    features: [
      "Clock in and out",
      "Team schedules",
      "PTO requests",
      "Overtime alerts",
    ],
    link: "/product/time",
    icon: CalendarClock,
    visualTitle: "Time Overview",
    metrics: [
      { label: "Hours", value: "6.4k" },
      { label: "PTO", value: "18" },
      { label: "OT alerts", value: "4" },
    ],
    rows: [
      {
        label: "Seattle Shift",
        detail: "8:00 AM - 4:00 PM",
        status: "Published",
      },
      { label: "PTO Request", detail: "Maya Henderson", status: "Review" },
      { label: "Overtime Watch", detail: "Operations team", status: "Alert" },
    ],
  },
  {
    id: "expenses",
    name: "Expenses",
    eyebrow: "Expenses",
    title: "Capture receipts, approve spend, and reimburse automatically.",
    description:
      "Route employee expenses through policy checks and reimburse approved items through payroll.",
    features: [
      "Receipt capture",
      "Approval routing",
      "Policy controls",
      "Auto-reimbursements",
    ],
    link: "/product/expenses",
    icon: Receipt,
    visualTitle: "Expense Queue",
    metrics: [
      { label: "Pending", value: "21" },
      { label: "Approved", value: "$18k" },
      { label: "Policy", value: "96%" },
    ],
    rows: [
      { label: "Client Travel", detail: "$842.10", status: "Approved" },
      { label: "Office Supplies", detail: "$193.22", status: "Review" },
      { label: "Payroll Reimburse", detail: "Next run", status: "Queued" },
    ],
  },
  {
    id: "performance",
    name: "Performance & Learning",
    eyebrow: "Performance & Learning",
    title: "Connect reviews, goals, feedback, and learning.",
    description:
      "Give managers a structured way to coach teams and help employees grow with clear goals.",
    features: [
      "Performance reviews",
      "Goals and OKRs",
      "Feedback cycles",
      "Learning management",
    ],
    link: "/product/performance",
    icon: GraduationCap,
    visualTitle: "Growth Hub",
    metrics: [
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
  {
    id: "compliance",
    name: "Compliance",
    eyebrow: "Compliance",
    title: "Stay ahead of 50-state compliance requirements.",
    description:
      "Track ACA, EEO, labor posters, tax notices, and state-specific obligations from one dashboard.",
    features: [
      "50-state coverage",
      "ACA reporting",
      "EEO workflows",
      "Labor law posters",
    ],
    link: "/product/compliance",
    icon: FileCheck2,
    visualTitle: "Compliance Center",
    metrics: [
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
  {
    id: "analytics",
    name: "Analytics",
    eyebrow: "Analytics",
    title: "Turn people data into forecasts and board-ready reports.",
    description:
      "Use 40+ reports, AI insights, and forecasting to understand workforce cost and growth.",
    features: [
      "40+ reports",
      "AI insights",
      "Headcount forecasting",
      "Compensation analysis",
    ],
    link: "/product/analytics",
    icon: BarChart3,
    visualTitle: "Workforce Analytics",
    metrics: [
      { label: "Reports", value: "40+" },
      { label: "Forecast", value: "+12%" },
      { label: "Insights", value: "9" },
    ],
    rows: [
      {
        label: "Headcount Forecast",
        detail: "Next 6 months",
        status: "Updated",
      },
      { label: "Payroll Trend", detail: "Department view", status: "Ready" },
      { label: "AI Insight", detail: "Attrition risk", status: "New" },
    ],
  },
];

const plans = ["Starter", "Pro", "Enterprise"];

function ProductVisual({ module }: { module: Module }) {
  const Icon = module.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-3 rounded-md bg-white px-3 py-1 text-xs font-semibold text-slate-500">
          app.circleworks.com/{module.id}
        </span>
      </div>

      <div className="bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon size={22} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                {module.visualTitle}
              </div>
              <div className="text-xs text-slate-500">
                Live workspace preview
              </div>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            Synced
          </span>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          {module.metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="text-lg font-black text-slate-900">
                {metric.value}
              </div>
              <div className="mt-1 text-[11px] font-semibold text-slate-500">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {module.rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
            >
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {row.label}
                </div>
                <div className="text-xs text-slate-500">{row.detail}</div>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const [selectedPlan, setSelectedPlan] = useState("Pro");

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const offset = 104;
    const elementTop = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: elementTop - offset, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-[#0A1628]">
      <Navbar />

      <section
        className="px-6 pb-24 pt-36 lg:pb-28 lg:pt-44"
        style={{ backgroundColor: "#071426" }}
      >
        <div className="mx-auto max-w-5xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-5xl font-black leading-tight text-white md:text-6xl lg:text-7xl"
          >
            One Platform. Every HR Task.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mx-auto mt-6 max-w-2xl text-xl font-medium leading-8 text-slate-300"
          >
            See the complete CircleWorks platform.
          </motion.p>
        </div>
      </section>

      <nav className="sticky top-[72px] z-40 border-b border-slate-200 bg-white/95 py-4 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 lg:px-8">
          {MODULES.map((module) => (
            <button
              key={module.id}
              type="button"
              onClick={() => scrollToSection(module.id)}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
            >
              {module.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="overflow-hidden">
        {MODULES.map((module, index) => {
          const isEven = index % 2 === 0;
          return (
            <section
              key={module.id}
              id={module.id}
              className="scroll-mt-32 py-20 lg:py-28"
            >
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div
                  className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${isEven ? "" : "lg:[&>*:first-child]:order-2"}`}
                >
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -32 : 32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-120px" }}
                    transition={{ duration: 0.5 }}
                    className={isEven ? "text-left" : "text-left lg:text-right"}
                  >
                    <span className="mb-4 block text-sm font-black uppercase text-cyan-500">
                      {module.eyebrow}
                    </span>
                    <h2 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl lg:text-5xl">
                      {module.title}
                    </h2>
                    <p className="mt-5 text-lg leading-8 text-slate-600">
                      {module.description}
                    </p>
                    <ul
                      className={`mt-8 space-y-4 ${isEven ? "" : "lg:ml-auto"}`}
                    >
                      {module.features.map((feature) => (
                        <li
                          key={feature}
                          className={`flex gap-3 text-base font-semibold text-slate-700 ${isEven ? "items-start" : "items-start lg:justify-end"}`}
                        >
                          {!isEven && (
                            <span className="hidden lg:inline">{feature}</span>
                          )}
                          <Check
                            className="mt-0.5 shrink-0 text-emerald-500"
                            size={20}
                            strokeWidth={3}
                          />
                          {isEven && <span>{feature}</span>}
                          {!isEven && (
                            <span className="lg:hidden">{feature}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={module.link}
                      className={`mt-9 inline-flex items-center gap-2 text-lg font-black text-blue-600 transition hover:text-blue-800 ${isEven ? "" : "lg:flex-row-reverse"}`}
                    >
                      Learn more
                      <ArrowRight size={20} />
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 32 : -32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-120px" }}
                    transition={{ duration: 0.5 }}
                  >
                    <ProductVisual module={module} />
                  </motion.div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="px-6 py-24" style={{ backgroundColor: "#071426" }}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-black leading-tight text-white md:text-5xl">
            Start with what you need, add more as you grow
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Pick a starting plan now. Every module can be added when your team
            is ready.
          </p>

          <div className="mx-auto mt-10 flex max-w-xl flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 sm:flex-row">
            {plans.map((plan) => (
              <button
                key={plan}
                type="button"
                onClick={() => setSelectedPlan(plan)}
                className={`flex-1 rounded-xl px-5 py-3 text-sm font-black transition ${
                  selectedPlan === plan
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {plan}
              </button>
            ))}
          </div>

          <Link
            href={`/signup?plan=${selectedPlan.toLowerCase()}`}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-base font-black text-white transition hover:bg-blue-700"
          >
            Start Free Trial
            <ChevronRight size={20} />
          </Link>
          <p className="mt-4 text-sm font-semibold text-slate-400">
            Selected plan: {selectedPlan}. No credit card required.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
