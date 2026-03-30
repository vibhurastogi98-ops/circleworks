"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const systems = [
  { name: "Core Payroll Engine", status: "Operational", uptime: "99.99%" },
  { name: "Dashboard & HRIS App", status: "Operational", uptime: "100%" },
  { name: "Public REST API", status: "Operational", uptime: "99.95%" },
  { name: "Webhooks Dispatcher", status: "Operational", uptime: "99.98%" },
  { name: "Tax Filing Subsystem", status: "Operational", uptime: "100%" },
];

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      {/* Header */}
      <section className="bg-white pt-32 pb-16 border-b border-slate-200 shadow-sm relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <h1 className="text-3xl md:text-5xl font-black text-[#0A1628] tracking-tight mb-4">CircleWorks Status</h1>
           <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 p-6 rounded-2xl shadow-sm">
              <div className="relative w-4 h-4">
                 <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
                 <div className="relative w-4 h-4 bg-emerald-500 rounded-full" />
              </div>
              <div>
                 <h2 className="text-lg font-bold text-emerald-800">All Systems Operational</h2>
                 <p className="text-sm font-medium text-emerald-600">Last updated: Just now</p>
              </div>
           </div>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
         {/* System Breakdown */}
         <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-16">
            <div className="p-6 bg-slate-50/50 border-b border-slate-200">
               <h3 className="font-bold text-[#0A1628]">System Uptime (Last 90 Days)</h3>
            </div>
            <div className="divide-y divide-slate-100">
               {systems.map((sys, i) => (
                  <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-default">
                     <span className="font-bold text-slate-800">{sys.name}</span>
                     <div className="flex items-center gap-6">
                        <span className="text-slate-400 font-mono text-sm hidden sm:block">{sys.uptime}</span>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                           ✓ {sys.status}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Past Incidents */}
         <h3 className="text-2xl font-black text-[#0A1628] mb-6">Past Incidents</h3>
         <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
               <h4 className="font-bold text-[#0A1628] text-lg mb-1">Elevated error rates on REST API</h4>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">March 12, 2026</p>
               <p className="text-slate-600 font-medium mb-3"><strong>Resolved</strong> — The issue has been identified and fully resolved. All API traffic is routing normally.</p>
               <p className="text-slate-600 font-medium mb-3"><strong>Monitoring</strong> — A fix has been deployed and we are monitoring the result.</p>
               <p className="text-slate-600 font-medium"><strong>Investigating</strong> — We are investigating reports of 500 errors on the `/v1/employees` endpoint.</p>
            </div>
            <div className="text-center py-8 text-slate-500 font-medium bg-white rounded-2xl border border-slate-200 border-dashed">
               No other incidents in the last 90 days.
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
