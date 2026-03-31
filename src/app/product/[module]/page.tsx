import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, ChevronRight, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { MODULE_DATA, ModuleData } from "./moduleData"; // we'll split data to another file
import InteractiveMockup from "@/components/InteractiveMockup";
import FeatureVisual from "@/components/FeatureVisual";

export function generateStaticParams() {
  return Object.keys(MODULE_DATA).map((slug) => ({ module: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const { module } = await params;
  const mod = MODULE_DATA[module as keyof typeof MODULE_DATA];
  if (!mod) return { title: "Not Found" };
  
  return {
    title: `${mod.name} | CircleWorks`,
    description: mod.hero.headline,
  };
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const modKey = module as keyof typeof MODULE_DATA;
  const mod = MODULE_DATA[modKey];

  if (!mod) {
    notFound();
  }

  // Accent combinations mapping based on the module's accent string
  const accentClasses = {
    blue: { bg: "bg-blue-600", text: "text-blue-600", gradFrom: "from-blue-600", gradTo: "to-cyan-400", lightBg: "bg-blue-50" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-500", gradFrom: "from-emerald-500", gradTo: "to-teal-400", lightBg: "bg-emerald-50" },
    purple: { bg: "bg-purple-600", text: "text-purple-600", gradFrom: "from-purple-600", gradTo: "to-fuchsia-400", lightBg: "bg-purple-50" },
    green: { bg: "bg-green-500", text: "text-green-500", gradFrom: "from-green-500", gradTo: "to-emerald-400", lightBg: "bg-green-50" },
    orange: { bg: "bg-orange-500", text: "text-orange-500", gradFrom: "from-orange-500", gradTo: "to-amber-400", lightBg: "bg-orange-50" },
    rose: { bg: "bg-rose-500", text: "text-rose-500", gradFrom: "from-rose-500", gradTo: "to-pink-400", lightBg: "bg-rose-50" },
    cyan: { bg: "bg-cyan-500", text: "text-cyan-500", gradFrom: "from-cyan-500", gradTo: "to-blue-400", lightBg: "bg-cyan-50" },
    red: { bg: "bg-red-500", text: "text-red-500", gradFrom: "from-red-500", gradTo: "to-rose-400", lightBg: "bg-red-50" },
    fuchsia: { bg: "bg-fuchsia-500", text: "text-fuchsia-500", gradFrom: "from-fuchsia-500", gradTo: "to-purple-400", lightBg: "bg-fuchsia-50" },
    indigo: { bg: "bg-indigo-600", text: "text-indigo-600", gradFrom: "from-indigo-600", gradTo: "to-blue-400", lightBg: "bg-indigo-50" }
  };

  const accent = accentClasses[mod.accent as keyof typeof accentClasses] || accentClasses.blue;

  return (
    <main className={`min-h-screen bg-white font-sans selection:bg-${mod.accent}-200 selection:text-navy`}>
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className={"relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden"}>
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] ${accent.bg} rounded-full blur-[150px] mix-blend-screen opacity-20`} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <span className={`text-sm uppercase tracking-widest font-bold mb-4 block ${accent.text}`}>
                CircleWorks {mod.name}
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-[72px] font-black text-white leading-[1.05] tracking-tight mb-6">
                {mod.hero.headline}
              </h1>
              <p className="text-xl text-slate-300 font-medium mb-10 max-w-2xl mx-auto lg:mx-0">
                {mod.hero.stat}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="#trial" className={`px-8 py-4 rounded-full bg-gradient-to-r ${accent.gradFrom} ${accent.gradTo} text-white font-bold text-[16px] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-shadow`}>
                  Start with {mod.name} Free
                </Link>
                <Link href="#how-it-works" className="px-8 py-4 rounded-full text-white font-bold text-[16px] hover:bg-white/10 transition-colors">
                  See how it works &darr;
                </Link>
              </div>
            </div>

            {/* Browser Mockup Visual */}
            <div className="flex-1 w-full max-w-lg lg:max-w-xl perspective-1000">
               <InteractiveMockup 
                  moduleName={mod.name} 
                  initialTab={
                    modKey === 'payroll' ? 'payroll' : 
                    modKey === 'hris' ? 'employees' : 
                    modKey === 'ats' ? 'hiring' : 
                    modKey === 'benefits' ? 'benefits' : 
                    modKey === 'compliance' ? 'compliance' : 
                    'dashboard'
                  } 
               />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SOCIAL PROOF (TESTIMONIALS) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Trusted by 5,000+ HR Teams using {mod.name}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mod.testimonials.map((test, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="flex text-amber-400 mb-4">{"★".repeat(5)}</div>
                <p className="text-slate-700 font-medium mb-6 flex-1 italic">"{test.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${accent.bg} text-white font-bold flex items-center justify-center text-sm`}>
                    {test.author[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{test.author}</div>
                    <div className="text-slate-500 text-xs">{test.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <span className={`text-sm uppercase tracking-widest font-bold mb-3 block ${accent.text}`}>Workflow</span>
             <h2 className="text-4xl lg:text-5xl font-black text-slate-900">How {mod.name} works.</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-[60px] left-1/6 right-1/6 h-0.5 bg-slate-200 z-0" />
              {mod.howItWorks.map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center">
                   <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white ${accent.bg} border-8 border-white shadow-xl mb-6`}>
                     {i + 1}
                   </div>
                   <h4 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h4>
                   <p className="text-slate-600 font-medium text-lg leading-relaxed">{step.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. FEATURE DEEP DIVE */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        {mod.features.map((feature, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div key={idx} className="mb-24 last:mb-0">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className={`flex flex-col lg:flex-row items-center gap-16 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                    
                    <div className="flex-1 w-full">
                      <h3 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 leading-tight">{feature.headline}</h3>
                      <p className="text-xl text-slate-600 mb-8">{feature.description}</p>
                      <ul className="space-y-4">
                        {feature.bullets.map((bull, j) => (
                           <li key={j} className="flex items-start gap-4">
                             <Check className={`${accent.text} mt-1 shrink-0`} size={24} strokeWidth={3} />
                             <span className="text-lg text-slate-700 font-medium">{bull}</span>
                           </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex-1 w-full">
                       <FeatureVisual headline={feature.headline} accent={accent.bg} accentBg={accent.bg} />
                    </div>
                    
                 </div>
               </div>
            </div>
          )
        })}
      </section>

      {/* 5. COMPLIANCE NOTE */}
      {mod.complianceNote && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`rounded-3xl p-10 border-2 ${accent.bg} border-opacity-20 ${accent.lightBg} relative overflow-hidden`}>
               <ShieldCheck size={120} className={`absolute -right-10 -bottom-10 opacity-10 ${accent.text}`} />
               <h3 className={`text-2xl font-black ${accent.text} mb-4 flex items-center gap-3`}>
                 <ShieldCheck size={28} /> Built-in USA Compliance
               </h3>
               <p className="text-slate-800 text-lg font-medium leading-relaxed">
                 {mod.complianceNote}
               </p>
            </div>
          </div>
        </section>
      )}

      {/* 6. INTEGRATION CALLOUT */}
      <section className="py-24 bg-[#0A1628] text-white overflow-hidden relative">
         <div className={`absolute top-0 right-0 w-[400px] h-[400px] ${accent.bg} rounded-full blur-[120px] mix-blend-screen opacity-20`} />
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
           <Zap className={`mx-auto mb-6 ${accent.text}`} size={48} />
           <h2 className="text-3xl md:text-5xl font-black mb-8">Works with the apps you already use.</h2>
           <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">Seamlessly connects your {mod.name} workflows via two-way sync.</p>
           
           <div className="flex flex-wrap justify-center gap-4 text-xl font-bold">
             {mod.integrations.map((int, i) => (
                <span key={i} className="px-6 py-3 rounded-full bg-white/10 border border-white/20">
                  {int}
                </span>
             ))}
           </div>
         </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-4xl font-black text-slate-900">FAQ on {mod.name}</h2>
           </div>
           
           <div className="space-y-6">
             {mod.faqs.map((faq, i) => (
               <details key={i} className={`group border border-slate-200 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden ${accent.lightBg} bg-opacity-30`}>
                 <summary className="flex items-center justify-between p-6 cursor-pointer text-xl font-bold text-slate-900">
                   {faq.q}
                   <ChevronRight className="transition-transform group-open:rotate-90 text-slate-400" size={24} />
                 </summary>
                 <div className="px-6 pb-6 text-lg text-slate-600 bg-white">
                   <p className="border-t border-slate-100 pt-4 mt-2">{faq.a}</p>
                 </div>
               </details>
             ))}
           </div>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="py-32 bg-slate-50 relative overflow-hidden border-t border-slate-200">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className={`text-5xl font-black mb-6 ${accent.text}`}>
               Ready to upgrade your {mod.name}?
            </h2>
            <p className="text-2xl text-slate-700 font-medium mb-12">
               Take 4 minutes to set up. Get lifetime peace of mind.
            </p>
            <Link href="/signup" className={`inline-block px-12 py-5 rounded-full bg-gradient-to-r ${accent.gradFrom} ${accent.gradTo} text-white font-bold text-xl hover:scale-105 transition-transform shadow-[0_10px_40px_rgba(0,0,0,0.15)]`}>
              Start with {mod.name} Free
            </Link>
         </div>
      </section>

      <Footer />
    </main>
  );
}
