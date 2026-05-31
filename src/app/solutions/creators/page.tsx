import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  FileCheck2,
  Layers,
  MapPinned,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import InteractiveMockup from "@/components/InteractiveMockup";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Payroll for Creators, LLCs & S-Corps | CircleWorks",
  description:
    "CircleWorks helps creators, influencers, YouTubers, freelancers, LLCs, and S-corps pay themselves, pay contractors, file 1099s, and stay tax-compliant.",
  alternates: {
    canonical: "/solutions/creators",
  },
  openGraph: {
    title: "Payroll Built for Creators, Not Corporations | CircleWorks",
    description:
      "Pay yourself as an owner, pay 1099 contractors, track write-offs, and handle creator tax workflows in one payroll platform.",
    type: "website",
    url: "/solutions/creators",
  },
};

type IconItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type FaqItem = {
  question: string;
  answer: string;
};

const painPoints: IconItem[] = [
  {
    title: "Pay yourself as owner",
    description:
      "Run reliable owner payroll for LLC or S-corp compensation without turning your creator business into an HR department.",
    icon: Wallet,
  },
  {
    title: "Pay 1099 editors and contractors",
    description:
      "Send payments to editors, VAs, designers, managers, and other collaborators with clean records for every engagement.",
    icon: Users,
  },
  {
    title: "Stay tax-compliant across states",
    description:
      "Keep payroll, contractor forms, and filing timelines organized as your audience, team, and work locations change.",
    icon: MapPinned,
  },
];

const steps: IconItem[] = [
  {
    title: "Set up your creator entity",
    description:
      "Add your LLC or S-corp, choose how you pay yourself, and connect the bank account that funds payroll.",
    icon: Building2,
  },
  {
    title: "Add yourself and contractors",
    description:
      "Invite editors, VAs, designers, and collaborators to complete onboarding details before their first payment.",
    icon: Users,
  },
  {
    title: "Run payroll and file automatically",
    description:
      "Pay yourself, pay contractors, and let CircleWorks keep tax forms, 1099-NEC filing, and records current.",
    icon: FileCheck2,
  },
];

const features: IconItem[] = [
  {
    title: "S-corp owner payroll",
    description:
      "Create a repeatable salary workflow for owner-employees with payroll records ready for tax season.",
    icon: Wallet,
  },
  {
    title: "Automatic 1099-NEC filing",
    description:
      "Collect contractor details, track payments, and file 1099-NEC forms without a January scramble.",
    icon: FileCheck2,
  },
  {
    title: "Quarterly estimated tax help",
    description:
      "See estimated-tax reminders and owner-pay context so quarterly planning stays close to payroll.",
    icon: Calculator,
  },
  {
    title: "Expense tracking for write-offs",
    description:
      "Capture creator business expenses, receipts, categories, and reimbursements for cleaner write-off support.",
    icon: Receipt,
  },
  {
    title: "Multi-brand and entity switching",
    description:
      "Move between channels, brands, LLCs, or entities without mixing contractor history and payroll records.",
    icon: Layers,
  },
];

const faqs: FaqItem[] = [
  {
    question: "Is CircleWorks built for solo creators?",
    answer:
      "Yes. The creator path is designed for solo operators who need owner payroll, contractor payments, tax forms, and simple business records without enterprise HR complexity.",
  },
  {
    question: "Can I pay myself through my S-corp?",
    answer:
      "Yes. CircleWorks supports owner payroll workflows for S-corp creators, including recurring salary setup and payroll records for tax season.",
  },
  {
    question: "Can I pay editors, VAs, designers, and other contractors?",
    answer:
      "Yes. You can onboard 1099 contractors, collect the details needed for tax forms, and pay them from the same payroll workspace.",
  },
  {
    question: "Do you file 1099-NEC forms for contractors?",
    answer:
      "Yes. CircleWorks tracks eligible 1099 payments and supports automatic 1099-NEC filing so year-end contractor reporting is handled.",
  },
  {
    question: "Can I use CircleWorks if my contractors are in different states?",
    answer:
      "Yes. CircleWorks is built for distributed teams and helps keep contractor records, payroll context, and compliance workflows organized across states.",
  },
  {
    question: "Does CircleWorks help with quarterly estimated taxes?",
    answer:
      "Yes. The creator workflow includes quarterly estimated-tax help so you can plan around owner pay, contractor spend, and business income.",
  },
  {
    question: "Can I track creator expenses for write-offs?",
    answer:
      "Yes. You can track expenses, receipts, and categories such as editing, gear, software, travel, contractors, and production costs.",
  },
  {
    question: "Can I manage multiple brands or entities?",
    answer:
      "Yes. Multi-brand and entity switching keeps payroll, contractors, documents, and reporting separated while still using one CircleWorks account.",
  },
];

const faqSchema = {
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

export default function CreatorsSolutionPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#0A1628] selection:bg-blue-100 selection:text-[#0A1628]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
                  { label: "Creators" },
                ]}
                variant="dark"
              />
            </div>

            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-100">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Creator payroll
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Payroll built for creators, not corporations
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-300 md:text-xl">
              Pay yourself from your LLC or S-corp, pay a small bench of
              contractors, and keep creator taxes organized without buying a
              full corporate HR suite.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-black text-blue-700 shadow-xl shadow-black/10 transition hover:bg-blue-50"
              >
                Start Free
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-base font-black text-white transition hover:bg-white/10"
              >
                See how it works
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-blue-100">
              {["Owner payroll", "1099 contractors", "Tax filing", "Expenses"].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 rounded-full bg-white/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/30 backdrop-blur">
              <InteractiveMockup
                accent="#2563eb"
                initialTab="payroll"
                moduleName="Creator payroll"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Creator pain points"
            title="Run the business side without slowing down the creative side"
            description="CircleWorks keeps the small-team money workflows creators actually need close together: owner payroll, contractor payments, tax forms, and records."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {painPoints.map((item) => (
              <IconCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="How it works"
            title="Three steps from creator admin to clean payroll"
            description="Set the foundation once, then reuse the same payroll and contractor workflows as your channel, brand, or studio grows."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="relative rounded-lg border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#0A1628]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1628] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-100">
              Creator features
            </p>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">
              Payroll, 1099s, taxes, and write-off tracking in one creator stack
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-300">
              Keep your owner pay, contractors, documents, and business expenses
              close enough that tax season does not become a forensic project.
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
        <div className="mx-auto max-w-6xl overflow-hidden rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8 shadow-sm md:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-blue-700 shadow-sm">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Creator-friendly pricing
              </p>
              <h2 className="text-3xl font-black tracking-tight text-[#0A1628] md:text-4xl">
                Start with contractor payments, add owner payroll when you are
                ready
              </h2>
              <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-slate-600">
                CircleWorks pricing stays simple as your creator business moves
                from solo work to an LLC, S-corp, multi-brand studio, or a small
                contractor bench.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              View pricing
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Creator FAQ"
            title="Questions creators ask before switching"
            description="Short answers for LLC owners, S-corp creators, YouTubers, influencers, freelancers, and small creator studios."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <summary className="cursor-pointer list-none text-base font-black text-[#0A1628]">
                  <span className="flex items-start justify-between gap-4">
                    {faq.question}
                    <span className="mt-1 text-blue-600 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-lg bg-[#0A1628] px-6 py-12 text-center text-white shadow-2xl shadow-slate-900/20 md:px-12">
          <p className="mb-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-100">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Built for creator operators
          </p>
          <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
            Pay yourself, pay your team, and keep tax season calm
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-slate-300">
            Start free and build the payroll workflow your creator business
            needs before the admin work starts taking over.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/signup"
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
