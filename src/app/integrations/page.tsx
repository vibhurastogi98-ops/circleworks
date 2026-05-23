"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CreditCard,
  FileCheck,
  FileText,
  Globe,
  Heart,
  Landmark,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { categories, generateSlug, integrations } from "@/data/integrations";
import type { Integration } from "@/data/integrations";

const integrationIcons: Record<string, LucideIcon> = {
  QuickBooks: Landmark,
  Slack: MessageSquare,
  Okta: ShieldCheck,
  Xero: Landmark,
  "Google Workspace": Globe,
  "Microsoft Teams": MessageSquare,
  "Guideline 401(k)": Heart,
  "Human Interest": Heart,
  Brex: CreditCard,
  Ramp: CreditCard,
  Greenhouse: Activity,
  Lever: Activity,
  Checkr: FileCheck,
  Gusto: Zap,
  SimplyInsured: ShieldCheck,
  DocuSign: FileText,
};

function IntegrationLogo({ integration, className = "h-16 w-16" }: { integration: Integration; className?: string }) {
  const Icon = integrationIcons[integration.name] ?? Zap;

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-2xl border border-white/20 text-white shadow-sm grayscale transition duration-300 group-hover:scale-105 group-hover:grayscale-0`}
      style={{ backgroundColor: integration.color }}
      aria-hidden="true"
    >
      <Icon className="h-7 w-7" strokeWidth={2.4} />
    </div>
  );
}

export default function IntegrationsPage() {
  const [activeFilter, setActiveFilter] = useState<(typeof categories)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory = activeFilter === "All" || integration.cat === activeFilter;
    const matchesSearch = integration.name.toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  const featuredIntegrations = integrations.filter((integration) => integration.featured);

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-[#061122]">
      <Navbar />

      <section className="relative overflow-hidden bg-[#061122] pt-32 pb-20 text-white lg:pt-44 lg:pb-28">
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            50+ native and API-ready integrations
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-[72px]">
            Connect CircleWorks to your entire stack
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-slate-300 lg:text-xl">
            50+ integrations. No manual data entry. Zero re-keying.
          </p>
          <Link
            href="#integrations-grid"
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-black text-[#061122] shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-cyan-50"
          >
            Browse integrations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 text-center">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Featured Integrations</p>
            <h2 className="text-3xl font-black tracking-tight text-[#061122] md:text-4xl">Start with the tools teams use daily</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredIntegrations.map((integration) => (
              <Link
                href={`/integrations/${generateSlug(integration.name)}`}
                key={integration.id}
                className="group block rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/10"
              >
                <div className="mb-8 flex items-center justify-between gap-4">
                  <IntegrationLogo integration={integration} />
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-700">
                    {integration.cat}
                  </span>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-[#061122]">{integration.name}</h3>
                <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">{integration.featuredDesc ?? integration.desc}</p>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-black text-blue-600">
                  View setup
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="integrations-grid" className="scroll-mt-24 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">Integration Library</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#061122] md:text-4xl">Find your connected workflow</h2>
            </div>

            <label className="relative w-full max-w-md">
              <span className="sr-only">Search integrations by name</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search integration name..."
                className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </label>
          </div>

          <div className="mb-8 flex gap-2 overflow-x-auto pb-3">
            {categories.map((category) => {
              const isActive = category === activeFilter;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveFilter(category)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-black transition ${
                    isActive
                      ? "bg-[#061122] text-white shadow-lg shadow-slate-900/15"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                  }`}
                  aria-pressed={isActive}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="mb-6 text-sm font-bold text-slate-400">
            Showing {filteredIntegrations.length} {filteredIntegrations.length === 1 ? "integration" : "integrations"}
          </div>

          <motion.div layout className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredIntegrations.map((integration) => {
                const isConnected = integration.status === "Connected";
                return (
                  <motion.div
                    key={integration.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Link
                      href={`/integrations/${generateSlug(integration.name)}`}
                      className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/10"
                    >
                      <IntegrationLogo integration={integration} />
                      <div className="mt-5 flex-1">
                        <h3 className="text-lg font-black leading-tight tracking-tight text-[#061122] transition group-hover:text-blue-600">
                          {integration.name}
                        </h3>
                        <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
                          {integration.cat}
                        </span>
                        <p className="mt-4 line-clamp-1 text-sm font-medium leading-relaxed text-slate-500">{integration.desc}</p>
                      </div>
                      <span
                        className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-black transition ${
                          isConnected
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-blue-600 text-white group-hover:bg-blue-700"
                        }`}
                      >
                        {integration.status}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filteredIntegrations.length === 0 && (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <h3 className="text-xl font-black text-[#061122]">No integrations found</h3>
              <p className="mt-2 text-sm font-medium text-slate-500">Try another category or search term.</p>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#f8fafc] py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Developer Platform</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#061122] md:text-5xl">Build your own integration</h2>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-slate-600">
              Use CircleWorks APIs and webhooks to sync payroll, employee, document, and compliance data with the custom tools your team already depends on.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/docs" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                API docs
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="https://github.com/vibhurastogi98-ops/circleworks"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-[#061122]"
              >
                GitHub
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-[#061122] p-6 font-mono text-sm text-slate-300 shadow-2xl shadow-slate-900/20">
            <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs font-black uppercase tracking-widest text-slate-500">custom-sync.ts</span>
            </div>
            <div className="space-y-2 leading-relaxed">
              <div><span className="text-cyan-300">POST</span> <span className="text-white">/v1/webhooks/integrations</span></div>
              <div><span className="text-blue-300">Authorization:</span> Bearer {'{api_key}'}</div>
              <div className="pt-3 text-emerald-300">200 OK</div>
              <div className="text-slate-500">employee.synced, payroll.approved, document.signed</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
