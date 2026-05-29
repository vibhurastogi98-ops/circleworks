"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { CustomerLogo } from "./CustomerLogo";
import {
  CUSTOMER_FILTERS,
  CUSTOMER_STORIES,
  FEATURED_CUSTOMER_STORIES,
  type CustomerFilter,
} from "./customersData";

const stats = [
  { value: "5,000+", label: "Companies" },
  { value: "$2B+", label: "Payroll Processed" },
  { value: "50", label: "States Covered" },
  { value: "99.97%", label: "Uptime" },
] as const;

export default function CustomersPageClient() {
  const [activeFilter, setActiveFilter] = useState<CustomerFilter>("All");

  const filteredCustomers = useMemo(() => {
    if (activeFilter === "All") return CUSTOMER_STORIES;
    return CUSTOMER_STORIES.filter((story) => story.filters.includes(activeFilter));
  }, [activeFilter]);

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-200 selection:text-[#0A1628]">
      <Navbar />

      <section className="bg-[#0A1628] pt-32 text-white lg:pt-36">
        <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-blue-100">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Customer Stories
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
              5,000+ US companies run on CircleWorks
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-300">
              From solo founders to Fortune 500 HR teams — see their stories.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-black text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1628]"
              >
                Start Free Trial
              </Link>
              <Link
                href="#case-studies"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-black text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1628]"
              >
                Read Case Studies
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/15 bg-white/10 p-6 text-center shadow-sm shadow-black/10"
              >
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="case-studies" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
                Featured Customer Stories
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628] md:text-4xl">
                Proof from teams running payroll at scale
              </h2>
            </div>
            <p className="max-w-xl text-sm font-medium leading-6 text-slate-500 md:text-right">
              These teams replaced manual payroll, scattered HR data, and compliance guesswork
              with one operating system.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {FEATURED_CUSTOMER_STORIES.map((story) => (
              <Link
                key={story.slug}
                href={`/customers/${story.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-md transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <CustomerLogo
                  story={story}
                  variant="featured"
                  interactive
                  className="mb-7"
                />
                <p className="text-lg font-semibold leading-8 text-slate-800">
                  &ldquo;{story.quoteExcerpt}&rdquo;
                </p>
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="font-black text-[#0A1628]">{story.attribution.name}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-500">
                    {story.attribution.title}, {story.attribution.company}
                  </div>
                </div>
                <div className="mt-7 grid gap-3">
                  {story.keyMetrics.map((metric) => (
                    <div key={metric} className="flex items-center gap-2 text-sm font-black text-slate-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                      {metric}
                    </div>
                  ))}
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-black text-blue-600 transition group-hover:gap-3">
                  Read full story <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
              Customer Logo Grid
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628] md:text-4xl">
              Trusted by teams in every stage of growth
            </h2>
          </div>

          <div
            className="mx-auto mb-10 flex max-w-5xl flex-wrap justify-center gap-3"
            role="group"
            aria-label="Filter customer logos"
          >
            {CUSTOMER_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                aria-pressed={activeFilter === filter}
                className={`h-10 rounded-full border px-4 text-sm font-black transition ${
                  activeFilter === filter
                    ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <motion.div
            layout
            className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6"
            aria-live="polite"
          >
            <AnimatePresence mode="popLayout">
              {filteredCustomers.map((story) => (
                <motion.div
                  key={story.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="group"
                >
                  <Link
                    href={`/customers/${story.slug}`}
                    className="flex h-24 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 px-3 opacity-60 transition duration-300 hover:scale-105 hover:border-blue-200 hover:bg-white hover:opacity-100 hover:shadow-md"
                  >
                    <CustomerLogo story={story} variant="grid" interactive />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#0A1628] py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-200">
            Your Story Starts Here
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
            Payroll, HR, and compliance your team can trust.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-300">
            Launch CircleWorks with guided setup, clean employee data, and support for every
            US state from your first pay run.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-black text-[#0A1628] transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-black text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
