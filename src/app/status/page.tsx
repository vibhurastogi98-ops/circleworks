import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getStatusPayload } from "@/lib/status-monitor";

import StatusMonitor from "./StatusMonitor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "System Status | CircleWorks",
  description:
    "Live CircleWorks uptime, component health, 90-day history, and incident updates.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function StatusPage() {
  const status = await getStatusPayload();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <StatusMonitor initialData={status} />
      <Footer />
    </main>
  );
}
