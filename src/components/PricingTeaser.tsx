"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";

type BillingCycle = "monthly" | "annual";

type Plan = {
  name: string;
  pricePrefix?: string;
  monthlyBase?: number;
  annualBase?: number;
  monthlyEmployee?: number;
  annualEmployee?: number;
  priceText?: string;
  features: string[];
  cta: string;
  href: string;
  variant: "starter" | "pro" | "enterprise";
};

const FILING_INCLUDED_MESSAGE =
  "Tax filing included on every plan — federal, state & local, filed automatically. No hidden fees.";
const FILING_COMPARISON_MESSAGE =
  "Many payroll providers charge extra filing fees at quarter-end, year-end, or by jurisdiction. CircleWorks includes filing in every plan.";

const plans: Plan[] = [
  {
    name: "Starter",
    annualEmployee: 6,
    monthlyEmployee: 8,
    pricePrefix: "Free base +",
    features: [
      "Full-service payroll",
      "Employee self-service",
      "Basic onboarding",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    variant: "starter",
  },
  {
    name: "Pro",
    annualBase: 63,
    monthlyBase: 79,
    annualEmployee: 11,
    monthlyEmployee: 14,
    features: [
      "Time, PTO, and payroll",
      "Multi-state tax support",
      "Advanced reports",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    variant: "pro",
  },
  {
    name: "Enterprise",
    priceText: "Custom pricing",
    features: [
      "Dedicated support",
      "Custom integrations",
      "Enterprise controls",
    ],
    cta: "Talk to Sales",
    href: "/contact",
    variant: "enterprise",
  },
];

function AnimatedNumber({ value }: { value: number }) {
  return (
    <span className="relative inline-block min-w-[1.15em]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          layout
          initial={{ opacity: 0, y: -14, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function PricingCard({ plan, billingCycle }: { plan: Plan; billingCycle: BillingCycle }) {
  const isAnnual = billingCycle === "annual";
  const isPro = plan.variant === "pro";
  const isEnterprise = plan.variant === "enterprise";
  const basePrice = isAnnual ? plan.annualBase : plan.monthlyBase;
  const employeePrice = isAnnual ? plan.annualEmployee : plan.monthlyEmployee;

  const content = (
    <>
      <h3 className={`text-xl font-bold ${isEnterprise ? "text-white" : "text-gray-900"}`}>
        {plan.name}
      </h3>

      <div className="mt-5 min-h-[96px]">
        {plan.priceText ? (
          <p className="text-4xl font-black leading-tight tracking-tight text-white">
            {plan.priceText}
          </p>
        ) : plan.variant === "starter" ? (
          <>
            <p className="text-sm font-bold text-gray-500">{plan.pricePrefix}</p>
            <p className="mt-1 text-4xl font-black leading-none tracking-tight text-gray-900">
              $<AnimatedNumber value={employeePrice ?? 0} />
              <span className="ml-1 text-base font-semibold text-gray-500">/employee/mo</span>
            </p>
          </>
        ) : (
          <>
            <p className="text-4xl font-black leading-none tracking-tight text-gray-900">
              $<AnimatedNumber value={basePrice ?? 0} />
              <span className="ml-1 text-base font-semibold text-gray-500">/mo</span>
            </p>
            <p className="mt-2 text-sm font-bold text-blue-600">
              + $<AnimatedNumber value={employeePrice ?? 0} />/employee/mo
            </p>
          </>
        )}
      </div>

      <ul className={`mt-6 flex flex-col gap-3 text-[15px] font-semibold ${isEnterprise ? "text-slate-200" : "text-gray-600"}`}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check
              size={18}
              strokeWidth={3}
              className={`mt-0.5 shrink-0 ${isEnterprise ? "text-emerald-300" : "text-blue-600"}`}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.href}
        className={`mt-auto flex min-h-12 items-center justify-center rounded-xl px-4 text-[15px] font-bold transition-colors ${
          plan.variant === "starter"
            ? "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            : plan.variant === "pro"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
              : "bg-white text-[#0A1628] hover:bg-slate-100"
        }`}
      >
        {plan.cta}
      </Link>
    </>
  );

  if (isPro) {
    return (
      <motion.article
        layout
        className="relative scale-[1.03] rounded-2xl bg-gradient-to-br from-blue-500 via-sky-400 to-indigo-600 p-[2px] shadow-[0_24px_60px_-20px_rgba(37,99,235,0.55)]"
        transition={{ layout: { duration: 0.28, ease: "easeOut" } }}
      >
        <span className="absolute right-5 top-5 z-20 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
          Most Popular
        </span>
        <div className="flex min-h-[430px] flex-col rounded-[14px] bg-white p-7 text-gray-900">
          {content}
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      layout
      className={`relative flex min-h-[430px] flex-col rounded-2xl p-7 transition-transform ${
        isEnterprise
          ? "border border-[#0A1628] bg-[#0A1628] text-white shadow-xl"
          : "border border-gray-200 bg-white text-gray-900 shadow-sm"
      }`}
      transition={{ layout: { duration: 0.28, ease: "easeOut" } }}
    >
      {content}
    </motion.article>
  );
}

export function PricingTeaser() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <section className="w-full bg-white py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="font-black leading-tight tracking-tight text-gray-900"
            style={{ fontSize: 40 }}
          >
            Transparent pricing — no surprises
          </h2>
          <p className="mt-4 text-[18px] font-medium text-gray-500">
            No setup fees. No hidden costs. Cancel anytime.
          </p>

          <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-left shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-5 w-5 text-emerald-600" strokeWidth={3} />
              </span>
              <div>
                <p className="text-base font-bold leading-6 text-emerald-950">
                  {FILING_INCLUDED_MESSAGE}
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  Automated filings are part of the subscription, not a surprise line item.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-900">
            {FILING_COMPARISON_MESSAGE}
          </div>

          <div className="mt-8 inline-flex rounded-full border border-gray-200 bg-gray-100 p-1">
            {(["monthly", "annual"] as const).map((cycle) => {
              const active = billingCycle === cycle;
              return (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`relative min-h-10 rounded-full px-5 text-sm font-bold capitalize transition-colors ${
                    active ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="pricing-toggle-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                    />
                  )}
                  <span className="relative">{cycle}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-14 grid max-w-5xl grid-cols-1 items-center gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} billingCycle={billingCycle} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-[16px] font-bold text-blue-600 transition-colors hover:text-blue-700"
          >
            See full pricing &amp; feature comparison →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PricingTeaser;
