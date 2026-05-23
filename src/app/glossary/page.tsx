import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlossaryIndexClient from "@/components/glossary/GlossaryIndexClient";
import { glossaryTermCount, glossaryTerms } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "HR & Payroll Glossary - 200+ Terms Defined",
  description:
    "Explore 200+ plain-English HR, payroll, tax, benefits, compliance, hiring, and workforce terms from CircleWorks.",
  alternates: {
    canonical: "https://circleworks.vercel.app/glossary",
  },
  openGraph: {
    title: "HR & Payroll Glossary - 200+ Terms Defined",
    description:
      "Plain-English definitions for HR, payroll, compliance, benefits, hiring, time, and workforce terms.",
    url: "https://circleworks.vercel.app/glossary",
  },
};

export default function GlossaryPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-slate-950">
      <Navbar />

      <section
        className="px-6 pb-20 pt-32 text-center lg:pb-24 lg:pt-40"
        style={{ backgroundColor: "#071426" }}
      >
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-sm font-black uppercase text-cyan-300">
            CircleWorks glossary
          </p>
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
            HR & Payroll Glossary — 200+ Terms Defined
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Plain-English definitions for payroll, HR, compliance, benefits,
            hiring, time tracking, leave, reporting, and security. Browse all{" "}
            {glossaryTermCount} terms or search by keyword.
          </p>
        </div>
      </section>

      <GlossaryIndexClient terms={glossaryTerms} />

      <Footer />
    </main>
  );
}
