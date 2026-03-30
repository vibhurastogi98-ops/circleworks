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

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      <section className="pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] text-center border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-6">Privacy Policy</h1>
          <p className="text-slate-400 font-medium">Last Updated: March 27, 2026</p>
        </div>
      </section>

      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-16">
         {/* Sidebar Menu */}
         <div className="lg:w-1/4 shrink-0">
            <div className="sticky top-32 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Legal Documents</h3>
               <nav className="flex flex-col space-y-2">
                  {legalLinks.map(link => (
                     <Link key={link.href} href={link.href} className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${link.href === '/legal/privacy' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {link.name}
                     </Link>
                  ))}
               </nav>
            </div>
         </div>

         {/* Content */}
         <div className="lg:w-3/4">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
               <div className="prose prose-slate max-w-none text-slate-600 leading-loose">
                  <h2 className="text-2xl font-black text-[#0A1628] mb-4">1. Introduction</h2>
                  <p className="mb-8">
                     At CircleWorks ("we", "us", "our"), we respect your privacy and are committed to protecting it through our compliance with this policy. This Privacy Policy describes how we collect, use, and process the personal information of our customers, website visitors, and users of the CircleWorks platform.
                  </p>

                  <h2 className="text-2xl font-black text-[#0A1628] mb-4">2. Information We Collect</h2>
                  <p className="mb-4">We collect several types of information from and about users of our SaaS platform, including:</p>
                  <ul className="list-disc pl-6 mb-8 space-y-2">
                     <li><strong>Personal Information:</strong> Name, postal address, e-mail address, telephone number, Social Security Numbers (SSN), or any other identifier by which you or your employees may be contacted online or offline.</li>
                     <li><strong>Financial Information:</strong> Bank account numbers, routing numbers, and tax identification data necessary to process payroll.</li>
                     <li><strong>Usage Data:</strong> Details of your visits to our Website and platform, including traffic data, location data, logs, and other communication data and the resources that you access.</li>
                  </ul>

                  <h2 className="text-2xl font-black text-[#0A1628] mb-4">3. How We Use Your Information</h2>
                  <p className="mb-4">We use information that we collect about you or that you provide to us:</p>
                  <ul className="list-disc pl-6 mb-8 space-y-2">
                     <li>To present our Website and its contents to you.</li>
                     <li>To process payroll, remit tax payments, and provide other HR-related services you have requested.</li>
                     <li>To fulfill any other purpose for which you provide it.</li>
                     <li>To provide you with notices about your account, including expiration and renewal notices.</li>
                  </ul>

                  <h2 className="text-2xl font-black text-[#0A1628] mb-4">4. Data Security</h2>
                  <p className="mb-8">
                     We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls. Any payment transactions and SSN transmissions will be encrypted using SSL technology and AES-256 block-level encryption at rest.
                  </p>

                  <h2 className="text-2xl font-black text-[#0A1628] mb-4">5. Contact Information</h2>
                  <p className="mb-8">
                     To ask questions or comment about this privacy policy and our privacy practices, contact us at:<br/>
                     <a href="mailto:privacy@circleworks.com" className="font-bold text-blue-600 hover:underline">privacy@circleworks.com</a>
                  </p>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
