"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CompareCompetitorPage() {
  const params = useParams();
  // Ensure we safely handle the slug format (e.g., 'vs-gusto') and capitalize it properly.
  const slug = (params.slug as string) || "vs-competitor";
  const competitorNameRaw = slug.replace("vs-", "");
  const competitorName = competitorNameRaw.charAt(0).toUpperCase() + competitorNameRaw.slice(1);

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden text-center z-10 border-b border-slate-800">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 mb-8"
          >
             <div className="bg-slate-800 px-4 py-2 rounded-xl text-white font-black text-sm uppercase tracking-widest border border-slate-700">CircleWorks</div>
             <div className="text-slate-500 italic text-sm">vs</div>
             <div className="bg-white/5 px-4 py-2 rounded-xl text-slate-300 font-bold text-sm uppercase tracking-widest border border-white/10">{competitorName}</div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto"
          >
            A faster, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">modern</span> alternative to {competitorName}.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            See why growing teams switch from {competitorName} to get fully unified HR, scalable payroll, and world-class customer support.
          </motion.p>
        </div>
      </section>

      {/* Feature Grid Breakdown */}
      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
               <thead>
                  <tr>
                     <th className="p-6 border-b border-slate-200 text-lg font-bold text-slate-400 w-1/3">Feature Comparison</th>
                     <th className="p-6 border-b border-slate-200 w-1/3 border-x border-blue-50 bg-blue-50/50 rounded-t-2xl">
                        <div className="text-2xl font-black text-blue-600">CircleWorks</div>
                     </th>
                     <th className="p-6 border-b border-slate-200 text-2xl font-bold text-[#0A1628] w-1/3">
                        {competitorName}
                     </th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  <tr className="group hover:bg-slate-50 transition-colors">
                     <td className="p-6 font-bold text-[#0A1628]">All-in-one HRIS Architecture</td>
                     <td className="p-6 border-x border-blue-50 bg-blue-50/20 text-blue-600 font-bold">✓ Fully Unified Engine</td>
                     <td className="p-6 text-slate-500 font-medium">Add-ons & Integrations</td>
                  </tr>
                  <tr className="group hover:bg-slate-50 transition-colors">
                     <td className="p-6 font-bold text-[#0A1628]">Customer Support SLA</td>
                     <td className="p-6 border-x border-blue-50 bg-blue-50/20 text-blue-600 font-bold">✓ 3-minute average response</td>
                     <td className="p-6 text-slate-500 font-medium">Often outsourced, 48+ hours</td>
                  </tr>
                  <tr className="group hover:bg-slate-50 transition-colors">
                     <td className="p-6 font-bold text-[#0A1628]">Custom Field API Reporting</td>
                     <td className="p-6 border-x border-blue-50 bg-blue-50/20 text-blue-600 font-bold">✓ Native and unlimited</td>
                     <td className="p-6 text-slate-500 font-medium">Limited or costly upgrade</td>
                  </tr>
                  <tr className="group hover:bg-slate-50 transition-colors">
                     <td className="p-6 font-bold text-[#0A1628]">Transparent Pricing</td>
                     <td className="p-6 border-x border-blue-50 bg-blue-50/20 text-blue-600 font-bold">✓ No hidden implementation fees</td>
                     <td className="p-6 text-slate-500 font-medium">Opaque sales processes</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </section>

      {/* Switch Component */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-[#0A1628] mb-6">Switching from {competitorName} is easy.</h2>
            <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">Our white-glove onboarding team will run parallel payrolls to ensure everything perfectly syncs before you drop {competitorName} entirely.</p>
            <div className="flex justify-center flex-wrap gap-4">
               <Link href="/contact" className="px-8 py-4 bg-[#0A1628] hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-lg">
                  Talk to Sales
               </Link>
               <Link href="/pricing" className="px-8 py-4 bg-white border border-slate-300 hover:border-blue-500 text-[#0A1628] font-bold rounded-xl transition-colors shadow-sm">
                  View Our Pricing
               </Link>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
