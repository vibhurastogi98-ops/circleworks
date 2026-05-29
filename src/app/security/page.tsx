"use client";

import { useReducer } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bug,
  Building2,
  ChevronDown,
  Cloud,
  Database,
  EyeOff,
  FileCheck2,
  Fingerprint,
  Globe2,
  KeyRound,
  Landmark,
  LockKeyhole,
  Mail,
  ServerCog,
  ShieldCheck,
  UserCheck,
  UsersRound,
} from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const certifications = [
  { name: "SOC 2 Type II", detail: "Annual audit", icon: ShieldCheck },
  { name: "HIPAA Ready", detail: "Healthcare controls", icon: LockKeyhole },
  { name: "PCI DSS Level 1", detail: "Payment security", icon: Landmark },
  { name: "GDPR Compliant", detail: "Privacy rights", icon: Globe2 },
  { name: "CCPA Compliant", detail: "Consumer rights", icon: FileCheck2 },
  { name: "E-Verify Partner", detail: "Workforce checks", icon: UserCheck },
];

const pillars = [
  {
    title: "Data Encryption",
    icon: Database,
    items: [
      "AES-256 encryption at rest",
      "TLS 1.3 encryption in transit",
      "Field-level encryption for SSN and bank numbers",
      "Encryption keys rotated quarterly",
    ],
  },
  {
    title: "Access Control",
    icon: KeyRound,
    items: [
      "MFA required for all admin accounts",
      "RBAC role-based access controls",
      "SSO/SAML support for Enterprise",
      "IP allowlisting and 30-minute session timeout",
    ],
  },
  {
    title: "Infrastructure",
    icon: ServerCog,
    items: [
      "AWS us-east-1 primary region",
      "AWS us-west-2 failover region",
      "99.99% uptime SLA",
      "Hourly automated backups with 30-day retention",
    ],
  },
  {
    title: "Privacy by Design",
    icon: EyeOff,
    items: [
      "CCPA consumer rights portal",
      "7-year data retention for IRS requirements",
      "No data sold to advertisers",
      "Deletion workflow on account close",
    ],
  },
  {
    title: "Vulnerability Management",
    icon: AlertTriangle,
    items: [
      "Annual third-party penetration testing",
      "Continuous vulnerability scanning",
      "Critical CVE patch SLA within 30 days",
      "Security fixes tracked through closure",
    ],
  },
  {
    title: "Employee Security",
    icon: UsersRound,
    items: [
      "Background checks for all employees",
      "Quarterly security awareness training",
      "Least-privilege access model",
      "Immutable audit trail for all access",
    ],
  },
  {
    title: "Incident Response",
    icon: Fingerprint,
    items: [
      "24-hour breach notification target",
      "Dedicated 24/7 on-call security team",
      "Incident runbooks for all scenarios",
      "Last tabletop test completed in Q1 2026",
    ],
  },
  {
    title: "Vendor Security",
    icon: Building2,
    items: [
      "Security review for every third-party vendor",
      "SOC 2 required for data processors",
      "Annual vendor reassessment",
      "Contractual data-processing controls",
    ],
  },
];

const faqs = [
  {
    question: "Can CircleWorks employees see my payroll data?",
    answer:
      "Only authorized personnel can access customer data, and only for approved support, compliance, or security purposes. Access is controlled by RBAC, least privilege, MFA, and immutable audit logging.",
  },
  {
    question: "What happens if there's a security breach?",
    answer:
      "We activate incident response, contain the issue, investigate scope, notify affected customers within our 24-hour notification target when legally or contractually required, and provide remediation updates through closure.",
  },
  {
    question: "How do you protect SSNs and bank accounts?",
    answer:
      "SSNs and bank account numbers use field-level encryption in addition to AES-256 at rest and TLS 1.3 in transit. Access is restricted, logged, and reviewed.",
  },
  {
    question: "Is my data backed up?",
    answer:
      "Yes. CircleWorks runs hourly automated backups with 30-day retention and tests disaster recovery procedures quarterly.",
  },
  {
    question: "What is your uptime SLA?",
    answer:
      "CircleWorks targets a 99.99% uptime SLA for Enterprise customers, supported by AWS us-east-1 primary infrastructure and us-west-2 failover planning.",
  },
  {
    question: "Can I get a copy of your SOC 2 report?",
    answer:
      "Yes. Customers and qualified prospects can request security documentation, including SOC 2 materials, by contacting security@circleworks.com.",
  },
  {
    question: "Do you support SSO?",
    answer:
      "Yes. Enterprise customers can configure SSO/SAML, MFA policies, RBAC, IP allowlisting, and session timeout controls.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "You can export your records before account close. CircleWorks follows contractual retention, legal hold, tax, payroll, and deletion requirements before removing eligible data.",
  },
];

type FAQState = {
  openIndex: number | null;
};

type FAQAction = {
  type: "toggle";
  index: number;
};

function faqReducer(state: FAQState, action: FAQAction): FAQState {
  if (action.type === "toggle") {
    return { openIndex: state.openIndex === action.index ? null : action.index };
  }

  return state;
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628] md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
          {description}
        </p>
      )}
    </div>
  );
}

export default function SecurityPage() {
  const [faqState, dispatchFAQ] = useReducer(faqReducer, { openIndex: 0 });

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-200 selection:text-slate-950">
      <Navbar />

      <section className="border-b border-slate-200 bg-white px-6 pb-16 pt-32 lg:pt-40">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700">
              <ShieldCheck size={14} />
              Trust & Security Center
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-[#0A1628] sm:text-5xl lg:text-[48px]">
              Enterprise-grade security for your people data.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              We protect sensitive payroll, benefits, and employee data using the
              same standards as major US banks and healthcare systems.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {certifications.map((certification) => (
              <div
                key={certification.name}
                className="flex min-h-[210px] flex-col items-center justify-between rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  <certification.icon size={36} />
                </div>
                <div>
                  <h2 className="mt-4 text-sm font-black text-[#0A1628]">
                    {certification.name}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {certification.detail}
                  </p>
                  <a
                    href="mailto:security@circleworks.com?subject=Security%20report%20request"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-black text-blue-700 hover:text-blue-800"
                  >
                    View Report
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Security Pillars"
            title="Controls built for payroll, HR, and benefits data"
            description="CircleWorks layers administrative, technical, and operational controls across every system that stores or processes people data."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <pillar.icon size={22} />
                </div>
                <h3 className="text-lg font-black text-[#0A1628]">{pillar.title}</h3>
                <ul className="mt-5 space-y-3">
                  {pillar.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                      <ShieldCheck size={16} className="mt-0.5 shrink-0 text-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-7 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-black text-[#0A1628]">
              Independent Security Testing
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              CircleWorks completes an annual penetration test by Cobalt Labs. Most
              recent test: Q4 2025. All critical and high findings were remediated
              within 30 days.
            </p>
            <a
              href="mailto:security@circleworks.com?subject=Pentest%20summary%20request"
              className="mt-5 inline-flex text-sm font-black text-blue-700 hover:text-blue-800"
            >
              Request pentest summary
            </a>
          </div>

          <div className="rounded-lg border border-slate-200 p-7 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Bug size={24} />
            </div>
            <h2 className="text-xl font-black text-[#0A1628]">
              Responsible Disclosure
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Our HackerOne program covers the web app, API, and mobile surfaces.
              Rewards range from $500 to $10,000 based on severity. Direct reports
              are welcome at security@circleworks.com.
            </p>
            <Link
              href="https://hackerone.com/"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex text-sm font-black text-blue-700 hover:text-blue-800"
            >
              View HackerOne program
            </Link>
          </div>

          <div className="rounded-lg border border-slate-200 p-7 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Cloud size={24} />
            </div>
            <h2 className="text-xl font-black text-[#0A1628]">
              Your data never leaves the USA
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Customer data is stored in AWS us-east-1 in Northern Virginia. We do
              not process customer data outside US territory and maintain
              ITAR-aligned data handling procedures.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
              Trust FAQ
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628] md:text-4xl">
              Security questions teams ask before rollout
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              For questionnaires, vendor reviews, or security architecture requests,
              contact our team directly.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white">
            {faqs.map((faq, index) => {
              const isOpen = faqState.openIndex === index;
              return (
                <div key={faq.question} className="border-b border-slate-200 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => dispatchFAQ({ type: "toggle", index })}
                    className="flex w-full items-center justify-between gap-5 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-bold text-[#0A1628]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={17}
                      className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className="text-sm leading-7 text-slate-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1628] px-6 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
              Security Team
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Questions about security? Contact our security team.
            </h2>
            <a
              href="mailto:security@circleworks.com"
              className="mt-3 inline-flex items-center gap-2 text-blue-100 hover:text-white"
            >
              <Mail size={18} />
              security@circleworks.com
            </a>
          </div>
          <a
            href="mailto:security@circleworks.com?subject=Request%20Security%20Docs"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-white px-6 text-sm font-black text-[#0A1628] transition hover:bg-blue-50"
          >
            Request Security Docs
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
