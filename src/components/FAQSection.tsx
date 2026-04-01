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

  /* Split into two columns */
  const leftColumn = FAQ_ITEMS.slice(0, 2);
  const rightColumn = FAQ_ITEMS.slice(2, 4);

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
              Everything you need to know about how CircleWorks handles agency-specific payroll and HR.
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
                const globalIndex = i + 2;
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
