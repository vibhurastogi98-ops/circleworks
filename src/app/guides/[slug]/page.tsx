import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  FileText,
  Landmark,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  createBreadcrumbJsonLd,
  getRelatedStateGuideLinks,
} from "@/lib/internal-links";
import {
  getRelatedStateGuides,
  getStateGuideHref,
  getStatePayrollGuide,
  statePayrollGuides,
  type StatePayrollGuide,
} from "@/lib/state-payroll-guides";

const SITE_URL = "https://circleworks.com";

export const revalidate = 604800;
export const dynamicParams = false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

const sectionLinks = [
  ["state-income-tax", "State Income Tax"],
  ["state-payroll-tax", "State Payroll Tax"],
  ["minimum-wage", "Minimum Wage"],
  ["pay-frequency", "Pay Frequency"],
  ["new-hire-reporting", "New Hire Reporting"],
  ["workers-compensation", "Workers' Compensation"],
  ["paid-leave", "Paid Leave"],
  ["final-pay", "Final Pay"],
  ["unique-rules", "Unique Rules"],
  ["circleworks", "CircleWorks"],
] as const;

export function generateStaticParams() {
  return statePayrollGuides.map((state) => ({ slug: state.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const state = getStatePayrollGuide(slug);

  if (!state) {
    return {
      title: "Payroll Guide 2026 | CircleWorks",
    };
  }

  const canonical = `${SITE_URL}${getStateGuideHref(state)}`;

  return {
    title: `${state.stateName} Payroll Guide 2026 | CircleWorks`,
    description: `Complete guide to running payroll in ${state.stateName}: tax rates, minimum wage, compliance rules, new hire reporting, final pay, paid leave, and agency setup.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${state.stateName} Payroll Guide 2026 | CircleWorks`,
      description: `Payroll tax, minimum wage, final pay, paid leave, and compliance guide for ${state.stateName} employers.`,
      url: canonical,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${state.stateName} Payroll Guide 2026 | CircleWorks`,
      description: `Complete ${state.stateName} payroll compliance guide for 2026.`,
    },
  };
}

function buildFaqs(state: StatePayrollGuide) {
  return [
    {
      question: `How do I run payroll in ${state.stateName} in 2026?`,
      answer: `Register with the required ${state.stateName} payroll agencies, collect employee withholding forms, configure unemployment insurance, apply minimum wage and payday rules, report new hires, and run payroll on a documented schedule.`,
    },
    {
      question: `Does ${state.stateName} have state income tax withholding?`,
      answer: `${state.incomeTaxSummary}. Employers should use ${state.withholdingForm} and the state agency's current withholding tables when configuring payroll.`,
    },
    {
      question: `What is the 2026 minimum wage in ${state.stateName}?`,
      answer: `${state.minimumWage.statewide}. ${state.minimumWage.note}`,
    },
    {
      question: `How often must employees be paid in ${state.stateName}?`,
      answer: state.payFrequencyRules,
    },
    {
      question: `When do I report new hires in ${state.stateName}?`,
      answer: state.newHireReportingDeadline,
    },
    {
      question: `Is workers' compensation required in ${state.stateName}?`,
      answer: state.workerCompNotes,
    },
    {
      question: `Does ${state.stateName} have paid leave payroll rules?`,
      answer: state.paidLeavePrograms,
    },
    {
      question: `When is final pay due in ${state.stateName}?`,
      answer: state.finalPayRules,
    },
  ];
}

function QuickFact({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold leading-relaxed text-[#0A1628]">
        {value}
      </p>
    </>
  );

  if (!href) {
    return <div className="rounded-lg bg-white p-4 ring-1 ring-slate-200">{content}</div>;
  }

  return (
    <Link
      href={href}
      className="rounded-lg bg-white p-4 ring-1 ring-slate-200 transition hover:ring-blue-300"
      target="_blank"
      rel="noreferrer"
    >
      {content}
    </Link>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-3xl font-black tracking-tight text-[#0A1628]">{title}</h2>
      <div className="mt-5 text-lg leading-8 text-slate-600">{children}</div>
    </section>
  );
}

function DataNote({ state }: { state: StatePayrollGuide }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-900">
      <p className="font-black">2026 payroll compliance note</p>
      <p className="mt-1">
        Payroll law changes frequently. This guide was reviewed on{" "}
        {state.dataLastReviewed}; confirm final rates, thresholds, and notices with the
        official agencies linked below before filing.
      </p>
    </div>
  );
}

export default async function StatePayrollGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const state = getStatePayrollGuide(slug);

  if (!state) notFound();

  const canonical = `${SITE_URL}${getStateGuideHref(state)}`;
  const faqs = buildFaqs(state);
  const relatedGuides = getRelatedStateGuides(state);
  const relatedLinks = getRelatedStateGuideLinks(state);
  const primaryAgency = state.keyAgencies[0];
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: "Home", href: "/" },
    { label: "Guides", href: "/guides" },
    { label: `${state.stateName} payroll guide`, href: getStateGuideHref(state) },
  ]);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `How to Run Payroll in ${state.stateName} - 2026 Complete Guide`,
    description: `Complete guide to running payroll in ${state.stateName}: tax rates, minimum wage, compliance rules, new hire reporting, final pay, paid leave, and agency setup.`,
    author: {
      "@type": "Organization",
      name: "CircleWorks",
    },
    publisher: {
      "@type": "Organization",
      name: "CircleWorks",
    },
    dateModified: state.dataLastReviewed,
    mainEntityOfPage: canonical,
  };

  return (
    <main className="min-h-screen bg-white text-[#0A1628]">
      <Navbar forceLight />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <section className="bg-[#0A1628] px-6 pb-20 pt-36 text-white lg:pt-44">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="text-[12px] font-black uppercase tracking-[0.24em] text-cyan-300">
              {state.abbreviation} Payroll Guide
            </p>
            <h1 className="mt-5 text-[38px] font-black leading-[1.05] tracking-tight sm:text-[52px] lg:text-[64px]">
              How to Run Payroll in {state.stateName}{" "}
              <span aria-hidden="true">&mdash;</span> 2026 Complete Guide
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
              A practical guide to {state.stateName}{" "}payroll taxes, minimum wage,
              unemployment insurance, new hire reporting, paid leave, workers&apos;
              compensation, final pay, and agency setup.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Start Free Today
              </Link>
              <Link
                href="/product/payroll"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-black text-[#0A1628] transition hover:bg-blue-50"
              >
                See Payroll Automation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl border-l-4 border-blue-600 bg-white/70 p-5">
          <div className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
            <FileText size={18} />
            Quick facts
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <QuickFact label="State Income Tax" value={state.incomeTaxSummary} />
            <QuickFact
              label="Minimum Wage"
              value={`${state.minimumWage.statewide} (${state.minimumWage.effectiveDate})`}
            />
            <QuickFact label="Pay Frequency" value={state.payFrequencyRules} />
            <QuickFact label="SUI Rate Range" value={state.suiRateRange} />
            <QuickFact
              label="Key Payroll Agency"
              value={primaryAgency.name}
              href={primaryAgency.website}
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                On This Page
              </p>
              <nav className="space-y-2 text-sm">
                {sectionLinks.map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block rounded-md px-2 py-1.5 text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="space-y-12">
            <DataNote state={state} />

            <Section id="state-income-tax" title="1. State Income Tax">
              <p>
                {state.stateName} payroll withholding starts with the state income
                tax setup. {state.incomeTaxSummary}. Employers should collect{" "}
                {state.withholdingForm}, apply the current withholding tables, and
                verify work and resident-state rules before the first pay run.
              </p>
              <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Bracket</th>
                      <th className="px-4 py-3">Rate</th>
                      <th className="px-4 py-3">Payroll Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {state.incomeTaxRates.map((bracket) => (
                      <tr key={`${bracket.bracket}-${bracket.rate}`}>
                        <td className="px-4 py-3 font-bold text-[#0A1628]">
                          {bracket.bracket}
                        </td>
                        <td className="px-4 py-3 font-black text-blue-700">
                          {bracket.rate}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{bracket.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="state-payroll-tax" title="2. State Payroll Tax">
              <p>
                Employers should register with the state unemployment agency, confirm
                taxable wage bases and experience rates, and keep unemployment
                notices in the payroll file. {state.suiRateRange}
              </p>
            </Section>

            <Section id="minimum-wage" title="3. Minimum Wage">
              <p>
                The 2026 statewide minimum wage for {state.stateName} is{" "}
                <strong>{state.minimumWage.statewide}</strong>. {state.minimumWage.note}
                Employers should always apply the highest federal, state, local,
                industry, or contract rate that covers the employee.
              </p>
              {state.minimumWage.majorCities.length > 0 && (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {state.minimumWage.majorCities.map((city) => (
                    <div
                      key={city.name}
                      className="rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <p className="flex items-center gap-2 text-sm font-black text-[#0A1628]">
                        <MapPin size={16} className="text-blue-600" />
                        {city.name}
                      </p>
                      <p className="mt-2 text-lg font-black text-blue-700">
                        {city.rate}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{city.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section id="pay-frequency" title="4. Pay Frequency Requirements">
              <p>
                {state.payFrequencyRules} Document paydays in writing, align payroll
                cutoff dates with direct deposit funding, and keep approval logs for
                regular and off-cycle runs.
              </p>
            </Section>

            <Section id="new-hire-reporting" title="5. New Hire Reporting">
              <p>
                {state.newHireReportingDeadline} Keep the employee&apos;s legal name,
                address, Social Security number, hire date, and employer account
                information ready before submitting the report.
              </p>
            </Section>

            <Section id="workers-compensation" title="6. Workers' Compensation">
              <p>
                {state.workerCompNotes} Classification codes, owner exclusions,
                remote work locations, and industry risk can affect coverage and
                premiums.
              </p>
            </Section>

            <Section id="paid-leave" title="7. Paid Leave Laws">
              <p>
                {state.paidLeavePrograms} Configure accruals, employee notices,
                payroll deductions, employer premiums, and local sick leave rules
                before the affected pay period begins.
              </p>
            </Section>

            <Section id="final-pay" title="8. Final Pay Rules">
              <p>
                {state.finalPayRules} Include earned wages, approved reimbursements,
                required PTO or vacation payout, and lawful deductions in the final
                payroll workflow.
              </p>
            </Section>

            <Section id="unique-rules" title={`9. Unique ${state.stateName} Rules`}>
              <ul className="space-y-3">
                {state.uniqueRules.map((rule) => (
                  <li key={rule} className="flex gap-3">
                    <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <section
              id="circleworks"
              className="scroll-mt-28 rounded-lg bg-[#0A1628] p-8 text-white"
            >
              <div className="flex items-center gap-3 text-cyan-300">
                <ShieldCheck size={24} />
                <span className="text-sm font-black uppercase tracking-[0.2em]">
                  CircleWorks Payroll
                </span>
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-tight">
                10. How CircleWorks Handles {state.stateName} Payroll
              </h2>
              <ul className="mt-5 space-y-3 text-lg leading-8 text-slate-300">
                <li>Automates withholding setup, pay schedules, and payroll tax workflows.</li>
                <li>Tracks new hire reporting, final pay tasks, and agency account setup.</li>
                <li>Keeps wage, leave, and audit records connected to every employee profile.</li>
              </ul>
              <div className="mt-8 rounded-lg bg-white/10 p-5">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
                  Feature Callout
                </p>
                <p className="mt-2 text-slate-200">
                  CircleWorks turns state payroll requirements into guided tasks,
                  approval checkpoints, payroll previews, and audit-ready records.
                </p>
              </div>
            </section>

            <section className="rounded-lg bg-blue-600 p-8 text-white">
              <h2 className="text-3xl font-black tracking-tight">
                Let CircleWorks automate {state.stateName} payroll for you.
              </h2>
              <p className="mt-3 max-w-2xl text-blue-50">
                Start with payroll, then connect HRIS, onboarding, benefits, time,
                expenses, compliance, and performance in one platform.
              </p>
              <Link
                href="/signup"
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-blue-700 transition hover:bg-blue-50"
              >
                Start Free Today
                <ArrowRight size={16} />
              </Link>
            </section>

            <section id="faq" className="scroll-mt-28">
              <h2 className="text-3xl font-black tracking-tight">
                {state.stateName} Payroll FAQ
              </h2>
              <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
                {faqs.map((faq) => (
                  <details key={faq.question} className="group p-5">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-black">
                      {faq.question}
                      <span className="mt-1 text-blue-600 transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black tracking-tight">Official Sources</h2>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {state.sources.map((source) => (
                  <Link
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    {source.label}
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black tracking-tight">
                Related State Guides
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {relatedGuides.map((guide, index) => (
                  <Link
                    key={guide.slug}
                    href={relatedLinks[index]?.href ?? getStateGuideHref(guide)}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                      {guide.abbreviation} guide
                    </span>
                    <h3 className="mt-3 text-lg font-black text-[#0A1628]">
                      {guide.stateName} Payroll
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          </article>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-6 py-10">
        <div className="mx-auto grid max-w-6xl gap-4 text-sm text-slate-600 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <Landmark className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
            <span>
              Key agencies: {state.keyAgencies.map((agency) => agency.name).join(" | ")}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
            <span>ISR refresh: every 7 days for payroll law updates.</span>
          </div>
          <div className="flex items-start gap-3">
            <BriefcaseBusiness className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
            <span>URL: {getStateGuideHref(state)}</span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
