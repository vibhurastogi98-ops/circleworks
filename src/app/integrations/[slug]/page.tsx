import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { integrations, generateSlug } from "@/data/integrations";

// Generate static routing params for all integrations build
export async function generateStaticParams() {
  return integrations.map((integration) => ({
    slug: generateSlug(integration.name),
  }));
}

import FeatureVisual from "@/components/FeatureVisual";
import { 
  ArrowUpRight, Clock, Rocket, ShieldCheck, Landmark, MessageSquare, Globe, 
  FileCheck, FileText, Heart, Activity, CreditCard, Zap, ShoppingBag, Terminal
} from "lucide-react";

export default async function IntegrationDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  // Find integration, supporting aliases for common shorthand slugs
  const integration = integrations.find(int => {
    const currentSlug = generateSlug(int.name);
    if (currentSlug === slug) return true;
    
    // Alias support
    if (slug === "guideline" && currentSlug === "guideline-401-k") return true;
    if (slug === "google" && currentSlug === "google-workspace") return true;
    
    return false;
  });

  if (!integration) {
    notFound();
  }

  // Related integrations (just pick first 4 in same category or overall)
  const related = integrations
    .filter(int => int.id !== integration.id && int.cat === integration.cat)
    .slice(0, 4);

  // If not enough in category, backfill
  if (related.length < 4) {
    const additional = integrations
      .filter(int => int.id !== integration.id && !related.find(r => r.id === int.id))
      .slice(0, 4 - related.length);
    related.push(...additional);
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar forceLight />

      <div className="pt-24 lg:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-8 mt-4">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/integrations" className="hover:text-blue-600 transition-colors">Integrations</Link>
          <span>/</span>
          <span className="text-slate-600">{integration.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT COL: Main Content */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-slate-200 mb-10">
              {/* Logo Lockup */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-3xl bg-[#0A1628] flex items-center justify-center shadow-xl border border-white/10 flex-shrink-0">
                       <Rocket size={40} className="text-white" />
                    </div>
                    <div className="text-slate-300">
                      <Zap size={24} className="animate-pulse text-blue-500" />
                    </div>
                    {(() => {
                      const IconMap: Record<string, any> = {
                        QuickBooks: Landmark,
                        Slack: MessageSquare,
                        Okta: ShieldCheck,
                        Xero: Landmark,
                        "Google Workspace": Globe,
                        "Microsoft Teams": MessageSquare,
                        "Guideline 401(k)": Heart,
                        "Human Interest": Heart,
                        Brex: CreditCard,
                        Ramp: CreditCard,
                        Greenhouse: Activity,
                        Lever: Activity,
                        Checkr: FileCheck,
                        Gusto: Zap,
                        SimplyInsured: ShieldCheck,
                        DocuSign: FileText,
                      };
                      const Icon = IconMap[integration.name] || Zap;
                      return (
                        <div 
                          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl border border-slate-100 flex-shrink-0 text-white"
                          style={{ backgroundColor: (integration as any).color || "#0A1628" }}
                        >
                          <Icon size={40} />
                        </div>
                      );
                    })()}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded w-max">
                        {integration.cat}
                      </span>
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded flex items-center gap-1.5 w-max">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-400">Official Partner Integration</div>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-[#0A1628] tracking-tight mb-6">
                Connect CircleWorks and {integration.name}
              </h1>
              
              <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                {integration.desc} Use this integration to streamline your workflow and eliminate manual data entry. Built by CircleWorks in collaboration with {integration.name}.
              </p>

              {/* Benefits */}
              <div className="mb-12">
                <h2 className="text-2xl font-black text-[#0A1628] mb-6 tracking-tight">Benefits</h2>
                <ul className="space-y-4">
                  {[
                    `Automatically sync data between CircleWorks and ${integration.name}.`,
                    `Eliminate manual data entry and reduce human error.`,
                    `Keep your systems of record perfectly aligned in real-time.`,
                    `Unlock deeper reporting by combining payroll and ${integration.cat.toLowerCase()} data.`
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-slate-600 font-medium leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Setup Steps */}
              <div>
                <h2 className="text-2xl font-black text-[#0A1628] mb-6 tracking-tight">How to connect</h2>
                <div className="space-y-12">
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-white text-slate-900 font-black flex items-center justify-center border-2 border-slate-100 shadow-sm">1</div>
                      <div className="w-0.5 flex-1 bg-slate-100 my-4"></div>
                    </div>
                    <div className="pb-4 flex-1">
                      <h3 className="text-xl font-bold text-[#0A1628] mb-2">Find {integration.name}</h3>
                      <p className="text-slate-500 font-medium mb-6">Log into CircleWorks, navigate to Settings &gt; Integrations, and search for {integration.name}.</p>
                      <div className="max-w-2xl">
                         <FeatureVisual headline="Sync Data" accent="#2563eb" accentBg="bg-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shadow-lg shadow-blue-600/20">2</div>
                      <div className="w-0.5 flex-1 bg-slate-100 my-4"></div>
                    </div>
                    <div className="pb-4 flex-1">
                      <h3 className="text-xl font-bold text-[#0A1628] mb-2">Authorize Connection</h3>
                      <p className="text-slate-500 font-medium mb-6">Click &quot;Connect&quot;, log into your {integration.name} account, and authorize the requested permissions.</p>
                      <div className="max-w-2xl grayscale brightness-110 opacity-80 border-dashed border-2 border-slate-100 rounded-3xl p-1">
                         <FeatureVisual headline="Authorize Sync" accent="#2563eb" accentBg="bg-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-white text-slate-900 font-black flex items-center justify-center border-2 border-slate-100 shadow-sm">3</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#0A1628] mb-2">Configure Settings</h3>
                      <p className="text-slate-500 font-medium">Map your fields and define your sync frequency. Click save, and your integration is ready.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COL: Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                <div className="bg-[#0A1628] p-8 text-white relative">
                   <div className="relative z-10">
                      <h3 className="text-2xl font-black mb-2 tracking-tight">Need help?</h3>
                      <p className="text-blue-200 text-sm font-medium leading-relaxed opacity-80">
                         Our partnership team can assist with high-volume data migrations and custom API configurations.
                      </p>
                   </div>
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Rocket size={80} />
                   </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <Link href="/signup" className="flex items-center justify-center w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 group">
                      Connect Now
                      <ArrowUpRight size={18} className="ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                    <Link href="/contact" className="flex items-center justify-center w-full py-4 bg-slate-50 hover:bg-slate-100 text-[#0A1628] font-bold rounded-2xl border border-slate-200 transition-colors">
                      Talk to Sales
                    </Link>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-5">
                    <div>
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Requirements</div>
                      <div className="text-slate-900 font-bold flex items-center gap-2.5 text-sm">
                        <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                           <ShieldCheck size={14} strokeWidth={3} />
                        </div>
                        Requires Pro or Enterprise plan
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Categories</div>
                      <div className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg w-max shadow-sm border border-slate-100">
                        {integration.cat}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Integration Owner</div>
                      <div className="text-slate-900 font-bold flex items-center gap-2.5 text-sm">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-[10px] shrink-0 border border-emerald-100">
                           CW
                        </div>
                        CircleWorks Partner Team
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 text-sm leading-relaxed">Resources</div>
                      <Link href="#" className="group flex items-center gap-2 text-blue-600 font-bold text-sm">
                        View Integration Guide
                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-600/5 border border-blue-600/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-600 rounded-lg text-white">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0A1628] text-sm mb-1">Average Setup Time</h4>
                    <p className="text-slate-500 text-[13px] font-medium">Under 5 minutes for Standard accounts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RELATED INTEGRATIONS */}
        <div className="mt-24 pt-16 border-t border-slate-200">
          <h2 className="text-3xl font-black text-[#0A1628] tracking-tight mb-8">Related Integrations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(int => {
              const IconMap: Record<string, any> = {
                QuickBooks: Landmark,
                Slack: MessageSquare,
                Okta: ShieldCheck,
                Xero: Landmark,
                "Google Workspace": Globe,
                "Microsoft Teams": MessageSquare,
                "Guideline 401(k)": Heart,
                "Human Interest": Heart,
                Brex: CreditCard,
                Ramp: CreditCard,
                Greenhouse: Activity,
                Lever: Activity,
                Checkr: FileCheck,
                Gusto: Zap,
                SimplyInsured: ShieldCheck,
                DocuSign: FileText,
              };
              const Icon = IconMap[int.name] || Zap;

              return (
                <Link href={`/integrations/${generateSlug(int.name)}`} key={int.id} className="block group h-full">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 h-full">
                     <div className="flex items-start justify-between mb-4">
                        <div 
                          className="w-[48px] h-[48px] rounded-xl flex items-center justify-center text-white grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300 shadow-sm border border-slate-100"
                          style={{ backgroundColor: (int as any).color || "#0A1628" }}
                        >
                           <Icon size={24} />
                        </div>
                     </div>
                     
                     <h3 className="text-[16px] font-bold text-[#0A1628] leading-snug mb-1.5 group-hover:text-blue-600 transition-colors">
                        {int.name}
                     </h3>
                     
                     <div className="bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded w-max mb-3">
                        {int.cat}
                     </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
