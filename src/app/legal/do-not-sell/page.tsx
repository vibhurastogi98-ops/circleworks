"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useState } from "react";

const legalLinks = [
  { name: "Privacy Policy", href: "/legal/privacy" },
  { name: "Terms of Service", href: "/legal/terms" },
  { name: "Cookie Settings", href: "/legal/cookies" },
  { name: "Do Not Sell My Data", href: "/legal/do-not-sell" },
];

export default function DoNotSellPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      <section className="pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] text-center border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-6">Do Not Sell My Personal Information</h1>
          <p className="text-slate-400 font-medium">Compliance under CCPA and CPRA.</p>
        </div>
      </section>

      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-16">
         {/* Sidebar Menu */}
         <div className="lg:w-1/4 shrink-0">
            <div className="sticky top-32 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Legal Documents</h3>
               <nav className="flex flex-col space-y-2">
                  {legalLinks.map(link => (
                     <Link key={link.href} href={link.href} className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${link.href === '/legal/do-not-sell' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {link.name}
                     </Link>
                  ))}
               </nav>
            </div>
         </div>

         {/* Content */}
         <div className="lg:w-3/4">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
               <div className="prose prose-slate max-w-none text-slate-600 leading-loose mb-10">
                  <h2 className="text-2xl font-black text-[#0A1628] mb-4">Your Privacy Rights</h2>
                  <p>
                     Under the California Consumer Privacy Act (CCPA) and other applicable state laws, residents have the right to opt-out of the "sale" or "sharing" of their personal information to third parties. 
                     <strong> Note: CircleWorks does not sell HR, payroll, or employee data to data brokers.</strong> The only data tracking we utilize pertains to website visitor analytics and marketing cookies.
                  </p>
                  <p>
                     If you wish to formally opt-out of all tracking, please submit your request using the form below, or update your tracking preferences on the <Link href="/legal/cookies" className="text-blue-600 font-bold hover:underline">Cookie Settings</Link> page.
                  </p>
               </div>

               {submitted ? (
                  <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                     <div className="text-3xl mb-4 text-emerald-500">✓</div>
                     <h3 className="text-xl font-bold text-[#0A1628] mb-2">Request Received</h3>
                     <p className="text-slate-600">Your privacy preferences have been updated and any associated personal marketing data will be purged within 45 days.</p>
                  </div>
               ) : (
                  <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="max-w-md bg-slate-50 p-6 lg:p-8 rounded-2xl border border-slate-200">
                     <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                           <input required type="email" placeholder="email@example.com" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 font-medium" />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Request Type</label>
                           <select className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 font-medium appearance-none">
                              <option>Opt-Out of "Sale" of Data</option>
                              <option>Delete My Account Data</option>
                              <option>Request My Data Output</option>
                           </select>
                        </div>
                        <button type="submit" className="w-full bg-[#0A1628] hover:bg-slate-800 text-white font-bold py-3.5 rounded-lg mt-4 transition-colors">
                           Submit Request
                        </button>
                     </div>
                  </form>
               )}
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
