"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { categories, generateSlug, integrations } from "@/data/integrations";





export default function IntegrationsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIntegrations = integrations.filter((int) => {
    const matchesCat = activeFilter === "All" || int.cat === activeFilter;
    const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featuredIntegrations = integrations.filter((int) => ["QuickBooks", "Slack", "Okta"].includes(int.name));

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      {/* SECTION 1 - HERO */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden text-center z-10 border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          
          <h1 className="text-4xl md:text-5xl lg:text-[64px] font-black text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto">
            Connect CircleWorks to your entire stack
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            50+ integrations. No manual data entry. Zero re-keying.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <a href="#grid" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10 shadow-lg cursor-pointer">
              Browse Integrations <span className="ml-2 animate-bounce inline-block">&darr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 2 - FEATURED INTEGRATIONS */}
      <section className="py-24 bg-white relative z-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-[#0A1628] tracking-tight mb-12 text-center">Featured Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredIntegrations.map((int) => (
              <Link href={`/integrations/${generateSlug(int.name)}`} key={int.id} className="block group">
                <div className="bg-gradient-to-br w-full h-full from-blue-50 to-white rounded-3xl p-8 border border-blue-100 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-2xl font-black text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                      {int.logo}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#0A1628] leading-tight">{int.name}</h3>
                      <div className="text-blue-600 text-sm font-bold uppercase tracking-wider">{int.cat}</div>
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {int.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 - FILTER + GRID */}
      <section id="grid" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-[#0A1628] tracking-tight">All Integrations</h2>
              <div className="relative max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
           </div>
           
           {/* CATEGORY FILTER */}
           <div className="flex flex-nowrap overflow-x-auto hide-scrollbar gap-2 md:gap-3 pb-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map(cat => (
                 <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                       activeFilter === cat 
                       ? "bg-blue-600 text-white shadow-md transform scale-105" 
                       : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                 >
                    {cat}
                 </button>
              ))}
           </div>

           <div className="text-slate-400 font-medium text-sm mb-10">
             Showing {filteredIntegrations.length} integrations
           </div>

           {/* INTEGRATION GRID: 4 desktop, 3 tablet, 2 mobile */}
           <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-4 sm:gap-6">
              <AnimatePresence mode="popLayout">
                 {filteredIntegrations.map((int) => (
                    <Link href={`/integrations/${generateSlug(int.name)}`} key={int.id} className="block h-full group">
                    <motion.div
                       layout
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       transition={{ duration: 0.2 }}
                       className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 h-full"
                    >
                       <div className="flex items-start justify-between mb-4">
                          <div className="w-[64px] h-[64px] bg-slate-50 rounded-xl flex items-center justify-center font-black text-xl text-slate-300 grayscale group-hover:grayscale-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300 shadow-sm border border-slate-100">
                             {int.logo}
                          </div>
                       </div>
                       
                       <h3 className="text-[18px] font-bold text-[#0A1628] leading-snug mb-1.5 group-hover:text-blue-600 transition-colors">
                          {int.name}
                       </h3>
                       
                       <div className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded w-max mb-3">
                          {int.cat}
                       </div>
                       
                       <p className="text-slate-500 text-[14px] leading-relaxed mb-6 line-clamp-1 flex-1">
                          {int.desc}
                       </p>

                       <div className="mt-auto pt-4 border-t border-slate-100 w-full">
                         <button className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
                            int.status === 'Live' ? 'bg-slate-50 text-slate-700 hover:bg-blue-600 hover:text-white border border-slate-200 group-hover:border-blue-600' : 'bg-slate-50 text-slate-400'
                         }`}>
                           {int.status === 'Connected' ? 'Connected' : 'Connect'}
                         </button>
                       </div>
                    </motion.div>
                    </Link>
                 ))}
              </AnimatePresence>
           </motion.div>

           {filteredIntegrations.length === 0 && (
             <div className="text-center py-20 text-slate-500 font-medium bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                No integrations found matching your criteria.
             </div>
           )}

        </div>
      </section>

      {/* SECTION 4 - API SECTION */}
      <section id="api" className="py-24 bg-slate-50 border-y border-slate-200 scroll-mt-10 overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
               
               {/* Left Content */}
               <div className="lg:w-1/2">
                  <h2 className="text-3xl md:text-4xl font-black text-[#0A1628] mb-4 tracking-tight">Build your own integration</h2>
                  <p className="text-lg text-slate-500 mb-10">We provide a full REST API and webhooks to connect any custom tool directly into CircleWorks.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                     <button className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md">
                        API Documentation &rarr;
                     </button>
                     <Link href="https://github.com/circleworks/api" target="_blank" className="bg-white text-slate-600 font-bold px-6 py-3 rounded-xl hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors shadow-sm flex items-center justify-center gap-2">
                        <span>GitHub</span>
                     </Link>
                  </div>
               </div>

               {/* Right Content - Code Snippet */}
               <div className="lg:w-1/2 w-full relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl rounded-[2rem] -z-10" />
                  <div className="bg-[#0A1628] rounded-2xl p-6 shadow-2xl border border-slate-800 relative z-10 font-mono text-sm leading-relaxed overflow-x-auto">
                     <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <div className="ml-4 text-xs font-sans text-slate-500 font-bold uppercase tracking-widest">fetch_integrations.sh</div>
                     </div>
                     <div className="text-blue-400">GET <span className="text-white">/v1/integrations</span></div>
                     <div className="text-cyan-300">Authorization: <span className="text-emerald-300">Bearer {'{api_key}'}</span></div>
                     <div className="mt-4 text-slate-500">→ 200 OK</div>
                  </div>
               </div>
               
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
