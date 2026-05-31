import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Layers,
  Receipt,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import InteractiveMockup from "@/components/InteractiveMockup";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Payroll for Staffing, Creative & Talent Agencies | CircleWorks",
  description:
    "CircleWorks helps agencies pay mixed W-2 and 1099 teams, run contractor-heavy payroll, track project costs, bill clients, and report across multi-client rosters.",
  alternates: {
    canonical: "/solutions/agencies",
  },
  openGraph: {
    title: "Agency Payroll and Contractor Payments | CircleWorks",
    description:
      "Run payroll for your internal team and your clients' contractors with project cost tracking, markup visibility, and per-client reporting.",
    type: "website",
    url: "/solutions/agencies",
  },
};

type IconItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const painPoints: IconItem[] = [
  {
    title: "Mixed W-2 + 1099 workforce",
    description:
      "Pay internal employees, project staff, editors, models, designers, recruiters, and freelance talent without splitting every run across tools.",
    icon: Users,
  },
  {
    title: "Per-project pay",
    description:
      "Keep contractor payments tied to the job, campaign, placement, event, or client account that created the work.",
    icon: ClipboardList,
  },
  {
    title: "Client billing",
    description:
      "See bill-rate versus pay-rate context before payroll becomes a margin mystery for finance and account leads.",
    icon: Receipt,
  },
  {
    title: "Multi-client visibility",
    description:
      "Switch between client rosters, pay schedules, payment approvals, and 1099 readiness without losing the agency-wide view.",
    icon: Layers,
  },
];

const features: IconItem[] = [
  {
    title: "Bulk contractor payments",
    description:
      "Queue and submit contractor payments in one run, with ACH-ready details, W-9 status, and 1099 thresholds visible before approval.",
    icon: WalletCards,
  },
  {
    title: "Project and client cost tracking",
    description:
      "Allocate pay to projects, clients, departments, and placements so payroll data flows cleanly into client reporting.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Markup visibility",
    description:
      "Track bill-rate versus pay-rate on agency labor so operators can protect margin before invoices go out.",
    icon: BarChart3,
  },
  {
    title: "Consolidated multi-client dashboard",
    description:
      "Give agency leadership one place to monitor payroll runs, contractor spend, approvals, compliance blockers, and client volume.",
    icon: Building2,
  },
  {
    title: "Per-client reporting",
    description:
      "Export clean views for each client: workers paid, project spend, markup, 1099 status, and payroll history.",
    icon: FileText,
  },
];

const proofPoints = [
  "Mixed payroll runs",
  "Client cost centers",
  "1099 filing",
  "Markup tracking",
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <p className="mb-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-black tracking-tight text-[#0A1628] md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-lg font-medium leading-8 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function IconCard({ item }: { item: IconItem }) {
  const Icon = item.icon;

  return (
    <article className="h-full rounded-lg border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-black text-[#0A1628]">{item.title}</h3>
      <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
        {item.description}
      </p>
    </article>
  );
}

export default function AgenciesSolutionPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#0A1628] selection:bg-blue-100 selection:text-[#0A1628]">
      <Navbar />

      <section className="relative overflow-hidden border-b border-white/10 bg-[#0A1628] px-4 pb-20 pt-32 text-white sm:px-6 lg:px-8 lg:pb-28 lg:pt-44">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] lg:items-center">
          <div>
            <div className="mb-8">
              <Breadcrumb
                items={[
                  { label: "Home", href: "/" },
                  { label: "Solutions", href: "/solutions" },
                  { label: "Agencies" },
                ]}
                variant="dark"
              />
            </div>

            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-100">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Agency payroll
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Run payroll for your team and your clients&apos; contractors
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-300 md:text-xl">
              CircleWorks gives staffing, creative, marketing, and talent
              agencies one place to pay internal teams, 1099 rosters, and
              client-billed project workers.
            </p>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-blue-100">
              Built for agencies that operate payroll and contractor payments,
              not the accountant partner program.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup?accountType=agency"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-black text-blue-700 shadow-xl shadow-black/10 transition hover:bg-blue-50"
              >
                Start Free
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="#features"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-base font-black text-white transition hover:bg-white/10"
              >
                See agency features
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-blue-100">
              {proofPoints.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 rounded-full bg-white/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/30 backdrop-blur">
              <InteractiveMockup
                accent="#2563eb"
                initialTab="payroll"
                moduleName="Agency payroll"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Agency pain points"
            title="Stop forcing client work, contractor pay, and payroll into separate systems"
            description="Agencies need fast payment workflows, clean client allocation, and visibility across rosters that change by project."
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {painPoints.map((item) => (
              <IconCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="bg-[#0A1628] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-100">
              Agency features
            </p>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">
              Contractor-heavy payroll with the billing context agencies need
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-300">
              Keep worker payments, client cost tracking, margin visibility, and
              reporting in one operating layer for every active client.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-lg border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/10"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-400/15 text-blue-200">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-300">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8">
              <p className="mb-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                Client-ready operations
              </p>
              <h2 className="text-3xl font-black tracking-tight text-[#0A1628] md:text-4xl">
                Pay the roster once. Report the work by client.
              </h2>
              <p className="mt-5 text-base font-medium leading-8 text-slate-600">
                CircleWorks keeps payroll execution and client reporting tied
                together so every contractor payment has the client, project,
                rate, and filing status finance needs.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["4", "active clients", "Visibility across open rosters"],
                ["138", "contractor payments", "Bulk ACH queued this month"],
                ["22%", "average markup", "Bill-rate vs pay-rate tracked"],
              ].map(([value, label, detail]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-4xl font-black text-blue-700">{value}</p>
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.16em] text-[#0A1628]">
                    {label}
                  </p>
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-lg bg-[#0A1628] px-6 py-12 text-center text-white shadow-2xl shadow-slate-900/20 md:px-12">
          <p className="mb-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-100">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Built for contractor-heavy agencies
          </p>
          <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
            Run agency payroll without losing client-level clarity
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-slate-300">
            Start free and give operations, finance, and account teams one
            shared view of who was paid, which client it belongs to, and what is
            ready to bill or file.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/signup?accountType=agency"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-black text-blue-700 transition hover:bg-blue-50"
            >
              Start Free
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
