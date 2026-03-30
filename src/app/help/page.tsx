"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      <section className="bg-blue-600 pt-48 pb-32 px-4 shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
           <h1 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">How can we help?</h1>
           <div className="relative">
              <input type="text" placeholder="Search for articles, guides, or troubleshooting..." className="w-full bg-white rounded-2xl px-6 py-5 pl-14 shadow-2xl text-lg font-medium outline-none focus:ring-4 focus:ring-blue-400 placeholder-slate-400 text-slate-900 border-none transition-shadow" />
              <svg className="absolute left-5 top-5 text-slate-400 w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
        </div>
      </section>

      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
         <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center text-center cursor-pointer hover:-translate-y-1 transition-transform group">
               <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💸</div>
               <h3 className="text-xl font-bold text-[#0A1628] mb-2">Payroll</h3>
               <p className="text-sm text-slate-500 font-medium">Running payroll, fixing errors, and tax payments.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center text-center cursor-pointer hover:-translate-y-1 transition-transform group">
               <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👥</div>
               <h3 className="text-xl font-bold text-[#0A1628] mb-2">Employees</h3>
               <p className="text-sm text-slate-500 font-medium">Inviting staff, onboarding, and offboarding.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center text-center cursor-pointer hover:-translate-y-1 transition-transform group">
               <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚙️</div>
               <h3 className="text-xl font-bold text-[#0A1628] mb-2">Account Settings</h3>
               <p className="text-sm text-slate-500 font-medium">Billing, permissions, and company info.</p>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
