"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function BlogPostClient({ slug }: { slug: string }) {
  const [activeToc, setActiveToc] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll("h2[id]");
      let activeId = "";
      headings.forEach((h) => {
        const top = h.getBoundingClientRect().top;
        if (top >= 0 && top <= 300) {
          activeId = h.id;
        }
      });
      if (activeId) setActiveToc(activeId);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Quick TOC Array
  const tocList = [
    { id: "intro", title: "Introduction to California Payroll" },
    { id: "tax-rates", title: "Understanding CA Tax Rates in 2026" },
    { id: "meal-breaks", title: "Meal Breaks and Rest Periods" },
    { id: "overtime", title: "Daily Overtime vs Weekly Overtime" },
    { id: "final-pay", title: "Final Paycheck Rules" },
    { id: "compliance-checklist", title: "Your 2026 Compliance Checklist" }
  ];

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      {/* TOP BAR (Breadcrumbs & Share) */}
      <div className="pt-[72px] lg:pt-[80px]">
        <div className="border-b border-slate-100 bg-white sticky top-[72px] lg:top-[80px] z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="text-sm font-medium text-slate-500">
                <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
                <span className="mx-2 text-slate-300">/</span>
                <Link href="/blog" className="hover:text-blue-600 transition-colors">Compliance</Link>
                <span className="mx-2 text-slate-300">/</span>
                <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-[400px] inline-block align-bottom">
                  How to Run Payroll in California in 2025
                </span>
             </div>
             
             <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-[#1DA1F2] hover:bg-slate-50 rounded-lg transition-colors" title="Share on Twitter">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </button>
                <button className="p-2 text-slate-400 hover:text-[#0A66C2] hover:bg-slate-50 rounded-lg transition-colors" title="Share on LinkedIn">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold" title="Copy Link">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                   <span className="hidden sm:inline">Copy link</span>
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="bg-white pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <div className="inline-block px-3 py-1 rounded bg-orange-100 text-orange-600 font-black text-[11px] uppercase tracking-widest mb-6">
              Compliance
           </div>
           
           <h1 className="text-4xl sm:text-[48px] font-black text-[#0A1628] leading-[1.1] tracking-tight mb-8">
              How to Run Payroll in California in 2025
           </h1>
           
           <p className="text-lg lg:text-[18px] text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Navigating California&apos;s strict labor laws, meal breaks, and daily overtime rules can be a nightmare. Here is your complete 2026 guide to paying California employees legally and efficiently.
           </p>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12">
              <div className="flex items-center gap-3">
                 <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-inner">
                   MR
                 </div>
                 <div className="text-left leading-tight">
                    <div className="text-sm font-bold text-slate-900">Written by Mike R.</div>
                    <div className="text-xs text-slate-500">HR Compliance Lead</div>
                 </div>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-3 text-sm text-slate-500 font-medium whitespace-nowrap">
                 <span>Mar 15, 2026</span>
                 <span className="w-1 h-1 rounded-full bg-slate-300" />
                 <span>8 min read</span>
                 <span className="w-1 h-1 rounded-full bg-slate-300" />
                 <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">Updated March 2026</span>
              </div>
           </div>
           
           <div className="h-px w-full bg-slate-200" />
        </div>
      </section>

      {/* 2-COLUMN LAYOUT MAIN CONTENT */}
      <section className="pb-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
               
               {/* Left Column (Content) 68% */}
               <div className="w-full lg:w-[68%]">
                  <article className="prose prose-lg prose-slate max-w-none text-[18px] text-slate-700 leading-[1.8]">
                     <p className="lead text-xl text-slate-600 font-medium mb-8">
                        If you&apos;ve just hired your first employee in California—or if you&apos;re a seasoned business navigating the state&apos;s ever-changing labor laws—you already know: California payroll plays by its own rules.
                     </p>

                     <h2 id="intro" className="text-[28px] font-bold text-[#0A1628] mt-12 mb-6 tracking-tight scroll-mt-32">
                        Introduction to California Payroll
                     </h2>
                     <p>
                        From the Department of Industrial Relations (DIR) to the stringent Employment Development Department (EDD), California&apos;s regulatory framework requires constant vigilance. Violating meal break policies or miscalculating daily overtime can lead to massive PAGA (Private Attorneys General Act) lawsuits.
                     </p>
                     
                     <h3 className="text-[22px] font-semibold text-[#0A1628] mt-10 mb-4 tracking-tight">
                        What makes California different?
                     </h3>
                     <ul className="list-none space-y-3 mb-8 pl-0">
                        {["Daily overtime tracking (not just weekly).", "Strict meal and rest penalty algorithms.", "Complex localized minimum wage ordinances.", "Extremely tight final paycheck deadlines."].map((item, i) => (
                           <li key={i} className="flex items-start gap-3">
                              <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                              <span>{item}</span>
                           </li>
                        ))}
                     </ul>

                     {/* Mid-Article Callout Box */}
                     <div className="my-12 p-8 bg-blue-50/50 border border-blue-100 border-l-4 border-l-blue-600 rounded-r-xl shadow-sm">
                        <div className="text-xl font-bold text-[#0A1628] mb-2 flex items-center gap-2">
                           <span>💡</span> Stop stressing over EDD notices.
                        </div>
                        <p className="text-slate-600 text-[17px] mb-4">
                           Try CircleWorks — run California payroll natively and compliantly in under 8 minutes. We auto-calculate meal penalties, local wages, and daily overtime natively.
                        </p>
                        <a href="/pricing" className="inline-flex items-center text-blue-700 font-bold hover:text-blue-800 transition-colors">
                           Start your free 30-day trial &rarr;
                        </a>
                     </div>

                     <h2 id="tax-rates" className="text-[28px] font-bold text-[#0A1628] mt-12 mb-6 tracking-tight scroll-mt-32">
                        Understanding CA Tax Rates in 2026
                     </h2>
                     <p>
                        Both employers and employees share the tax burden in California. Employers are responsible for managing SUI (State Unemployment Insurance), ETT (Employment Training Tax), and SDI (State Disability Insurance).
                     </p>
                     
                     {/* Standard Table */}
                     <div className="overflow-x-auto my-8">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                           <thead>
                              <tr className="bg-[#0A1628] text-white">
                                 <th className="p-4 rounded-tl-lg font-bold">Tax Type</th>
                                 <th className="p-4 font-bold">Paid By</th>
                                 <th className="p-4 rounded-tr-lg font-bold">2026 Rate / Details</th>
                              </tr>
                           </thead>
                           <tbody className="bg-white border border-slate-200 text-sm">
                              <tr className="border-b border-slate-200">
                                 <td className="p-4 font-semibold text-slate-800">State Disability Insurance (SDI)</td>
                                 <td className="p-4 text-slate-600">Employee</td>
                                 <td className="p-4 text-slate-600">1.1% (Wage ceiling removed)</td>
                              </tr>
                              <tr className="border-b border-slate-200 bg-slate-50">
                                 <td className="p-4 font-semibold text-slate-800">State Unemployment (SUI)</td>
                                 <td className="p-4 text-slate-600">Employer</td>
                                 <td className="p-4 text-slate-600">1.5% to 6.2% on first $7,000</td>
                              </tr>
                              <tr>
                                 <td className="p-4 font-semibold text-slate-800">Employment Training (ETT)</td>
                                 <td className="p-4 text-slate-600">Employer</td>
                                 <td className="p-4 text-slate-600">0.1% on first $7,000</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>

                     <h2 id="meal-breaks" className="text-[28px] font-bold text-[#0A1628] mt-12 mb-6 tracking-tight scroll-mt-32">
                        Meal Breaks and Rest Periods
                     </h2>
                     <p>
                        California law dictates that an employee must be provided a 30-minute unpaid meal period. If you fail to provide this, you owe the employee &quot;premium pay&quot;—which is exactly one additional hour of pay at their regular rate.
                     </p>

                     {/* Code / Reference block */}
                     <div className="my-8 bg-[#0F1C2E] p-6 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                        <div className="text-xs text-slate-400 font-sans font-bold uppercase tracking-wider mb-2 border-b border-slate-700 pb-2">CA Labor Code § 226.7</div>
                        <code className="text-[14px] text-cyan-300 font-mono leading-relaxed">
                           &quot;If an employer fails to provide an employee a meal or rest or recovery period... the employer shall pay the employee one additional hour of pay at the employee&apos;s regular rate of compensation.&quot;
                        </code>
                     </div>

                     <h2 id="overtime" className="text-[28px] font-bold text-[#0A1628] mt-12 mb-6 tracking-tight scroll-mt-32">
                        Daily Overtime vs Weekly Overtime
                     </h2>
                     <p>
                        Unlike federal law which only looks at 40 hours per week, California tracks <em>daily</em> hours. Anything over 8 hours in a single day is standard 1.5x overtime. Anything over 12 hours in a single day bumps to 2.0x double-time.
                     </p>

                     <h2 id="final-pay" className="text-[28px] font-bold text-[#0A1628] mt-12 mb-6 tracking-tight scroll-mt-32">
                        Final Paycheck Rules
                     </h2>
                     <p>
                        If you terminate an employee in California, their final paycheck (including all accrued, unused PTO) must be handed to them exactly at the <strong>time of termination</strong>. If they quit with over 72 hours&apos; notice, they must be paid on their final day. Failing this accrues &quot;Waiting Time Penalties&quot;—a full day&apos;s wages for every day the check is late, up to 30 days.
                     </p>

                     <h2 id="compliance-checklist" className="text-[28px] font-bold text-[#0A1628] mt-12 mb-6 tracking-tight scroll-mt-32">
                        Your 2026 Compliance Checklist
                     </h2>
                     <ul className="list-decimal space-y-3 mb-8 pl-5 text-slate-800 marker:text-blue-500 marker:font-bold">
                        <li>Register with the EDD for an employer account number.</li>
                        <li>Update all local minimum wage rates (e.g., SF, LA, San Jose).</li>
                        <li>Ensure sick leave policies grant at least 40 hours or 5 days annually.</li>
                        <li>Implement a system to track meal break penalties automatically.</li>
                     </ul>

                     <p className="mt-10 font-medium">
                        Running payroll manually in California is a recipe for expensive fines. CircleWorks was built to automate every single layer of this complexity for you, so you can focus on running your actual business.
                     </p>
                  </article>
                  
                  <div className="mt-16 pt-16 border-t border-slate-200" />
                  
                  {/* AUTHOR BIO (Bottom of article) */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm hover:shadow-md transition-shadow">
                     <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-2xl shadow-inner shrink-0">
                        MR
                     </div>
                     <div className="text-center sm:text-left flex-1">
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">About the author</div>
                        <h4 className="text-xl font-black text-[#0A1628] mb-2">Mike R.</h4>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                           Mike is the Lead Compliance Analyst at CircleWorks. With a decade of HR experience bridging New York and California labor markets, he specializes in turning dense labor statutes into automated payroll architecture.
                        </p>
                        <a href="#linkedin" className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors">
                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                           Connect on LinkedIn
                        </a>
                     </div>
                  </div>

               </div>

               {/* Right Column (Sticky Sidebar) 32% */}
               <div className="hidden lg:block lg:w-[32%] shrink-0">
                  <div className="sticky top-[140px]">
                     
                     <div className="mb-10">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Table of Contents</div>
                        <nav className="flex flex-col gap-3">
                           {tocList.map((toc) => (
                              <a 
                                 key={toc.id} 
                                 href={`#${toc.id}`}
                                 className={`text-[15px] font-medium transition-colors border-l-2 pl-4 py-1 hover:text-blue-600 ${
                                    activeToc === toc.id 
                                    ? "border-blue-500 text-blue-600" 
                                    : "border-slate-100 text-slate-500 hover:border-slate-300"
                                 }`}
                              >
                                 {toc.title}
                              </a>
                           ))}
                        </nav>
                     </div>

                     <div className="bg-[#0A1628] rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10 mb-10 overflow-hidden relative">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />
                        <h4 className="font-black text-xl mb-3 relative z-10">Try CircleWorks Free</h4>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed relative z-10">
                           Automate CA labor laws, meal penalties, and multi-state compliance instantly.
                        </p>
                        <a href="/pricing" className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors relative z-10 shadow-lg">
                           Start 30-Day Trial
                        </a>
                        <div className="text-center mt-3 text-xs text-slate-500 font-medium relative z-10">
                           No credit card required.
                        </div>
                     </div>

                     <div className="h-px w-full bg-slate-100 mb-10" />

                     <div>
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Related Articles</div>
                        <div className="flex flex-col gap-5">
                           {[
                             "What to look for in a modern HRIS platform",
                             "Earned Wage Access is the New 401(k)",
                             "Navigating the Changing Independent Contractor Rules"
                           ].map((title, i) => (
                              <a key={i} href="#article" className="text-sm font-bold text-[#0A1628] leading-snug hover:text-blue-600 transition-colors group flex items-start gap-2">
                                 <span className="text-cyan-500">&rarr;</span>
                                 <span className="group-hover:underline decoration-blue-200 underline-offset-4">{title}</span>
                              </a>
                           ))}
                        </div>
                     </div>

                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* RELATED ARTICLES (Horizontal Row) */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-black text-[#0A1628] mb-10">Continue reading</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  { cat: "Payroll", title: "10 Payroll Mistakes Costing You Money", thumb: "💸" },
                  { cat: "Compliance", title: "New York Paid Family Leave Explained", thumb: "🗽" },
                  { cat: "Hiring", title: "Interview Scorecards: Stop Hiring on Gut Feeling", thumb: "🎯" }
               ].map((art, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col cursor-pointer">
                     <div className="w-full aspect-[2/1] bg-slate-100 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500 relative">
                        <div className="absolute top-4 left-4 z-20 bg-white/90 px-2 py-1 rounded text-[10px] font-black uppercase text-blue-700 tracking-wider shadow-sm">
                           {art.cat}
                        </div>
                        {art.thumb}
                     </div>
                     <div className="p-6 flex-1 bg-white relative z-10">
                        <h4 className="font-bold text-lg text-[#0A1628] leading-snug group-hover:text-blue-600 transition-colors">{art.title}</h4>
                        <div className="mt-4 text-slate-500 text-xs font-medium">Read article &rarr;</div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* NEWSLETTER BAR */}
      <section className="py-20 bg-slate-100 border-t border-slate-200">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl sm:text-3xl font-black text-[#0A1628] mb-8">
               Enjoyed this article? Get our weekly dispatch.
            </h3>
            
            <form onSubmit={e=>e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
               <input type="email" placeholder="work@company.com" required className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium text-slate-900 shadow-sm" />
               <button type="submit" className="bg-[#0A1628] text-white font-bold rounded-xl px-8 py-3 hover:bg-blue-600 transition-colors shadow-md shrink-0">
                  Get more like it
               </button>
            </form>
         </div>
      </section>

      <Footer />
    </main>
  );
}
