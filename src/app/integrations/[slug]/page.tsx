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

export default async function IntegrationDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const integration = integrations.find(int => generateSlug(int.name) === slug);

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
                    <div className="w-16 h-16 rounded-2xl bg-[#0A1628] flex items-center justify-center shadow-lg border border-slate-100 flex-shrink-0">
                      <div className="text-white font-black text-xl">CW</div>
                    </div>
                    <div className="text-slate-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14m-7-7h14"/></svg>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center shadow-sm border border-slate-200 flex-shrink-0">
                      <span className="text-2xl font-black text-slate-400">{integration.logo}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded w-max">
                      {integration.cat}
                    </span>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded flex items-center gap-1.5 w-max">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-[#0A1628] tracking-tight mb-6">
                Connect CircleWorks and {integration.name}
              </h1>
              
              <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                {integration.desc} Use this integration to streamline your workflow and eliminate manual data entry.
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
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 font-black flex items-center justify-center border-2 border-slate-200">1</div>
                      <div className="w-0.5 h-full bg-slate-100 mt-2"></div>
                    </div>
                    <div className="pb-8">
                      <h3 className="text-lg font-bold text-[#0A1628] mb-2">Find {integration.name}</h3>
                      <p className="text-slate-500 font-medium">Log into CircleWorks, navigate to Settings &gt; Integrations, and search for {integration.name}.</p>
                      <div className="mt-4 bg-slate-100 border border-slate-200 rounded-xl w-full h-32 flex items-center justify-center text-slate-400 font-bold text-sm">Screenshot placeholder</div>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shadow-md">2</div>
                      <div className="w-0.5 h-full bg-slate-100 mt-2"></div>
                    </div>
                    <div className="pb-8">
                      <h3 className="text-lg font-bold text-[#0A1628] mb-2">Authorize Connection</h3>
                      <p className="text-slate-500 font-medium">Click &quot;Connect&quot;, log into your {integration.name} account, and authorize the requested permissions.</p>
                      <div className="mt-4 bg-slate-100 border border-slate-200 rounded-xl w-full h-32 flex items-center justify-center text-slate-400 font-bold text-sm">Screenshot placeholder</div>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 font-black flex items-center justify-center border-2 border-slate-200">3</div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0A1628] mb-2">Configure Settings</h3>
                      <p className="text-slate-500 font-medium">Map your fields and define your sync frequency. Click save, and your integration is ready.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COL: Sidebar */}
          <div className="lg:w-1/3 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 sticky top-32">
              <Link href="/signup" className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-center rounded-xl transition-colors shadow-md shadow-blue-600/20 mb-4">
                Connect Now
              </Link>
              <Link href="/contact" className="block w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-center rounded-xl border border-slate-200 transition-colors">
                Talk to Sales
              </Link>

              <hr className="my-8 border-slate-100" />

              <div className="space-y-6">
                <div>
                  <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Requirements</div>
                  <div className="text-slate-700 font-bold flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Requires Pro or Enterprise plan
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Categories</div>
                  <div className="bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded w-max">
                    {integration.cat}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Developer</div>
                  <div className="text-slate-700 font-bold flex items-center gap-2">
                    CircleWorks Partner Team
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Documentation</div>
                  <Link href="#" className="text-blue-600 font-bold flex items-center gap-2 hover:underline">
                    View Integration Guide &rarr;
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-[#0A1628] rounded-3xl p-8 shadow-xl text-white">
              <h3 className="text-xl font-black mb-2">Need help?</h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-6 font-medium">Our implementation team can set up your integrations for you during onboarding.</p>
              <button className="bg-white text-[#0A1628] font-bold px-6 py-2.5 rounded-xl text-sm hover:scale-105 transition-transform w-full shadow-lg">
                View Onboarding Plans
              </button>
            </div>
          </div>

        </div>

        {/* RELATED INTEGRATIONS */}
        <div className="mt-24 pt-16 border-t border-slate-200">
          <h2 className="text-3xl font-black text-[#0A1628] tracking-tight mb-8">Related Integrations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(int => (
               <Link href={`/integrations/${generateSlug(int.name)}`} key={int.id} className="block group h-full">
                 <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 h-full">
                    <div className="flex items-start justify-between mb-4">
                       <div className="w-[48px] h-[48px] bg-slate-50 rounded-xl flex items-center justify-center font-black text-lg text-slate-300 grayscale group-hover:grayscale-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300 shadow-sm border border-slate-100">
                          {int.logo}
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
            ))}
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
