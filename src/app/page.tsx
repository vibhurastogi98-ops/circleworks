import { Suspense } from "react";
import type { Metadata } from "next";

import Navbar from "@/components/marketing/Navbar";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://circleworks.com"),
  title: "CircleWorks | USA Payroll & HR Platform",
  description:
    "CircleWorks is a USA payroll and HR platform for payroll, HRIS, ATS, benefits, time, compliance, and analytics in one source of truth.",
  openGraph: {
    title: "CircleWorks | USA Payroll & HR Platform",
    description:
      "Run payroll, HR, hiring, benefits, compliance, and people analytics from one modern platform.",
    type: "website",
    siteName: "CircleWorks",
    url: "https://circleworks.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CircleWorks USA Payroll and HR Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CircleWorks | USA Payroll & HR Platform",
    description:
      "Run payroll, HR, hiring, benefits, compliance, and people analytics from one modern platform.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://circleworks.com",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CircleWorks",
  url: "https://circleworks.com",
  logo: "https://circleworks.com/logo.png",
  description:
    "CircleWorks is a USA payroll and HR platform for modern companies.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: "https://circleworks.com/contact",
  },
  sameAs: [
    "https://www.linkedin.com/company/circleworks",
    "https://twitter.com/circleworks",
  ],
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CircleWorks",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Payroll and HR platform",
  operatingSystem: "Web",
  url: "https://circleworks.com",
  description:
    "A USA payroll and HR platform with payroll, HRIS, ATS, benefits, time, compliance, and analytics.",
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://circleworks.com/pricing",
  },
  publisher: {
    "@type": "Organization",
    name: "CircleWorks",
  },
};

function JsonLd({
  id,
  data,
}: {
  id: string;
  data: Record<string, unknown>;
}) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function SectionSkeleton({
  height = "h-96",
  tone = "light",
}: {
  height?: string;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";

  return (
    <div
      className={`w-full ${height} animate-pulse ${
        isDark ? "bg-[#0A1628]" : "bg-gray-50"
      }`}
      aria-hidden="true"
    >
      <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-4 px-6">
        <div
          className={`h-8 w-64 rounded-lg ${
            isDark ? "bg-white/15" : "bg-gray-200"
          }`}
        />
        <div
          className={`h-4 w-full max-w-md rounded ${
            isDark ? "bg-white/10" : "bg-gray-200/80"
          }`}
        />
        <div
          className={`h-4 w-full max-w-sm rounded ${
            isDark ? "bg-white/10" : "bg-gray-200/60"
          }`}
        />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd id="organization-jsonld" data={organizationSchema} />
      <JsonLd id="software-application-jsonld" data={softwareApplicationSchema} />

      <main id="main-content" className="min-h-screen bg-white">
        <Suspense fallback={<SectionSkeleton height="h-[72px]" />}>
          <Navbar />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-screen" tone="dark" />}>
          <HeroSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-40" tone="dark" />}>
          <StatsSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-[720px]" />}>
          <FeaturesSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-[560px]" tone="dark" />}>
          <DemoSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-[640px]" />}>
          <TestimonialsSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-[560px]" tone="dark" />}>
          <PricingTeaser />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-[360px]" />}>
          <IntegrationsSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-[640px]" />}>
          <FAQSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-96" tone="dark" />}>
          <CtaSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-64" tone="dark" />}>
          <SiteFooter />
        </Suspense>
      </main>
    </>
  );
}
