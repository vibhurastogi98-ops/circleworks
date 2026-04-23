import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TemplatesClient from "./TemplatesClient";
import { TEMPLATES } from "../api/templates/route";

export const metadata: Metadata = {
  title: "Free HR Templates & Resources | CircleWorks",
  description: "Download expert-crafted HR templates, policies, checklists, and agreements to scale your HR operations effortlessly.",
  alternates: {
    canonical: "https://circleworks.com/templates",
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
