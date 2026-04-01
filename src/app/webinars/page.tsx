"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PlayCircle, Users, Calendar, ArrowRight } from "lucide-react";

/**
 * Webinars Landing Page
 * Placeholder for all live and on-demand CircleWorks educational content.
 */

const UPCOMING_WEBINARS = [
  {
    title: "Mastering Multi-State Compliance in 2026",
    date: "April 15, 2026",
    time: "11:00 AM PST",
    speaker: "Jane Doe, Head of Compliance",
    desc: "Learn about the latest tax law changes and how to ensure your scaling company stays audit-ready."
  },
  {
    title: "The Future of AI in HR Operations",
    date: "May 2, 2026",
    time: "10:00 AM PST",
    speaker: "Mark Smith, CTO at CircleWorks",
    desc: "How generative AI is changing the way companies manage talent, payroll, and employee engagement."
  }
];

export default function WebinarsPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden text-center z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6"
          >
            Insights & <span className="text-blue-400">Webinars.</span>
          </motion.h1>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Deep dives into payroll, HRIS, and the creator economy from the leading experts in the field.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col gap-16">
        <div>
          <h2 className="text-3xl font-black text-[#0A1628] mb-8">Upcoming Sessions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {UPCOMING_WEBINARS.map((webinar, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-start"
              >
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-4">
                  <Calendar size={16} />
                  {webinar.date} at {webinar.time}
                </div>
                <h3 className="text-xl font-bold text-[#0A1628] mb-3">{webinar.title}</h3>
                <p className="text-slate-500 mb-6 text-sm">{webinar.desc}</p>
                <button className="bg-[#0A1628] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm mt-auto">
                  Reserve My Spot
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-[#0A1628] mb-8">On-Demand Library</h2>
          <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center text-center">
            <PlayCircle className="text-slate-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-[#0A1628] mb-2">Recording library coming soon.</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We&apos;re currently compiling our past sessions into a curated video experience for our users.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
