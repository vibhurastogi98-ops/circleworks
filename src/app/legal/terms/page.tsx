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

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      <section className="pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] text-center border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-6">Terms of Service</h1>
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
                     <Link key={link.href} href={link.href} className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${link.href === '/legal/terms' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
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
                  <h2 className="text-2xl font-black text-[#0A1628] mb-4">1. Acceptance of Terms</h2>
                  <p className="mb-8">
                     By accessing and using the CircleWorks platform, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using CircleWorks's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                  </p>

                  <h2 className="text-2xl font-black text-[#0A1628] mb-4">2. Provision of Services</h2>
                  <p className="mb-8">
                     CircleWorks provides a cloud-based human resources, payroll processing, and benefits administration platform. You acknowledge and agree that the form and nature of the Services which CircleWorks provides may change from time to time without prior notice to you.
                  </p>

                  <h2 className="text-2xl font-black text-[#0A1628] mb-4">3. Customer Responsibilities</h2>
                  <p className="mb-4">As a user of the Services, you agree to:</p>
                  <ul className="list-disc pl-6 mb-8 space-y-2">
                     <li>Provide true, accurate, current, and complete information about your company and your employees.</li>
                     <li>Ensure your account has sufficient funds to cover all payroll liabilities, including employee wages and tax remittances, prior to the required processing date.</li>
                     <li>Maintain the confidentiality of your passwords and account identifiers.</li>
                  </ul>

                  <h2 className="text-2xl font-black text-[#0A1628] mb-4">4. Limitation of Liability</h2>
                  <p className="mb-8">
                     In no event shall CircleWorks, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service.
                  </p>

                  <h2 className="text-2xl font-black text-[#0A1628] mb-4">5. Governing Law</h2>
                  <p className="mb-8">
                     These Terms shall be governed and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
                  </p>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
