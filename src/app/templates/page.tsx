import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TemplatesClient from "./TemplatesClient";
import { TEMPLATES } from "@/data/templates";

export const metadata: Metadata = {
  metadataBase: new URL("https://circleworks.com"),
  title: "Free HR Templates & Resources | CircleWorks",
  description: "Download expert-crafted HR templates, policies, checklists, and agreements to scale your HR operations effortlessly.",
  alternates: {
    canonical: "https://circleworks.com/templates",
  },
  openGraph: {
    title: "Free HR Templates & Resources | CircleWorks",
    description:
      "Search and download free HR templates, offer letters, onboarding checklists, payroll calendars, policies, and compliance resources.",
    url: "https://circleworks.com/templates",
    siteName: "CircleWorks",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free HR Templates & Resources | CircleWorks",
    description:
      "Free HR templates and resources for offer letters, onboarding, policies, payroll, and compliance.",
  },
};

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-200 selection:text-navy">
      <Navbar />
      <TemplatesClient initialTemplates={TEMPLATES} />
      <Footer />
    </main>
  );
}
