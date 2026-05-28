import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Building2, CheckCircle2, FileText, Landmark, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import statesJson from "../../../../data/states.json";
import {
  createBreadcrumbJsonLd,
  getRelatedStateGuideLinks,
  getStateGuideSlug,
} from "@/lib/internal-links";

export const revalidate = 604800;
export const dynamicParams = false;

type StatePayrollData = {
  name: string;
  abbreviation: string;
  slug: string;
  incomeTaxRates: string;
  minimumWage: string;
  payFrequencyRules: string;
  suiRate: string;
  keyAgencies: string[];
  localMinimumWage: string;
  payrollTax: string;
  newHireReporting: string;
  workersComp: string;
  paidLeave: string;
  finalPayRules: string;
  uniqueRules: string;
};

const states = statesJson as StatePayrollData[];

const sectionLabels = [
  "State income tax",
  "State payroll tax",
  "Minimum wage",
  "Pay frequency requirements",
  "New hire reporting",
  "Workers comp",
  "Paid leave laws",
  "Final pay rules",
  "Unique payroll rules",
  "How CircleWorks handles payroll",
];

function getState(slug: string) {
  return states.find((state) => state.slug === slug || getStateGuideSlug(state) === slug);
}

function buildFaqs(state: StatePayrollData) {
  return [
    {
      question: `Does ${state.name} have state income tax withholding?`,
      answer: `${state.incomeTaxRates}. Employers should configure employee withholding before the first ${state.name} payroll run.`,
    },
    {
      question: `What is the minimum wage in ${state.name} for 2025?`,
      answer: `${state.minimumWage}. ${state.localMinimumWage}`,
    },
    {
      question: `How often do employees need to be paid in ${state.name}?`,
      answer: state.payFrequencyRules,
    },
    {
      question: `Where do employers report new hires in ${state.name}?`,
      answer: state.newHireReporting,
    },
    {
      question: `Is workers compensation required in ${state.name}?`,
      answer: state.workersComp,
    },
    {
      question: `Does ${state.name} require paid leave?`,
      answer: state.paidLeave,
    },
    {
      question: `When is final pay due in ${state.name}?`,
      answer: state.finalPayRules,
    },
    {
      question: `How does CircleWorks help with ${state.name} payroll?`,
      answer: `CircleWorks centralizes ${state.name} withholding setup, pay schedules, new hire reporting reminders, agency account tracking, payroll previews, and audit-ready records in one workflow.`,
    },
  ];
}

export function generateStaticParams() {
  return states.flatMap((state) => [
    { slug: state.slug },
    { slug: getStateGuideSlug(state) },
  ]);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const state = getState(resolvedParams.slug);
  if (!state) {
    return {
      title: "Payroll Guide | CircleWorks",
    };
  }

  return {
    title: `How to Run Payroll in ${state.name} - 2025 Complete Guide | CircleWorks`,
    description: `Learn ${state.name} payroll taxes, minimum wage, pay frequency rules, new hire reporting, workers comp, paid leave, final pay rules, and how CircleWorks helps.`,
    alternates: {
      canonical: `https://circleworks.com/guides/${getStateGuideSlug(state)}`,
    },
    openGraph: {
      title: `How to Run Payroll in ${state.name} - 2025 Complete Guide`,
      description: `A practical 2025 ${state.name} payroll guide for US employers covering tax, wage, leave, and agency requirements.`,
      url: `https://circleworks.com/guides/${getStateGuideSlug(state)}`,
      type: "article",
    },
  };
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-[#0A1628]">{value}</p>
    </div>
  );
}

export default async function StatePayrollGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const state = getState(resolvedParams.slug);
  if (!state) notFound();

  const faqs = buildFaqs(state);
  const relatedGuides = getRelatedStateGuideLinks(state);
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: "Home", href: "/" },
    { label: "Guides", href: "/guides" },
    { label: `${state.name} payroll guide`, href: `/guides/${getStateGuideSlug(state)}` },
  ]);
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to run payroll in ${state.name}`,
    description: `A 2025 employer guide to running payroll in ${state.name}.`,
    totalTime: "PT30M",
    supply: [
      { "@type": "HowToSupply", name: `${state.name} withholding account` },
      { "@type": "HowToSupply", name: `${state.name} unemployment account` },
      { "@type": "HowToSupply", name: "Employee tax forms and payroll records" },
    ],
    step: sectionLabels.map((label, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: label,
      text: `Review ${label.toLowerCase()} requirements for ${state.name} and configure payroll before processing wages.`,
    })),
  };

  return (
    <main className="min-h-screen bg-white text-[#0A1628]">
      <Navbar forceLight />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="bg-[#0A1628] px-6 pb-20 pt-36 text-white lg:pt-44">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="text-[12px] font-black uppercase tracking-[0.24em] text-cyan-300">
              State Payroll Guide
            </p>
            <h1 className="mt-5 text-[38px] font-black leading-[1.05] tracking-tight sm:text-[52px] lg:text-[64px]">
              How to Run Payroll in {state.name} &mdash; 2025 Complete Guide
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
              A practical employer guide to {state.name} payroll taxes, wage rules, new hire reporting,
              paid leave, workers compensation, final pay, and the agency accounts you need before running payroll.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
            <FileText size={18} />
            {state.name} payroll summary
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <SummaryItem label="Income tax rates" value={state.incomeTaxRates} />
            <SummaryItem label="Min wage" value={state.minimumWage} />
            <SummaryItem label="Pay frequency" value={state.payFrequencyRules} />
            <SummaryItem label="SUI rate" value={state.suiRate} />
            <SummaryItem label="Key agencies" value={state.keyAgencies.join(", ")} />
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">On this page</p>
              <nav className="space-y-2 text-sm">
                {sectionLabels.map((label) => (
                  <a key={label} href={`#${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="block rounded-md px-2 py-1.5 text-slate-600 hover:bg-slate-50 hover:text-blue-700">
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="space-y-12">
            <section id="state-income-tax">
              <h2 className="text-3xl font-black tracking-tight">State income tax</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                {state.incomeTaxRates}. Employers running payroll in {state.name} should collect the correct{" "}
                <Link href="/glossary/state-income-tax" className="font-bold text-blue-700 hover:text-blue-900">
                  state income tax
                </Link>{" "}
                withholding setup, validate employee work and residence locations, and remit withholding on the schedule assigned by the state.
              </p>
            </section>

            <section id="state-payroll-tax">
              <h2 className="text-3xl font-black tracking-tight">State payroll tax</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                {state.payrollTax} CircleWorks Payroll helps employers manage{" "}
                <Link href="/product/payroll" className="font-bold text-blue-700 hover:text-blue-900">
                  SUTA/SUI setup
                </Link>
                , wage bases, and payroll tax workflows. {state.suiRate}.
              </p>
            </section>

            <section id="minimum-wage">
              <h2 className="text-3xl font-black tracking-tight">Minimum wage</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                <Link href="/glossary/minimum-wage" className="font-bold text-blue-700 hover:text-blue-900">
                  Minimum wage
                </Link>{" "}
                in {state.name}: {state.minimumWage}. {state.localMinimumWage} Employers should apply the highest federal, state, or local wage rate that covers the employee.
              </p>
            </section>

            <section id="pay-frequency-requirements">
              <h2 className="text-3xl font-black tracking-tight">Pay frequency requirements</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">{state.payFrequencyRules} Publish regular paydays in writing and make sure payroll cutoffs leave enough time for approvals, taxes, deductions, and direct deposit funding.</p>
            </section>

            <section id="new-hire-reporting">
              <h2 className="text-3xl font-black tracking-tight">New hire reporting</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                <Link href="/glossary/new-hire-report" className="font-bold text-blue-700 hover:text-blue-900">
                  New hire reporting
                </Link>{" "}
                in {state.name}: {state.newHireReporting} Keep the employee name, address, SSN, start date, and employer account details available for audit support.
              </p>
            </section>

            <section id="workers-comp">
              <h2 className="text-3xl font-black tracking-tight">Workers comp</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">{state.workersComp} Payroll classification, owner exclusions, remote work locations, and industry risk codes can change coverage and premium requirements.</p>
            </section>

            <section id="paid-leave-laws">
              <h2 className="text-3xl font-black tracking-tight">Paid leave laws</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">{state.paidLeave} Configure accruals, payroll deductions, wage replacement contributions, and local leave requirements before the first affected pay period.</p>
            </section>

            <section id="final-pay-rules">
              <h2 className="text-3xl font-black tracking-tight">Final pay rules</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">{state.finalPayRules} Include earned wages, approved reimbursements, required PTO or vacation payout, and any lawful deductions.</p>
            </section>

            <section id="unique-payroll-rules">
              <h2 className="text-3xl font-black tracking-tight">Unique {state.name} payroll rules</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">{state.uniqueRules}</p>
            </section>

            <section id="how-circleworks-handles-payroll" className="rounded-lg bg-[#0A1628] p-8 text-white">
              <div className="flex items-center gap-3 text-cyan-300">
                <ShieldCheck size={24} />
                <span className="text-sm font-black uppercase tracking-[0.2em]">CircleWorks</span>
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-tight">How CircleWorks handles {state.name}</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-300">
                CircleWorks keeps {state.name} payroll setup, agency accounts, tax withholding, pay schedules,
                new hire tasks, leave policies, final pay workflows, and payroll audit history connected in one place.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/product/payroll" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#0A1628] transition hover:bg-blue-50">
                  Explore payroll software
                  <ArrowRight size={16} />
                </Link>
                <Link href="/signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-700">
                  Start Free
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>

            <section id="faq">
              <h2 className="text-3xl font-black tracking-tight">{state.name} payroll FAQ</h2>
              <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
                {faqs.map((faq) => (
                  <details key={faq.question} className="group p-5">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-black">
                      {faq.question}
                      <span className="mt-1 text-blue-600 transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>

            <section id="related-guides">
              <h2 className="text-3xl font-black tracking-tight">Related payroll guides</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {relatedGuides.map((guide) => (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                      State guide
                    </span>
                    <h3 className="mt-3 text-lg font-black text-[#0A1628]">{guide.label}</h3>
                  </Link>
                ))}
              </div>
            </section>
          </article>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-6 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-blue-700">
              <Landmark size={18} />
              {state.abbreviation} payroll
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Let CircleWorks handle {state.name} payroll for you.</h2>
            <p className="mt-2 max-w-2xl text-slate-600">Run payroll with built-in workflows for taxes, new hires, pay schedules, compliance tasks, and employee records.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/product/payroll" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#0A1628] ring-1 ring-slate-200 transition hover:bg-blue-50">
              Explore Payroll
              <ArrowRight size={16} />
            </Link>
            <Link href="/signup" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-700">
              Start Free
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 text-sm text-slate-500">
          <Building2 size={16} />
          <span>Primary agencies: {state.keyAgencies.join(" | ")}</span>
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Reviewed for 2025 guide structure. Confirm agency notices before filing.</span>
        </div>
      </section>

      <Footer />
    </main>
  );
}
