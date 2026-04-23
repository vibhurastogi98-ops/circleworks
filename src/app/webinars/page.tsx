import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebinarsClient from "./WebinarsClient";
import { WEBINARS } from "../api/webinars/route";

export const metadata: Metadata = {
  title: "Webinars & Events | CircleWorks",
  description: "Join upcoming webinars and watch our on-demand library for payroll, HR, and compliance tips.",
  alternates: {
    canonical: "https://circleworks.com/webinars",
  },
};

export default function WebinarsPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-200 selection:text-navy">
      <Navbar />
      <WebinarsClient initialWebinars={WEBINARS} />
      <Footer />
    </main>
  );
}
