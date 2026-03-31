import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { segments } from "./segmentData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InteractiveMockup from "@/components/InteractiveMockup";
import FeatureVisual from "@/components/FeatureVisual";
import { 
  ArrowRight, CheckCircle2, ChevronDown, 
  HelpCircle, MessageSquare, Quote, 
  ShieldCheck, Star, Zap 
} from "lucide-react";

export async function generateStaticParams() {
  return Object.keys(segments).map((segment) => ({
    segment,
  }));
}

export async function generateMetadata({ params }: { params: { segment: string } }): Promise<Metadata> {
  const { segment } = await params;
  const data = segments[segment];
  
  if (!data) return {};

  return {
    title: data.seoTitle,
    description: data.seoDesc,
    openGraph: {
      title: data.seoTitle,
      description: data.seoDesc,
      type: "website",
    },
  };
}

export default async function SegmentPage({ params }: { params: { segment: string } }) {
  const { segment } = await params;
  const data = segments[segment];

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-navy">
      <Navbar />

      {/* HERO SECTION */}
      <section className={`relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br ${data.heroGradient} text-white`}>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-widest">
                <Zap size={14} className="text-yellow-400" />
                Solutions for {segment}
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05]">
                {data.title}
              </h1>
              <p className="text-xl text-blue-100 font-medium leading-relaxed max-w-xl">
                {data.sub}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup" className="px-8 py-4 bg-white text-blue-600 font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-black/10 text-center">
                  {data.ctaHero}
                </Link>
                <Link href="#features" className="px-8 py-4 bg-blue-500/20 text-white border border-white/20 font-black rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm text-center">
                  {data.ctaSub}
                </Link>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-white/20 blur-3xl rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative aspect-[16/10] scale-110">
                <InteractiveMockup 
                    accent="#2563eb" 
                    initialTab={segment === "creators" || segment === "agencies" ? "payroll" : "dashboard"} 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 tracking-tight">
               Built for the unique challenges of {segment}
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.painPoints.map((point, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-6">{point.icon}</div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{point.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                 Everything you need to scale
              </h2>
              <p className="text-xl text-slate-500 font-medium">
                CircleWorks is the only platform that combines payroll, benefits, and HR with {segment}-specific automation.
              </p>
            </div>
            <div className="flex items-center gap-4 text-blue-600 font-black">
               Starting at $8/employee/month <ArrowRight size={20} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              {data.features.map((feature, i) => (
                 <div key={i} className="group flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                       {feature.icon || "✨"}
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {feature.name}
                       </h3>
                       <p className="text-slate-500 font-medium leading-relaxed">
                          {feature.description}
                       </p>
                    </div>
                 </div>
              ))}
            </div>

            <div className="sticky top-32">
               <FeatureVisual 
                  headline={data.features[0].name} 
                  accent="#2563eb" 
                  accentBg="bg-blue-600" 
               />
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-24 bg-[#0A1628] text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 p-32 opacity-10 blur-3xl bg-blue-500 rounded-full" />
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-10">
                  <div className="inline-flex gap-1">
                     {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="#fbbf24" className="text-yellow-400" />)}
                  </div>
                  <div className="relative">
                     <Quote size={48} className="absolute -top-12 -left-8 text-blue-500/20" />
                     <p className="text-3xl lg:text-4xl font-bold leading-tight italic">
                        &quot;{data.testimonial.quote}&quot;
                     </p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center font-black text-xl italic border-4 border-white/10 shadow-lg">
                        {data.testimonial.avatar}
                     </div>
                     <div>
                        <div className="text-lg font-black">{data.testimonial.author}</div>
                        <div className="text-blue-400 font-bold text-sm tracking-wide uppercase">{data.testimonial.role}</div>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => (
                     <div key={i} className="aspect-video bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="text-2xl font-black text-white/20">PARTNER_{i}</div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="text-4xl font-black text-slate-900 mb-12 text-center tracking-tight">Common Questions</h2>
           <div className="space-y-6">
              {data.faq.map((item, i) => (
                 <div key={i} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-3">
                       <HelpCircle size={20} className="text-blue-600" />
                       {item.q}
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed pl-8">
                       {item.a}
                    </p>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* PRICING CALLOUT CTA */}
      <section className="py-24 bg-blue-600 text-white text-center">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl lg:text-6xl font-black mb-8 tracking-tight italic">
               Starting at $8/employee/month
            </h2>
            <p className="text-xl text-blue-100 font-medium mb-12 max-w-2xl mx-auto">
               Ready to automate your {segment} payroll? Join thousands of companies using CircleWorks to run error-free payroll in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Link href="/signup" className="px-10 py-5 bg-white text-blue-600 font-black rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-blue-900/40 w-full sm:w-auto">
                 Create Your Account
               </Link>
               <Link href="/pricing" className="px-10 py-5 bg-blue-700 text-white font-black rounded-2xl hover:bg-blue-800 transition-all w-full sm:w-auto">
                 View Full Pricing
               </Link>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
