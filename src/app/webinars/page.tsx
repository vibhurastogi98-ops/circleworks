import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FEATURED_WEBINAR_TAGS, WEBINARS } from "@/data/webinars";
import WebinarsClient from "./WebinarsClient";

export const metadata: Metadata = {
  metadataBase: new URL("https://circleworks.com"),
  title: "Webinars & Events | CircleWorks",
  description: "Join upcoming webinars and watch our on-demand library for payroll, HR, and compliance tips.",
  alternates: {
    canonical: "https://circleworks.com/webinars",
  },
  openGraph: {
    title: "Webinars & Events | CircleWorks",
    description:
      "Join upcoming webinars and watch on-demand sessions for payroll, compliance, HR, and CircleWorks product demos.",
    url: "https://circleworks.com/webinars",
    siteName: "CircleWorks",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webinars & Events | CircleWorks",
    description:
      "Live and on-demand sessions for payroll, compliance, HR, and CircleWorks product workflows.",
  },
};

export default function WebinarsPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-200 selection:text-navy">
      <Navbar />
      <WebinarsClient initialWebinars={WEBINARS} featuredTags={FEATURED_WEBINAR_TAGS} />
      <Footer />
    </main>
  );
}
