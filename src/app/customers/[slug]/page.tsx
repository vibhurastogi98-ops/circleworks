import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, Users, Quote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CASE_STUDIES, getRelatedStudies } from "../customersData";

export function generateStaticParams() {
  return CASE_STUDIES.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = CASE_STUDIES.find(s => s.slug === slug);
  if (!study) return { title: "Not Found" };
  return {
    title: `${study.company} Customer Story | CircleWorks`,
    description: study.headlineQuote,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = CASE_STUDIES.find(s => s.slug === slug);
  if (!study) notFound();

  const related = getRelatedStudies(slug);

  return (
    <main className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className={`pt-32 pb-24 bg-gradient-to-br ${study.coverGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <Link href="/customers" className="inline-flex items-center gap-2 text-white/80 text-sm font-bold mb-8 hover:text-white transition-colors">
            <ArrowLeft size={16} /> All Customer Stories
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl ${study.accentColor} border-4 border-white/30 flex items-center justify-center text-white font-black text-xl shadow-lg`}>
              {study.logoInitials}
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{study.company}</h1>
              <div className="flex items-center gap-3 text-white/70 text-sm font-medium mt-0.5">
                <span className="flex items-center gap-1"><MapPin size={12} />{study.location}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Users size={12} />{study.employees}</span>
                <span>·</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{study.industry}</span>
              </div>
            </div>
          </div>

          <blockquote className="text-3xl md:text-4xl font-black text-white leading-tight">
            &ldquo;{study.headlineQuote}&rdquo;
          </blockquote>
        </div>
      </section>

      {/* ── METRICS ──────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 -mt-8">
            {study.metrics.map(({ value, label }, i) => (
              <div
                key={label}
                className={`bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center mx-2 md:mx-0 mb-4 md:mb-0
                  ${i === 1 ? "md:scale-105 md:z-10 relative shadow-2xl border-blue-100" : ""}`}
              >
                <div className={`text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r ${study.coverGradient} bg-clip-text text-transparent`}>
                  {value}
                </div>
                <div className="text-slate-600 font-semibold text-[15px]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Challenge */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-black text-sm flex items-center justify-center">1</div>
              <h2 className="text-2xl font-black text-slate-900">The Challenge</h2>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed">{study.challenge}</p>
          </div>

          {/* Solution */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-black text-sm flex items-center justify-center">2</div>
              <h2 className="text-2xl font-black text-slate-900">The Solution</h2>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed">{study.solution}</p>
          </div>

          {/* Results narrative */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-8 h-8 rounded-full text-white font-black text-sm flex items-center justify-center bg-gradient-to-br ${study.coverGradient}`}>3</div>
              <h2 className="text-2xl font-black text-slate-900">The Results</h2>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed">{study.resultsNarrative}</p>
          </div>

          {/* Pull Quote */}
          <div className={`bg-gradient-to-br ${study.coverGradient} rounded-3xl p-10 relative overflow-hidden mb-16`}>
            <Quote size={80} className="absolute -top-4 -left-4 text-white/10" />
            <p className="text-white text-2xl md:text-3xl font-bold leading-snug mb-8 relative z-10">
              &ldquo;{study.pullQuote}&rdquo;
            </p>
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-full ${study.accentColor} border-4 border-white/30 flex items-center justify-center text-white font-black text-lg`}>
                {study.author[0]}
              </div>
              <div>
                <div className="text-white font-black">{study.author}</div>
                <div className="text-white/70 text-sm font-medium">{study.authorRole}</div>
              </div>
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-10 text-center">
            <h3 className="text-2xl font-black text-slate-900 mb-3">Start your own success story</h3>
            <p className="text-slate-500 mb-7">Set up CircleWorks in under 48 hours. No contracts. No setup fees.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className={`px-8 py-3.5 rounded-full bg-gradient-to-r ${study.coverGradient} text-white font-bold text-[15px] hover:shadow-lg transition-shadow`}>
                Start Free
              </Link>
              <Link href="/contact" className="px-8 py-3.5 rounded-full border border-slate-300 text-slate-700 font-bold text-[15px] hover:bg-slate-100 transition-colors">
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED STORIES ──────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 mb-10">More customer stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map(r => (
              <Link
                key={r.slug}
                href={`/customers/${r.slug}`}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`h-36 bg-gradient-to-br ${r.coverGradient} relative p-5 flex items-end`}>
                  <div className={`w-9 h-9 rounded-xl ${r.accentColor} border-4 border-white/20 flex items-center justify-center text-white font-black text-sm`}>
                    {r.logoInitials}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{r.industry}</div>
                  <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{r.company}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 italic">&ldquo;{r.headlineQuote}&rdquo;</p>
                  <div className={`text-xs font-black px-3 py-1.5 rounded-lg text-white bg-gradient-to-r ${r.coverGradient} inline-block mb-4`}>
                    {r.metricHighlight}
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm group-hover:gap-2.5 transition-all">
                    Read Story <ArrowRight size={15} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/customers" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-slate-200 text-slate-700 font-bold hover:border-slate-400 transition-colors">
              View All Stories <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
