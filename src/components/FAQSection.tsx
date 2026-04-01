"use client";

import React, { useReducer, useRef, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import Script from "next/script";

/* ─── FAQ Data ─── */

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Can I pay W-2 employees AND 1099 creators from one platform?",
    answer: "Yes — this is CircleWorks' core strength. Creators, agencies, and companies can run payroll for full-time staff and contractor talent in the same pay cycle, with automatic 1099-NEC filing at year end."
  },
  {
    question: "We work with creators and staff across multiple states. Can you handle that?",
    answer: "Absolutely. All 50 states supported. Perfect for agencies and companies with remote creators and distributed teams — we auto-handle all state registrations, local tax rates, and compliance."
  },
  {
    question: "How fast can creators, agencies, or companies get started?",
    answer: "Most clients — whether solo creators, growing agencies, or large companies — are fully onboarded and running first payroll within 24 hours."
  },
  {
    question: "Can we give our accountant or client access?",
    answer: "Yes. Creators, agencies, and companies can invite a bookkeeper or client finance contact with a free read-only or admin role at no extra cost."
  },
  {
    question: "Do you handle international payments for offshore creators?",
    answer: "Yes. CircleWorks enables agencies and companies to pay international contractors and creators in over 120 countries, with local currency options and compliant global contracts built-in."
  },
  {
    question: "Can small agencies offer high-end health benefits through CircleWorks?",
    answer: "Absolutely. We provide access to enterprise-grade health, dental, and vision plans (including top-tier carriers like Blue Cross and Aetna) that small agencies and companies can offer to their teams starting at just 2 employees."
  },
  {
    question: "Are there any hidden setup fees or long-term contracts?",
    answer: "No. CircleWorks operates on a transparent, month-to-month subscription for creators, agencies, and companies. No setup fees, no cancellation fees, and no hidden 'per-state' surcharges."
  },
  {
    question: "How secure is the data for my creators and company?",
    answer: "CircleWorks is SOC 2 Type II compliant and uses 256-bit SSL encryption. We protect sensitive creator and company data with the same grade of security used by major US financial institutions."
  },
  {
    question: "Does CircleWorks handle workers' compensation insurance?",
    answer: "Yes. We offer integrated pay-as-you-go workers' comp insurance through our partners. It automatically syncs with your payroll data, so you only pay for what you use, with no large upfront deposits."
  },
  {
    question: "What about year-end filings like W-2s and 1099s?",
    answer: "We handle all of it. CircleWorks automatically generates, files, and sends digital and paper W-2s and 1099s to your team and the IRS/SSA at year-end. No extra per-employee fees."
  },
  {
    question: "Can we migrate our existing payroll data to CircleWorks?",
    answer: "Yes. Our concierge onboarding team handles the migration for you. We'll import your historical year-to-date data so your tax filings remain accurate and your team's pay history is preserved."
  },
  {
    question: "Is there a mobile app for employees and creators?",
    answer: "Yes. Employees and creators can use the CircleWorks mobile app for iOS and Android to view pay stubs, request PTO, clock in/out, and manage their benefits on the go."
  },
  {
    question: "Can we automate employee onboarding workflows?",
    answer: "Absolutely. CircleWorks allows you to build custom onboarding checklists that automatically trigger when a candidate is hired in the ATS. Assign tasks to IT, HR, and managers instantly to ensure a perfect Day 1."
  },
  {
    question: "Does the platform help with diversity and EEO-1 reporting?",
    answer: "Yes. Our analytics suite includes automated EEO-1 diversity reporting and pay parity audits, helping your agency or company maintain a fair and compliant workplace with zero manual data crunching."
  },
  {
    question: "What kind of support is included with my subscription?",
    answer: "Every CircleWorks client gets a dedicated account manager and access to our US-based compliance experts. No chat bots or ticket loops — just direct, expert support when you need it."
  },
  {
    question: "Is there a free trial for the platform?",
    answer: "Yes. We offer a full 30-day free trial of the entire CircleWorks platform for creators, agencies, and companies. No credit card is required to set up your account and explore all our features."
  }
];

/* ─── Schema.org FAQ JSON-LD ─── */

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

/* ─── Accordion State (useReducer) ─── */

type AccordionState = { openIndex: number | null };
type AccordionAction = { type: "TOGGLE"; index: number };

function accordionReducer(
  state: AccordionState,
  action: AccordionAction
): AccordionState {
  switch (action.type) {
    case "TOGGLE":
      return {
        openIndex: state.openIndex === action.index ? null : action.index,
      };
    default:
      return state;
  }
}

/* ─── Single Accordion Item ─── */

function AccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: { question: string; answer: string };
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(0);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        id={`faq-toggle-${index}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${index}`}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group cursor-pointer"
      >
        <span className="text-[15px] sm:text-[16px] font-semibold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors duration-200">
          {item.question}
        </span>

        {/* Plus / Minus icon with rotation */}
        <span
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? "border-blue-600 bg-blue-600 text-white rotate-45"
              : "border-gray-300 text-gray-400 group-hover:border-blue-500 group-hover:text-blue-500 rotate-0"
          }`}
        >
          <Plus size={14} strokeWidth={2.5} />
        </span>
      </button>

      {/* Expanding answer panel */}
      <div
        id={`faq-panel-${index}`}
        role="region"
        aria-labelledby={`faq-toggle-${index}`}
        className="overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ height }}
      >
        <div ref={contentRef}>
          <p className="text-[14px] sm:text-[15px] text-gray-600 leading-relaxed pb-5 pr-10">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── FAQSection Component ─── */

export default function FAQSection() {
  const [state, dispatch] = useReducer(accordionReducer, { openIndex: null });

  const handleToggle = useCallback(
    (index: number) => {
      dispatch({ type: "TOGGLE", index });
    },
    []
  );

  /* Split into two columns ── UPDATED for 16 items ── */
  const leftColumn = FAQ_ITEMS.slice(0, 8);
  const rightColumn = FAQ_ITEMS.slice(8, 16);

  return (
    <>
      {/* Schema.org FAQPage structured data */}
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        strategy="afterInteractive"
      />

      <section id="faq" className="bg-white py-20 w-full">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <h2 className="text-[32px] md:text-[40px] font-black text-gray-900 tracking-tight">
              {/* SEO Update ── Creators & Agencies FAQ ── */}
              Questions from Creators, Agencies & Companies
            </h2>
            <p className="mt-4 text-[16px] text-gray-500 max-w-xl mx-auto leading-relaxed">
              {/* SEO Update ── Creators & Agencies FAQ ── */}
              Everything you need to know about how CircleWorks handles agency-specific Payroll & HR.
            </p>
          </div>

          {/* 2-column accordion grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-0">
            {/* LEFT COLUMN */}
            <div className="border-t border-gray-200">
              {leftColumn.map((item, i) => (
                <AccordionItem
                  key={i}
                  item={item}
                  index={i}
                  isOpen={state.openIndex === i}
                  onToggle={() => handleToggle(i)}
                />
              ))}
            </div>

            {/* RIGHT COLUMN */}
            <div className="border-t border-gray-200">
              {rightColumn.map((item, i) => {
                const globalIndex = i + 8;
                return (
                  <AccordionItem
                    key={globalIndex}
                    item={item}
                    index={globalIndex}
                    isOpen={state.openIndex === globalIndex}
                    onToggle={() => handleToggle(globalIndex)}
                  />
                );
              })}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="text-[15px] text-gray-500 mb-4">
              Still have questions?
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white text-[14px] font-semibold hover:bg-gray-800 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
            >
              Talk to our team
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
