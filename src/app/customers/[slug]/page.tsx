import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Quote,
  Users,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { CustomerLogo } from "../CustomerLogo";
import {
  CUSTOMER_STORIES,
  getCustomerStory,
  getRelatedStudies,
} from "../customersData";

const SITE_URL = "https://circleworks.com";

export function generateStaticParams() {
  return CUSTOMER_STORIES.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = getCustomerStory(slug);

  if (!story) {
    return {
      title: "Customer Story Not Found | CircleWorks",
    };
  }

  return {
    title: `${story.company} Customer Story | CircleWorks`,
    description: story.quoteExcerpt,
    alternates: {
      canonical: `${SITE_URL}/customers/${story.slug}`,
    },
    openGraph: {
      title: `${story.company} Customer Story | CircleWorks`,
      description: story.quoteExcerpt,
      url: `${SITE_URL}/customers/${story.slug}`,
      type: "article",
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = getCustomerStory(slug);

  if (!story) notFound();

  const related = getRelatedStudies(story.slug);
  const reviewJsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "SoftwareApplication",
      name: "CircleWorks",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
    },
    author: {
      "@type": "Person",
      name: story.attribution.name,
      jobTitle: story.attribution.title,
      worksFor: {
        "@type": "Organization",
        name: story.company,
      },
    },
    reviewBody: story.fullQuote,
    publisher: {
      "@type": "Organization",
      name: "CircleWorks",
    },
  };

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-200 selection:text-[#0A1628]">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
      />

      <section className="bg-[#0A1628] pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <Link
            href="/customers"
            className="mb-8 inline-flex items-center gap-2 text-sm font-black text-blue-100 transition hover:text-white focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All customer stories
          </Link>

          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.2fr] lg:items-center">
            <div className="rounded-2xl border border-white/15 bg-white p-7 shadow-xl shadow-black/20">
              <CustomerLogo story={story} variant="detail" />
              <div className="mt-8 grid gap-4 text-sm font-bold text-slate-700">
                <div className="flex items-center gap-3">
                  <BriefcaseBusiness className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  {story.industry}
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  {story.size}
                </div>
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  Customer since {story.customerSince}
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  {story.location}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-blue-100">
                {story.segment} · {story.industry}
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
                How {story.company} runs on CircleWorks
              </h1>
              <p className="mt-6 text-xl font-semibold leading-9 text-slate-200">
                &ldquo;{story.quoteExcerpt}&rdquo;
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {story.keyMetrics.map((metric) => (
                  <div
                    key={metric}
                    className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm font-black text-white"
                  >
                    {metric}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
              Before CircleWorks
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628]">
              The challenge
            </h2>
          </div>
          <div className="grid gap-4">
            {story.challengePainPoints.map((point) => (
              <div
                key={point}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
                <p className="text-base font-semibold leading-7 text-slate-700">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
              The Solution
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628]">
              CircleWorks modules used
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {story.solutionModules.map((module) => (
              <div
                key={module.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-black text-[#0A1628]">{module.name}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
              Results
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628]">
              Measurable impact after launch
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {story.results.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-md"
              >
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-5xl font-black tracking-tight text-transparent">
                  {metric.value}
                </div>
                <h3 className="mt-4 text-lg font-black text-[#0A1628]">{metric.label}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  {metric.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1628] py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <blockquote className="relative rounded-2xl border border-white/15 bg-white/10 p-8 md:p-10">
            <Quote
              className="absolute left-6 top-5 h-16 w-16 text-white/10"
              aria-hidden="true"
            />
            <p className="relative text-2xl font-bold leading-10 md:text-3xl md:leading-[1.45]">
              &ldquo;{story.fullQuote}&rdquo;
            </p>
            <footer className="relative mt-8 flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-base font-black text-white shadow-md"
                style={{ backgroundColor: story.logoColor }}
                aria-hidden="true"
              >
                {story.attribution.initials}
              </div>
              <div>
                <div className="font-black text-white">{story.attribution.name}</div>
                <div className="mt-1 text-sm font-semibold text-slate-300">
                  {story.attribution.title}, {story.attribution.company}
                </div>
              </div>
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center md:p-12">
            <h2 className="text-3xl font-black tracking-tight text-[#0A1628]">
              Try CircleWorks free
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
              Launch payroll, HR, benefits, and compliance with guided setup and no credit
              card required.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-black text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Talk to Sales
              </Link>
            </div>
          </div>

          <div className="mt-16">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
                  Related Case Studies
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628]">
                  More customer stories
                </h2>
              </div>
              <Link
                href="/customers"
                className="hidden items-center gap-2 text-sm font-black text-blue-600 transition hover:gap-3 md:inline-flex"
              >
                View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {related.map((relatedStory) => (
                <Link
                  key={relatedStory.slug}
                  href={`/customers/${relatedStory.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                >
                  <CustomerLogo story={relatedStory} variant="card" interactive className="mb-6" />
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    {relatedStory.segment} · {relatedStory.industry}
                  </div>
                  <h3 className="mt-3 text-xl font-black text-[#0A1628] transition group-hover:text-blue-600">
                    {relatedStory.company}
                  </h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                    &ldquo;{relatedStory.quoteExcerpt}&rdquo;
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 transition group-hover:gap-3">
                    Read full story <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
