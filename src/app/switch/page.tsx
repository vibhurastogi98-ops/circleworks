import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Download,
  FileCheck2,
  Rocket,
  ShieldCheck,
  Upload,
  UserRoundCheck,
} from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import MigrationInterestForm from "./MigrationInterestForm";

export const metadata: Metadata = {
  title: "Switch to CircleWorks | Payroll Migration Support",
  description:
    "Switching payroll providers is easier than you think. CircleWorks handles data import, parallel runs, and dedicated support.",
  alternates: {
    canonical: "https://circleworks.com/switch",
  },
};

const bookingHref = "#migration-interest";

const fears = [
  {
    icon: Database,
    fear: "What if my historical data gets lost?",
    resolution:
      "We import all payroll history — pay stubs, tax records, everything",
    tone: "text-blue-600 bg-blue-50 border-blue-100",
  },
  {
    icon: AlertTriangle,
    fear: "What if there are errors in the first run?",
    resolution:
      "We run parallel payroll alongside your old system for 1 month — free",
    tone: "text-orange-600 bg-orange-50 border-orange-100",
  },
  {
    icon: Calendar,
    fear: "How long does it take?",
    resolution:
      "Most companies fully migrated in 2 weeks. Enterprise: 30 days with a specialist",
    tone: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
];

const migrationSteps = [
  {
    label: "Step 1",
    title: "Sign up + assign migration specialist",
    timing: "Day 1",
    detail:
      "Your specialist confirms payroll calendars, tax setup, employee groups, and the cutover plan.",
    icon: UserRoundCheck,
  },
  {
    label: "Step 2",
    title: "Export data from current provider",
    timing: "Provider guides included",
    detail:
      "We provide guides per provider so your team knows exactly what to export and where to find it.",
    icon: Download,
  },
  {
    label: "Step 3",
    title: "We import everything",
    timing: "3-5 days",
    detail:
      "Employee records, payroll history, tax records, pay stubs, departments, deductions, and earnings are mapped into CircleWorks.",
    icon: Upload,
  },
  {
    label: "Step 4",
    title: "Parallel run alongside old system",
    timing: "1 pay period",
    detail:
      "We compare gross-to-net, deductions, taxes, reimbursements, and edge cases before your first live run.",
    icon: ClipboardCheck,
  },
  {
    label: "Step 5",
    title: "Go live on date of your choice",
    timing: "Your launch date",
    detail:
      "Your team switches over when payroll is validated and everyone is ready.",
    icon: Rocket,
  },
];

const providers = [
  "Gusto",
  "ADP",
  "Paychex",
  "QuickBooks Payroll",
  "Rippling",
  "BambooHR",
  "Excel/CSV",
];

export default function SwitchPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-white font-sans text-[#0A1628]"
    >
      <Navbar forceLight />

      <section className="border-b border-slate-200 bg-white px-6 pb-16 pt-28 lg:pb-24 lg:pt-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              White-glove migration
            </div>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
              Switching payroll providers is easier than you think
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-600">
              We handle the heavy lifting — data import, parallel runs,
              dedicated support
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={bookingHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Start Your Migration
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#migration-process"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 px-6 text-sm font-black text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                See the process
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-300/60">
            <div className="border-b border-white/10 bg-slate-900 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                    Migration workspace
                  </p>
                  <h2 className="mt-1 text-lg font-black text-white">
                    First payroll readiness
                  </h2>
                </div>
                <div className="rounded-lg bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300">
                  On track
                </div>
              </div>
            </div>
            <div className="space-y-5 p-5">
              {[
                ["Historical payroll", "Imported"],
                ["Tax records", "Validated"],
                ["Parallel run", "Scheduled"],
                ["Go-live date", "Selected"],
              ].map(([item, status]) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    <span className="text-sm font-bold text-white">{item}</span>
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                    {status}
                  </span>
                </div>
              ))}
              <div className="rounded-lg border border-blue-400/20 bg-blue-400/10 p-4">
                <div className="flex items-start gap-3">
                  <FileCheck2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-300" />
                  <p className="text-sm font-semibold leading-6 text-blue-50">
                    Your specialist reconciles every import before payroll goes
                    live.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              Fear addressers
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              The scary parts are exactly where we do the most work.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {fears.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.fear}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-lg border ${item.tone}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black leading-7 text-slate-950">
                    {item.fear}
                  </h3>
                  <p className="mt-4 text-base font-semibold leading-7 text-slate-600">
                    {item.resolution}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="migration-process"
        className="border-y border-slate-200 bg-slate-50 px-6 py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-6 lg:grid-cols-[0.75fr_1fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
                Step-by-step migration process
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                A clear path from old provider to first live payroll.
              </h2>
            </div>
            <p className="text-lg font-semibold leading-8 text-slate-600">
              Most teams finish in two weeks because the work is sequenced,
              verified, and owned by one dedicated specialist.
            </p>
          </div>

          <div className="grid gap-4">
            {migrationSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.label}
                  className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[150px_minmax(0,1fr)_180px] md:items-center md:p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">
                      {step.label}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-950">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {step.detail}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 md:text-center">
                    {step.timing}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Data import support
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 md:text-3xl">
                Bring your records from the tools you already use.
              </h2>
            </div>
            <p className="max-w-xl text-sm font-semibold leading-6 text-slate-600">
              We support direct exports, structured files, and guided cleanup
              for messy historical payroll data.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {providers.map((provider) => (
              <div
                key={provider}
                className="flex min-h-14 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <Check className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                <span className="font-black text-slate-800">{provider}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-lg border border-emerald-200 bg-emerald-50 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
                Guarantee
              </p>
              <h2 className="mt-2 max-w-3xl text-2xl font-black leading-9 text-slate-950 md:text-3xl">
                If our migration causes errors on your first payroll, we cover
                penalties.
              </h2>
            </div>
          </div>
          <Link
            href={bookingHref}
            className="inline-flex h-12 flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-emerald-800"
          >
            Talk to a migration specialist
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <MigrationInterestForm />

      <Footer />
    </main>
  );
}
