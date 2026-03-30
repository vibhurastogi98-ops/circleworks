"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, MapPin, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CASE_STUDIES, Industry } from "./customersData";

const ALL_FILTERS = ["All", "Startup", "SMB", "Mid-Market", "Healthcare", "Tech", "Non-Profit"] as const;
type Filter = (typeof ALL_FILTERS)[number];

const STATS = [
  { value: "5,000+", label: "US companies" },
  { value: "$2B+", label: "payroll processed" },
  { value: "50 states", label: "covered" },
  { value: "4.9/5", label: "average rating" },
];

const featured = CASE_STUDIES.find(s => s.featured)!;

export default function CustomersPage() {
  const [active, setActive] = useState<Filter>("All");

  const filtered = active === "All"
    ? CASE_STUDIES.filter(s => !s.featured)
    : CASE_STUDIES.filter(s => !s.featured && s.industry === active);

  return (
    <main className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 text-center px-4 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <span className="inline-block text-blue-600 text-sm font-bold uppercase tracking-widest mb-5 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100">
            Customer Stories
          </span>
          <h1 className="text-5xl md:text-[60px] font-black text-[#0A1628] leading-tight mb-5 tracking-tight">
            Companies that run on CircleWorks
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12">
            From 5-person startups to 500-person enterprises — see how US teams use CircleWorks to simplify payroll, HR, and compliance.
          </p>
        </motion.div>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Filter by industry">
          {ALL_FILTERS.map((f) => (
            <button
              key={f}
              id={`filter-${f.toLowerCase().replace(/\s/g, "-")}`}
              onClick={() => setActive(f)}
              className={`px-5 py-2 rounded-full text-sm font-bold border transition-all duration-200
                ${active === f
                  ? "bg-[#0A1628] text-white border-[#0A1628] shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* ── STATS BANNER ─────────────────────────────────────────────── */}
      <section className="bg-[#0A1628] py-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl md:text-3xl font-black text-white">{value}</div>
                <div className="text-slate-400 text-sm font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* ── FEATURED CASE STUDY ──────────────────────────────────────── */}
        <AnimatePresence>
          {(active === "All" || active === (featured.industry as Filter)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-16"
            >
              <p className="text-xs uppercase tracking-widest font-black text-slate-400 mb-6">Featured Story</p>
              <Link href={`/customers/${featured.slug}`} className="group block rounded-3xl overflow-hidden border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left: Cover Image */}
                  <div className={`relative bg-gradient-to-br ${featured.coverGradient} p-16 flex flex-col justify-between min-h-[380px]`}>
                    <div className={`w-14 h-14 rounded-2xl ${featured.accentColor} border-4 border-white/20 flex items-center justify-center text-white font-black text-xl shadow-md`}>
                      {featured.logoInitials}
                    </div>
                    <div>
                      <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {featured.industry}
                      </span>
                      <p className="text-white/90 text-sm font-medium mt-3 flex items-center gap-1.5">
                        <MapPin size={14} /> {featured.location} · {featured.employees}
                      </p>
                    </div>
                  </div>

                  {/* Right: Story */}
                  <div className="p-10 lg:p-14 flex flex-col justify-between bg-white">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-5 leading-tight group-hover:text-blue-600 transition-colors">
                        {featured.company}
                      </h2>
                      <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        {featured.featuredExcerpt}
                      </p>
                      {/* 3 metrics */}
                      <div className="grid grid-cols-3 gap-6 mb-8">
                        {featured.metrics.map(({ value, label }) => (
                          <div key={label} className="text-center border-r border-slate-100 last:border-0">
                            <div className="text-2xl md:text-3xl font-black text-blue-600">{value}</div>
                            <div className="text-xs text-slate-500 font-semibold mt-1">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 text-blue-600 font-bold text-[15px] group-hover:gap-3 transition-all">
                      Read Full Story <ArrowRight size={18} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CARD GRID ────────────────────────────────────────────────── */}
        <div>
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-400 text-center py-24 text-lg font-semibold"
              >
                No stories in this category yet — check back soon!
              </motion.p>
            ) : (
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                layout
              >
                {filtered.map((study, i) => (
                  <motion.div
                    key={study.slug}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                  >
                    <Link
                      href={`/customers/${study.slug}`}
                      id={`case-study-${study.slug}`}
                      className="group flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Cover */}
                      <div className={`relative bg-gradient-to-br ${study.coverGradient} h-44 p-6 flex items-end justify-between`}>
                        <div className={`w-10 h-10 rounded-xl ${study.accentColor} border-4 border-white/20 flex items-center justify-center text-white font-black text-sm shadow`}>
                          {study.logoInitials}
                        </div>
                        <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                          {study.industry}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-2">
                          <MapPin size={12} /> {study.location}
                          <span className="mx-1">·</span>
                          <Users size={12} /> {study.employees}
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {study.company}
                        </h3>
                        <p className="text-slate-600 text-sm italic mb-4 flex-1 leading-relaxed line-clamp-2">
                          &ldquo;{study.headlineQuote}&rdquo;
                        </p>

                        {/* Metric highlight */}
                        <div className={`bg-gradient-to-r ${study.coverGradient} text-white text-sm font-black px-4 py-2.5 rounded-xl mb-5`}>
                          {study.metricHighlight}
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-sm group-hover:gap-2.5 transition-all">
                          Read Story <ArrowRight size={15} />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── BOTTOM CTA ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 bg-[#0A1628] rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_120%,rgba(59,130,246,0.25),transparent)]" />
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              {[1,2,3,4,5].map(s => <Star key={s} size={22} className="fill-amber-400 text-amber-400" />)}
            </div>
            <h2 className="text-4xl font-black text-white mb-4">Ready to be our next success story?</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Join 5,000+ US companies that run payroll, HR, and compliance on CircleWorks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[16px] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-shadow">
                Start Free — No Card Required
              </Link>
              <Link href="/contact" className="px-8 py-4 rounded-full border border-white/20 text-white font-bold text-[16px] hover:bg-white/10 transition-colors">
                Talk to Sales
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
