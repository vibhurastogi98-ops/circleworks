"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

const categories = ["All", "Payroll", "HR", "Compliance", "Hiring", "Benefits", "State Guides", "Templates"];

const allArticles = [
  { id: 1, cat: "Payroll", title: "10 Payroll Mistakes Costing You Money", excerpt: "Stop manually calculating overtime across 50 states. Here are the top 10 compliance errors draining American businesses.", author: "Sarah T.", date: "Oct 12, 2026", time: "5 min read" },
  { id: 2, cat: "Compliance", title: "The 2026 HR Compliance Checklist", excerpt: "Everything you need to stay out of trouble this year. From FLSA updates to new state sick leave mandates.", author: "Mike R.", date: "Oct 10, 2026", time: "8 min read" },
  { id: 3, cat: "Hiring", title: "How to Build a World-Class Onboarding Experience", excerpt: "Don't lose your best candidates in week one. A step-by-step guide to digital onboarding that actually engages.", author: "Elena C.", date: "Oct 8, 2026", time: "6 min read" },
  { id: 4, cat: "Benefits", title: "Decoding the 401(k): A Guide for Small Businesses", excerpt: "Offering retirement benefits doesn't have to be complex or expensive. Here's how to set up a turnkey 401(k).", author: "James W.", date: "Oct 5, 2026", time: "4 min read" },
  { id: 5, cat: "State Guides", title: "California Labor Laws: The Ultimate Guide", excerpt: "Navigating meal breaks, rest periods, and strict overtime laws in the Golden State. A must-read for multi-state employers.", author: "Sarah T.", date: "Oct 2, 2026", time: "12 min read" },
  { id: 6, cat: "HR", title: "Transitioning from PEO to In-House HRIS", excerpt: "When does it make sense to leave your PEO? We break down the math, the operational costs, and the control you gain.", author: "David K.", date: "Sep 28, 2026", time: "7 min read" },
  { id: 7, cat: "Templates", title: "Free Offer Letter Template (Attorney Reviewed)", excerpt: "Download our standard, fully compliant offer letter template used by over 1,000 fast-growing tech companies.", author: "Legal Team", date: "Sep 25, 2026", time: "3 min read" },
  { id: 8, cat: "Payroll", title: "Earned Wage Access is the New 401(k)", excerpt: "Why offering daily pay to your employees is becoming the most requested benefit in retail and manufacturing.", author: "Mike R.", date: "Sep 22, 2026", time: "5 min read" },
  { id: 9, cat: "Hiring", title: "Interview Scorecards: Stop Hiring on Gut Feeling", excerpt: "Standardize your interview process and reduce bias with structured scorecards. Free templates included.", author: "Elena C.", date: "Sep 19, 2026", time: "6 min read" },
  { id: 10, cat: "Compliance", title: "Navigating the Changing Independent Contractor Rules", excerpt: "The line between W-2 and 1099 is shifting again. Here's what you need to know about the DOL's new final rule.", author: "Legal Team", date: "Sep 15, 2026", time: "9 min read" },
  { id: 11, cat: "State Guides", title: "New York Paid Family Leave (PFL) Explained", excerpt: "A complete employer guide to managing NY PFL deductions and coordinating with FMLA.", author: "Sarah T.", date: "Sep 12, 2026", time: "8 min read" },
  { id: 12, cat: "Benefits", title: "The Rise of Lifestyle Spending Accounts (LSAs)", excerpt: "Beyond health and dental: How LSAs are changing the way modern companies reward and retain top talent.", author: "James W.", date: "Sep 8, 2026", time: "5 min read" },
];

export default function BlogPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [cardsToShow, setCardsToShow] = useState(9);

  const filteredArticles = activeFilter === "All" ? allArticles : allArticles.filter(a => a.cat === activeFilter);
  const visibleArticles = filteredArticles.slice(0, cardsToShow);

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      {/* SECTION 1 - HERO */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            The CircleWorks Blog
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-white leading-[1.1] tracking-tight mb-6">
            HR & Payroll Insights for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">US Companies</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Compliance guides, payroll tips, hiring strategies &mdash; updated weekly.
          </p>

          <div className="max-w-xl mx-auto relative mb-8">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <input type="text" placeholder="Search articles..." className="w-full bg-slate-100 border-2 border-transparent focus:border-cyan-400 pl-12 pr-4 py-4 rounded-xl text-slate-900 font-medium outline-none transition-colors shadow-lg" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
             <span className="text-sm font-semibold text-slate-400 mr-2">Popular:</span>
             {["Payroll", "Compliance", "HR", "Benefits", "Guides"].map(tag => (
               <button key={tag} onClick={() => { setActiveFilter(tag); setCardsToShow(9); document.getElementById('grid')?.scrollIntoView({behavior: 'smooth'}) }} className="text-xs font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors">
                  {tag}
               </button>
             ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 - FEATURED ARTICLE */}
      <section className="py-24 bg-white relative -mt-10 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div onClick={() => router.push('/blog/how-to-run-payroll-in-california')} className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row group hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-shadow duration-300 cursor-pointer">
              
              <div className="md:w-[55%] p-8 lg:p-14 flex flex-col justify-center">
                 <div className="text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded w-max mb-6">Payroll</div>
                 <h2 className="text-3xl md:text-[32px] font-black text-[#0A1628] mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                   The State of US Payroll 2026: Consolidation is the New Standard
                 </h2>
                 <p className="text-slate-500 text-lg mb-8 line-clamp-3 leading-relaxed">
                   Why 85% of mid-market companies are abandoning disparate point solutions and moving towards unified HRIS and Payroll systems to fight inflation and reduce compliance risks.
                 </p>
                 
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">EM</div>
                    <div>
                       <div className="text-sm font-bold text-slate-900">Emily M.</div>
                       <div className="text-xs text-slate-500">Oct 14, 2026 &middot; 10 min read</div>
                    </div>
                 </div>

                 <div className="text-blue-600 font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform w-max">
                   Read article <span className="text-cyan-500">&rarr;</span>
                 </div>
              </div>

              <div className="md:w-[45%] bg-slate-100 relative overflow-hidden flex items-center justify-center aspect-video md:aspect-auto">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                 {/* Decorative Image area zooming on hover */}
                 <div className="relative z-10 w-full h-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                    <div className="w-32 h-32 rounded-3xl bg-white shadow-xl flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                       <span className="text-6xl">💸</span>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </section>

      {/* SECTION 3 & 4 - FILTER & GRID */}
      <section id="grid" className="py-16 bg-white scroll-mt-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           
           {/* CATEGORY FILTER */}
           <div className="flex flex-nowrap overflow-x-auto hide-scrollbar gap-2 md:gap-3 py-4 mb-2 border-b border-slate-100 justify-start md:justify-center">
              {categories.map(cat => (
                 <button
                    key={cat}
                    onClick={() => { setActiveFilter(cat); setCardsToShow(9); }}
                    className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                       activeFilter === cat 
                       ? "bg-blue-600 text-white shadow-md" 
                       : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                 >
                    {cat}
                 </button>
              ))}
           </div>
           
           <div className="text-center mb-10 text-sm font-medium text-slate-500">
             Showing {filteredArticles.length} {activeFilter !== "All" ? activeFilter : "total"} articles
           </div>

           {/* ARTICLE GRID */}
           <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                 {visibleArticles.map((article) => (
                    <motion.div
                       key={article.id}
                       layout
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       transition={{ duration: 0.3 }}
                       onClick={() => router.push('/blog/how-to-run-payroll-in-california')}
                       className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                    >
                       {/* Image Area */}
                       <div className="w-full aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100 tracking-tighter">
                          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] font-black uppercase text-blue-700 tracking-wider shadow-sm">
                            {article.cat}
                          </div>
                          <div className="w-full h-full bg-slate-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-5xl opacity-50 relative pointer-events-none">
                             {article.cat === "Payroll" && "💸"}
                             {article.cat === "Compliance" && "🛡️"}
                             {article.cat === "Hiring" && "🎯"}
                             {article.cat === "Benefits" && "🏥"}
                             {article.cat === "State Guides" && "🗺️"}
                             {article.cat === "HR" && "📁"}
                             {article.cat === "Templates" && "📝"}
                             
                             <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                          </div>
                       </div>
                       
                       {/* Body */}
                       <div className="p-6 flex flex-col flex-1 relative bg-white z-10">
                          <h3 className="text-lg font-bold text-[#0A1628] leading-snug mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                            {article.excerpt}
                          </p>
                          
                          <div className="mt-auto flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                                {article.author.split(' ').map(n=>n[0]).join('')}
                             </div>
                             <div className="text-xs text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                <span className="text-slate-700 font-bold pr-1">{article.author}</span>
                                &middot; {article.date} &middot; {article.time}
                             </div>
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </motion.div>

           {filteredArticles.length > cardsToShow && (
             <div className="mt-16 text-center">
                <button onClick={() => setCardsToShow(prev => prev + 6)} className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                   Load more articles
                </button>
             </div>
           )}

           {filteredArticles.length === 0 && (
             <div className="text-center py-20 text-slate-500 font-medium">
                No articles found in this category right now.
             </div>
           )}

        </div>
      </section>

      {/* SECTION 5 - NEWSLETTER SIGNUP */}
      <section className="py-24 bg-slate-50">
         <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl md:text-4xl font-black text-[#0A1628] mb-4">Get HR & payroll insights every week.</h3>
            <p className="text-slate-500 mb-10 text-lg">Join 20,000+ HR professionals staying ahead of the curve. Unsubscribe anytime.</p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-4" onSubmit={e=>e.preventDefault()}>
               <input type="email" placeholder="work@company.com" required className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium text-slate-900" />
               <button type="submit" className="bg-blue-600 text-white font-bold rounded-xl px-8 py-3 hover:bg-blue-700 transition-colors shadow-md">
                  Subscribe
               </button>
            </form>
            
            <div className="text-slate-400 text-xs font-medium flex items-center gap-1 justify-center">
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg> 
               No spam. Ever. We promise.
            </div>
         </div>
      </section>

      {/* SECTION 6 - MOST POPULAR */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <h3 className="text-2xl font-black text-[#0A1628] mb-10">Most-read this month</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { rank: 1, cat: "Templates", title: "Employee Handbook Template (2026 Edition)" },
                { rank: 2, cat: "Compliance", title: "FLSA Overtime Rule Changes Explained Safely" },
                { rank: 3, cat: "Payroll", title: "How to Switch Payroll Providers Mid-Year" }
              ].map((pop) => (
                 <div key={pop.rank} onClick={() => router.push('/blog/how-to-run-payroll-in-california')} className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex items-start gap-4 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                    <div className="text-6xl font-black text-blue-600 opacity-10 absolute -top-2 -right-2 transform group-hover:scale-110 transition-transform">{pop.rank}</div>
                    <div className="relative z-10 flex-1">
                       <div className="bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex w-max mb-3">
                         {pop.cat}
                       </div>
                       <h4 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors pr-6">
                         {pop.title}
                       </h4>
                       <div className="mt-4 text-cyan-600 font-bold text-sm">Read &rarr;</div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
