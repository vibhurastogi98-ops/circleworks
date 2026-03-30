"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const legalLinks = [
  { name: "Privacy Policy", href: "/legal/privacy" },
  { name: "Terms of Service", href: "/legal/terms" },
  { name: "Cookie Settings", href: "/legal/cookies" },
  { name: "Do Not Sell My Data", href: "/legal/do-not-sell" },
];

export default function CookieSettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      <section className="pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] text-center border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-6">Cookie Settings</h1>
          <p className="text-slate-400 font-medium">Manage your tracking preferences.</p>
        </div>
      </section>

      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-16">
         {/* Sidebar Menu */}
         <div className="lg:w-1/4 shrink-0">
            <div className="sticky top-32 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Legal Documents</h3>
               <nav className="flex flex-col space-y-2">
                  {legalLinks.map(link => (
                     <Link key={link.href} href={link.href} className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${link.href === '/legal/cookies' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {link.name}
                     </Link>
                  ))}
               </nav>
            </div>
         </div>

         {/* Content */}
         <div className="lg:w-3/4">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
               <div className="prose prose-slate max-w-none text-slate-600 leading-loose mb-12">
                  <h2 className="text-2xl font-black text-[#0A1628] mb-4">Cookie Policy</h2>
                  <p>
                     We use cookies to personalize content, to provide social media features, and to analyze our traffic. Below, you can modify your consent settings for non-essential cookies.
                  </p>
               </div>

               <div className="space-y-6">
                  {/* Essential Block */}
                  <div className="flex items-start justify-between p-6 border border-slate-200 rounded-xl bg-slate-50">
                     <div className="pr-4">
                        <h4 className="text-lg font-bold text-[#0A1628]">Essential Cookies</h4>
                        <p className="text-sm text-slate-500 mt-1">These cookies are necessary for the website to function (e.g., keeping you logged in securely) and cannot be switched off.</p>
                     </div>
                     <div className="shrink-0 pt-1">
                        <div className="w-12 h-6 bg-slate-300 rounded-full flex items-center px-1 opacity-50 cursor-not-allowed">
                           <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                        </div>
                     </div>
                  </div>

                  {/* Analytics Block */}
                  <div className="flex items-start justify-between p-6 border border-slate-200 rounded-xl">
                     <div className="pr-4">
                        <h4 className="text-lg font-bold text-[#0A1628]">Analytics Cookies</h4>
                        <p className="text-sm text-slate-500 mt-1">Allows us to count visits and traffic sources so we can measure and improve the performance of our site, primarily via Google Analytics.</p>
                     </div>
                     <div className="shrink-0 pt-1">
                        <div className="w-12 h-6 bg-blue-500 rounded-full flex items-center px-1 transition-colors cursor-pointer">
                           <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                        </div>
                     </div>
                  </div>

                  {/* Marketing Block */}
                  <div className="flex items-start justify-between p-6 border border-slate-200 rounded-xl">
                     <div className="pr-4">
                        <h4 className="text-lg font-bold text-[#0A1628]">Marketing & Tracking Cookies</h4>
                        <p className="text-sm text-slate-500 mt-1">Set by our advertising partners (such as LinkedIn or Facebook) to build a profile of your interests and show you relevant adverts on other sites.</p>
                     </div>
                     <div className="shrink-0 pt-1">
                        <div className="w-12 h-6 bg-slate-300 rounded-full flex items-center px-1 transition-colors cursor-pointer">
                           <div className="w-4 h-4 bg-white rounded-full translate-x-0 shadow-sm" />
                        </div>
                     </div>
                  </div>

                  <div className="pt-8">
                     <button className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold py-3 px-8 rounded-lg shadow-md">
                        Save Preferences
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
