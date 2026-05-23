"use client";

import React, { useReducer } from "react";
import {
  AlertTriangle,
  Archive,
  ChevronDown,
  Cloud,
  Database,
  Download,
  ExternalLink,
  EyeOff,
  FileCheck2,
  Globe2,
  KeyRound,
  Landmark,
  LockKeyhole,
  Mail,
  RotateCcw,
  ServerCog,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const certifications = [
  { name: "SOC 2 Type II", action: "View Report", icon: ShieldCheck },
  { name: "HIPAA Ready", action: "Download", icon: LockKeyhole },
  { name: "CCPA Compliant", action: "View Report", icon: FileCheck2 },
  { name: "PCI DSS Level 1", action: "Download", icon: Landmark },
  { name: "GDPR", action: "View Report", icon: Globe2 },
  { name: "E-Verify", action: "Download", icon: UserCheck },
];

const pillars = [
  {
    title: "Data Encryption",
    icon: Database,
    items: ["AES-256 at rest", "TLS 1.3 in transit", "Field-level encryption for PII"],
  },
  {
    title: "Access Control",
    icon: KeyRound,
    items: ["MFA", "RBAC", "SSO", "IP allowlisting for Enterprise", "Audit logs"],
  },
  {
    title: "Infrastructure",
    icon: ServerCog,
    items: ["AWS us-east-1", "AWS us-west-2 failover", "Automated backups", "DR plan"],
  },
  {
    title: "Privacy",
    icon: EyeOff,
    items: ["CCPA data rights", "7-year retention", "No ad targeting", "Deletion on request"],
  },
];

const faqs = [
  {
    question: "Can Deel employees see my payroll data?",
    answer: "No. CircleWorks uses role-based access, audit logging, and least-privilege controls so only authorized CircleWorks personnel can access customer data for approved support, compliance, or security purposes.",
  },
  {
    question: "What happens if there's a breach?",
    answer: "We activate our incident response plan, contain the issue, investigate scope, notify affected customers according to contractual and legal requirements, and provide remediation updates until closure.",
  },
  {
    question: "Can I require MFA for my company?",
    answer: "Yes. Admins can require MFA for users, and Enterprise customers can pair MFA with SSO, RBAC policies, and IP allowlisting.",
  },
  {
    question: "Do you encrypt payroll and employee data?",
    answer: "Yes. Customer data is encrypted with AES-256 at rest and TLS 1.3 in transit, with field-level encryption for sensitive PII.",
  },
  {
    question: "Where is customer data stored?",
    answer: "All customer data is stored in AWS us-east-1 in Virginia and remains in the United States. Disaster recovery failover is prepared in AWS us-west-2.",
  },
  {
    question: "Can we review audit logs?",
    answer: "Yes. CircleWorks records security-relevant activity, admin actions, access changes, and key payroll events so teams can support internal audits and investigations.",
  },
  {
    question: "How long do you retain payroll records?",
    answer: "CircleWorks supports a 7-year retention policy for payroll and HR records, with export and deletion workflows available when legally permitted.",
  },
  {
    question: "Do you sell or target ads with customer data?",
    answer: "No. CircleWorks does not use payroll, benefits, or employee records for ad targeting, and we do not sell customer data.",
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

export default function SecurityPage() {
  const [faqState, dispatchFAQ] = useReducer(faqReducer, { openIndex: 0 });

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-200 selection:text-slate-950">
      <Navbar />

      <section className="border-b border-blue-100 bg-white pt-32 pb-20 lg:pt-40 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
              <ShieldCheck size={14} />
              Trust & Security
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-[#0A1628] sm:text-5xl lg:text-6xl">
              Enterprise-grade security for your people data.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              We protect your most sensitive data with the same standards used by banks and healthcare.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {certifications.map((certification) => (
              <div
                key={certification.name}
                className="flex min-h-[172px] flex-col items-center justify-between rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <certification.icon size={24} />
                </div>
                <div>
                  <h2 className="mt-4 text-sm font-black text-[#0A1628]">{certification.name}</h2>
                  <a href="mailto:security@circleworks.com" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800">
                    {certification.action}
                    {certification.action === "Download" ? <Download size={13} /> : <ExternalLink size={13} />}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-blue-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Security pillars</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628]">Controls built for payroll, HR, and benefits data</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
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

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="rounded-lg border border-slate-200 p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <AlertTriangle size={22} />
            </div>
            <h2 className="text-lg font-black text-[#0A1628]">Penetration Testing</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Annual third-party pentest by Cobalt Labs. Last tested: Q4 2024.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Mail size={22} />
            </div>
            <h2 className="text-lg font-black text-[#0A1628]">Vulnerability Disclosure</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Report issues through our HackerOne program or contact{" "}
              <a href="mailto:security@circleworks.com" className="font-bold text-blue-700 hover:text-blue-800">
                security@circleworks.com
              </a>
              .
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Cloud size={22} />
            </div>
            <h2 className="text-lg font-black text-[#0A1628]">Data Residency</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              All customer data stored in AWS us-east-1 (Virginia) — never leaves the USA.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Trust FAQ</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628]">Security questions teams ask before rollout</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                For questionnaires, vendor reviews, or security architecture requests, contact our team directly.
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
                      <span className="text-sm font-bold text-[#0A1628]">{faq.question}</span>
                      <ChevronDown size={17} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="rounded-lg border border-slate-200 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#0A1628]">
              <Archive size={18} className="text-blue-700" />
              Record retention
            </div>
            <p className="text-sm leading-6 text-slate-600">Payroll and HR records support 7-year retention and export workflows.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#0A1628]">
              <RotateCcw size={18} className="text-blue-700" />
              Disaster recovery
            </div>
            <p className="text-sm leading-6 text-slate-600">Backups, failover, and recovery procedures are reviewed on a recurring basis.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#0A1628]">
              <Mail size={18} className="text-blue-700" />
              Security contact
            </div>
            <a href="mailto:security@circleworks.com" className="text-sm font-bold text-blue-700 hover:text-blue-800">
              security@circleworks.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
