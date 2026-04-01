import { Suspense } from "react";
import type { Metadata } from "next";
import Script from "next/script";

/* ─── Component imports ─── */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/Hero";
import StatsSection from "@/components/StatsRow";
import FeaturesSection from "@/components/FeaturesBento";
import HowItWorks from "@/components/HowItWorks";
import WhoWeServe from "@/components/WhoWeServe";
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
  title: "CircleWorks | Managed Payroll & HR — Done For You",
  description:
    "CircleWorks is a fully managed payroll and HR service built for creators, talent agencies, and companies. We handle your payroll, HR, and compliance so you can focus on creating.",
  keywords: [
    "managed payroll for creators",
    "managed HR for agencies",
    "creator economy payroll",
    "agency payroll service",
    "1099 compliance managed",
    "talent agency HR support",
    "CircleWorks",
  ],
  openGraph: {
    title: "CircleWorks | Managed Payroll & HR — Done For You",
    description:
      "We handle your payroll, HR & compliance — so you can focus on creating. Built for creators, talent agencies, and companies.",
    type: "website",
    siteName: "CircleWorks",
    url: "https://circleworks.com",
    images: [
      {
        url: "https://circleworks.com/og-image-managed.png",
        width: 1200,
        height: 630,
        alt: "CircleWorks — Managed Payroll & HR for Creator Agencies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CircleWorks | Managed Payroll & HR — Done For You",
    description:
      "Fully managed payroll and HR service for the creator economy. We run it for you.",
    images: ["https://circleworks.com/og-image-managed.png"],
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
    "CircleWorks is a fully managed Payroll and HR service provider for creators, talent agencies, and media companies.",
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CircleWorks",
  operatingSystem: "Web",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "49.00",
    priceCurrency: "USD",
    priceValidUntil: "2026-12-31",
    description: "Managed service plans scaled to your team",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1240",
    bestRating: "5",
    worstRating: "1",
  },
  description:
    "Fully managed payroll and HR platform for creator agencies, handling both W-2 and 1099 talent.",
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

        {/* ── Services Section (formerly features) ── */}
        <Suspense fallback={<SectionSkeleton height="h-[600px]" />}>
          <FeaturesSection />
        </Suspense>

        {/* ── How It Works ── */}
        <Suspense fallback={<LightSectionSkeleton height="h-[500px]" />}>
          <HowItWorks />
        </Suspense>

        {/* ── Who We Serve ── */}
        <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
          <WhoWeServe />
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
