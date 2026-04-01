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

// {/* SEO Update */} ── Homepage Metadata ──
export const metadata: Metadata = {
  title: "CircleWorks — THE ONLY PAYROLL & HR PLATFORM FOR CREATORS, AGENCIES & COMPANIES",
  description:
    "Run payroll in 3 clicks. All 50 states, auto tax filing, HRIS, ATS & benefits — one platform. 30-day free trial, no credit card required.",
  keywords: [
    "payroll software USA",
    "HR platform",
    "online payroll",
    "small business payroll software",
    "all-in-one HR platform",
    "CircleWorks",
  ],
  openGraph: {
    title: "CircleWorks — THE ONLY PAYROLL & HR PLATFORM FOR CREATORS, AGENCIES & COMPANIES",
    description:
      "Run payroll in 3 clicks. All 50 states, auto tax filing, HRIS, ATS & benefits — one platform. 30-day free trial, no credit card required.",
    type: "website",
    siteName: "CircleWorks",
    url: "https://circleworks.vercel.app",
    images: [
      {
        url: "https://circleworks.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "CircleWorks — USA Payroll & HR Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CircleWorks — THE ONLY PAYROLL & HR PLATFORM FOR CREATORS, AGENCIES & COMPANIES",
    description:
      "Run payroll in 3 clicks. All 50 states, auto tax filing, HRIS, ATS & benefits — one platform.",
    images: ["https://circleworks.vercel.app/og-image.png"],
  },
  alternates: {
    canonical: "https://circleworks.vercel.app",
  },
};

// {/* SEO Update */} ── Structured Data ──
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CircleWorks",
  "url": "https://circleworks.vercel.app",
  "logo": "https://circleworks.vercel.app/logo.png",
  "description": "All-in-one Payroll, HRIS, ATS, and Benefits platform built for US companies.",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "url": "https://circleworks.vercel.app/contact"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  }
};

const webpageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "CircleWorks — THE ONLY PAYROLL & HR PLATFORM FOR CREATORS, AGENCIES & COMPANIES",
  "url": "https://circleworks.vercel.app",
  "description": "Run payroll in 3 clicks. All 50 states, auto tax filing, HRIS, ATS & benefits — one platform.",
  "publisher": {
    "@type": "Organization",
    "name": "CircleWorks"
  }
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CircleWorks",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free base + $8/employee/month"
    },
    {
      "@type": "Offer",
      "name": "Pro",
      "price": "79",
      "priceCurrency": "USD",
      "description": "$79/mo base + $14/employee/month"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "342",
    "bestRating": "5"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can I pay W-2 employees AND 1099 creators from one platform?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — this is CircleWorks' core strength. Creators, agencies, and companies can run payroll for staff and contractor talent in the same pay cycle."
      }
    },
    {
      "@type": "Question",
      "name": "Can CircleWorks handle multi-state teams and creators?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — CircleWorks natively supports payroll across all 50 US states, perfect for agencies and companies with distributed creator teams."
      }
    },
    {
      "@type": "Question",
      "name": "Does CircleWorks handle tax filing automatically?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CircleWorks calculates, withholds, and files federal, state, and local payroll taxes every pay period, including quarterly 941s, W-2s and 1099s."
      }
    },
    {
      "@type": "Question",
      "name": "Does CircleWorks work for 1099 contractors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. CircleWorks lets you pay W-2 employees and 1099 contractors from the same platform with year-end 1099-NEC filing included."
      }
    },
    {
      "@type": "Question",
      "name": "Is CircleWorks HIPAA and SOC 2 compliant?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. CircleWorks maintains full HIPAA compliance and annual SOC 2 Type II audits with AES-256 encryption."
      }
    }
  ]
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
      {/* SEO Update ── Structured Data ── */}
      <Script
        id="org-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="webpage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
