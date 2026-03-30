import { Suspense } from "react";
import type { Metadata } from "next";
import Script from "next/script";

/* ─── Component imports ─── */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/Hero";
import StatsSection from "@/components/StatsRow";
import FeaturesSection from "@/components/FeaturesBento";
import DemoSection from "@/components/DemoSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingTeaser from "@/components/PricingTeaser";
import IntegrationsSection from "@/components/IntegrationsSection";
import FAQSection from "@/components/FAQSection";
import CtaSection from "@/components/CtaSection";
import SiteFooter from "@/components/Footer";
import CirceWidget from "@/components/CirceWidget";

/* ─── Metadata (Next.js App Router) ─── */

export const metadata: Metadata = {
  title: "CircleWorks | USA Payroll & HR Platform",
  description:
    "CircleWorks is the all-in-one Payroll, HRIS, ATS, Benefits, Time & Expense platform built for every US company. Run payroll in under 5 minutes. Trusted by 5,000+ businesses nationwide.",
  keywords: [
    "US payroll software",
    "HR platform USA",
    "payroll SaaS",
    "HRIS",
    "ATS",
    "employee benefits",
    "time tracking",
    "expense management",
    "CircleWorks",
  ],
  openGraph: {
    title: "CircleWorks | USA Payroll & HR Platform",
    description:
      "All-in-one: Payroll · HRIS · ATS · Benefits · Time · Expenses. Built for every US company. Run payroll in under 5 minutes.",
    type: "website",
    siteName: "CircleWorks",
    url: "https://circleworks.com",
    images: [
      {
        url: "https://circleworks.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "CircleWorks — USA Payroll & HR Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CircleWorks | USA Payroll & HR Platform",
    description:
      "All-in-one Payroll, HRIS, ATS, Benefits, Time & Expense platform for US companies.",
    images: ["https://circleworks.com/og-image.png"],
  },
  alternates: {
    canonical: "https://circleworks.com",
  },
};

/* ─── Structured Data (Organization + SoftwareApplication) ─── */

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CircleWorks",
  url: "https://circleworks.com",
  logo: "https://circleworks.com/logo.png",
  sameAs: [
    "https://twitter.com/circleworks",
    "https://linkedin.com/company/circleworks",
    "https://github.com/circleworks",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1-800-CIR-WORK",
    contactType: "customer service",
    areaServed: "US",
    availableLanguage: "en",
  },
  description:
    "CircleWorks is the all-in-one Payroll, HRIS, ATS, Benefits, Time & Expense platform built for every US company.",
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CircleWorks",
  operatingSystem: "Web",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "6.00",
    priceCurrency: "USD",
    priceValidUntil: "2026-12-31",
    description: "Per employee per month, starting at Starter plan",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "912",
    bestRating: "5",
    worstRating: "1",
  },
  description:
    "All-in-one Payroll, HRIS, ATS, Benefits, Time & Expense platform for US companies.",
  url: "https://circleworks.com",
};

/* ─── Skeleton Fallbacks ─── */

function SectionSkeleton({ height = "h-96" }: { height?: string }) {
  return (
    <div className={`w-full ${height} animate-pulse bg-slate-800/30`}>
      <div className="max-w-[1200px] mx-auto px-6 py-16 flex flex-col items-center gap-4">
        <div className="w-64 h-8 bg-slate-700/40 rounded-lg" />
        <div className="w-96 h-4 bg-slate-700/30 rounded" />
        <div className="w-80 h-4 bg-slate-700/20 rounded" />
      </div>
    </div>
  );
}

function LightSectionSkeleton({ height = "h-96" }: { height?: string }) {
  return (
    <div className={`w-full ${height} animate-pulse bg-gray-100`}>
      <div className="max-w-[1200px] mx-auto px-6 py-16 flex flex-col items-center gap-4">
        <div className="w-64 h-8 bg-gray-200 rounded-lg" />
        <div className="w-96 h-4 bg-gray-200/80 rounded" />
        <div className="w-80 h-4 bg-gray-200/60 rounded" />
      </div>
    </div>
  );
}

/* ─── Page Component ─── */

export default function HomePage() {
  return (
    <>
      {/* Structured Data */}
      <Script
        id="org-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-[#0A1628]">
        {/* ── Sticky Navbar ── */}
        <Navbar />

        {/* ── Hero ── */}
        <Suspense fallback={<SectionSkeleton height="h-[100vh]" />}>
          <HeroSection />
        </Suspense>

        {/* ── Stats ── */}
        <Suspense fallback={<SectionSkeleton height="h-32" />}>
          <StatsSection />
        </Suspense>

        {/* ── Features Bento ── */}
        <Suspense fallback={<SectionSkeleton height="h-[600px]" />}>
          <FeaturesSection />
        </Suspense>

        {/* ── Demo ── */}
        <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
          <DemoSection />
        </Suspense>

        {/* ── Testimonials ── */}
        <Suspense fallback={<LightSectionSkeleton height="h-[600px]" />}>
          <TestimonialsSection />
        </Suspense>

        {/* ── Pricing Teaser ── */}
        <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
          <PricingTeaser />
        </Suspense>

        {/* ── Integrations ── */}
        <Suspense fallback={<LightSectionSkeleton height="h-64" />}>
          <IntegrationsSection />
        </Suspense>

        {/* ── FAQ ── */}
        <Suspense fallback={<LightSectionSkeleton height="h-[500px]" />}>
          <FAQSection />
        </Suspense>

        {/* ── Final CTA ── */}
        <Suspense fallback={<SectionSkeleton height="h-96" />}>
          <CtaSection />
        </Suspense>

        {/* ── Footer ── */}
        <Suspense fallback={<SectionSkeleton height="h-64" />}>
          <SiteFooter />
        </Suspense>
      </main>

      {/* ── Circe AI Widget (fixed, over all content) ── */}
      <CirceWidget />
    </>
  );
}
