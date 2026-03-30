import { Metadata } from "next";
import { stateGuides } from "@/data/states";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ResourceCTA from "@/components/ResourceCTA";
import Link from "next/link";
import { redirect } from "next/navigation";

// Define Props Type
interface Props {
  params: Promise<{ "state-name": string }>;
}

export async function generateStaticParams() {
  return stateGuides.map((state) => ({
    "state-name": state.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { "state-name": id } = await params;
  const state = stateGuides.find((s) => s.id === id);
  if (!state) return { title: "State Tax Guide | CircleWorks" };

  return {
    title: `${state.name} Payroll Tax Guide 2026 | CircleWorks`,
    description: `Learn payroll taxes, employer rules, and compliance requirements in ${state.name}. Everything from SUI to minimum wage.`,
  };
}

export default async function StateDetailPage({ params }: Props) {
  const { "state-name": id } = await params;
  const state = stateGuides.find((s) => s.id === id);

  if (!state) {
    redirect("/resources/state-tax-guides");
  }

  return (
    <main className="min-h-screen bg-[#060B13] font-sans selection:bg-cyan-200 selection:text-navy text-white">
      <Navbar />

      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-28 overflow-hidden z-10 border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[1000px] h-[1000px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-12 flex justify-start">
             <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Resources", href: "/guides" }, { label: "State Tax Guides", href: "/resources/state-tax-guides" }, { label: state.name }]} variant="dark" />
          </div>

          <div className="lg:w-2/3">
             <div className="inline-flex items-center gap-2 bg-white/5 text-cyan-400 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-8">
               2026 OFFICIAL GUIDE • {state.id.toUpperCase()}
             </div>
             <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-8">
               {state.name} <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Payroll Guide.</span>
             </h1>
             <p className="text-xl text-slate-400 leading-relaxed font-medium mb-10 max-w-2xl">
               {state.summary} Complete employer and employee tax breakdown for businesses operating in the state of {state.name}.
             </p>

             <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">MIN WAGE</span>
                   <span className="text-white font-bold text-lg">{state.minWage}</span>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">TAX TYPE</span>
                   <span className="text-white font-bold text-lg">{state.taxType}</span>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">LOCAL TAX</span>
                   <span className={`font-bold text-lg ${state.localTax ? "text-cyan-400" : "text-white"}`}>{state.localTax ? "Surcharge Applies" : "No Local Surcharge"}</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-24">
               {/* 1. Tax OverView */}
               <div id="overview">
                  <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                     <span className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-lg">📈</span>
                     Tax Overview
                  </h2>
                  <div className="bg-[#0A1628] border border-white/5 rounded-[40px] p-10 lg:p-14">
                      <div className="grid md:grid-cols-2 gap-12">
                         <div>
                            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">State Income Tax</h4>
                            <p className="text-3xl font-black text-white mb-4">{state.taxRates}</p>
                            <p className="text-slate-400 font-medium leading-relaxed">
                              {state.taxType === "None" 
                                ? "This state has no state income tax for individuals, though other employer taxes still apply." 
                                : `This is a ${state.taxType} tax state, meaning tax calculations are ${state.taxType === "Flat" ? "consistent across all income levels." : "tiered based on the employee's total annual earnings."}`}
                            </p>
                         </div>
                         <div className="bg-white/5 rounded-3xl p-8 border border-white/5">
                            <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-6">Expert Note</h4>
                            <p className="text-slate-300 text-sm leading-relaxed font-medium">
                               {state.notes} CircleWorks handles these calculations automatically based on your employees&apos; home addresses.
                            </p>
                         </div>
                      </div>
                  </div>
               </div>

               {/* 2. Employer Taxes */}
               <div id="employer">
                  <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                     <span className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-lg">🏢</span>
                     Employer Taxes
                  </h2>
                  <div className="bg-[#0A1628] border border-white/5 rounded-[40px] p-10 lg:p-14">
                      <div className="space-y-10">
                         <div className="flex items-start gap-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                            <div>
                               <h4 className="text-xl font-bold text-white mb-2">Unemployment Insurance (SUI/SUTA)</h4>
                               <p className="text-slate-400 font-medium leading-relaxed mb-4">{state.employerTax}</p>
                               <p className="text-xs text-slate-500 font-mono italic">
                                 * Exact rates vary based on your company&apos;s experience rating and state-assigned bracket.
                               </p>
                            </div>
                         </div>
                         <div className="h-px bg-white/5" />
                         <div className="flex items-start gap-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                            <div>
                               <h4 className="text-xl font-bold text-white mb-2">Social Security & Medicare (Federal)</h4>
                               <p className="text-slate-400 font-medium leading-relaxed">CircleWorks handles the mandatory 6.2% FICA (Social Security) and 1.45% Medicare employer matches natively.</p>
                            </div>
                         </div>
                      </div>
                  </div>
               </div>

               {/* 3. Filing Requirements */}
               <div id="filing">
                  <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                     <span className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-lg">📅</span>
                     Filing Requirements
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="bg-[#0A1628] border border-white/5 rounded-[32px] p-10 group hover:border-indigo-500/30 transition-all">
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Standard Frequency</h4>
                        <p className="text-4xl font-black text-white mb-4">{state.filingFrequency}</p>
                        <p className="text-slate-500 text-sm font-medium">Filing frequency may increase if your total tax liability exceeds state-defined thresholds.</p>
                     </div>
                     <div className="bg-[#0A1628] border border-white/5 rounded-[32px] p-10 group hover:border-indigo-500/30 transition-all">
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Deadlines</h4>
                        <p className="text-lg font-bold text-white mb-4 leading-snug">{state.deadlines}</p>
                        <p className="text-slate-500 text-sm font-medium">CircleWorks manages these deadlines to ensure zero late fees or penalties for your business.</p>
                     </div>
                  </div>
               </div>

               {/* 4. Compliance Tips */}
               <div id="tips">
                  <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                     <span className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-lg">💡</span>
                     Compliance Tips
                  </h2>
                  <div className="bg-gradient-to-br from-orange-400/5 to-cyan-400/5 border border-white/5 rounded-[40px] p-10 lg:p-14">
                      <div className="grid md:grid-cols-2 gap-8">
                         {state.complianceTips.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                               <div className="w-6 h-6 rounded-full bg-orange-400/20 text-orange-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{idx + 1}</div>
                               <p className="text-slate-300 font-medium leading-relaxed">{tip}</p>
                            </div>
                         ))}
                      </div>
                  </div>
               </div>
            </div>

            <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
               <div className="bg-white rounded-[32px] p-10 text-[#0A1628] shadow-2xl space-y-8">
                  <div className="text-center pb-8 border-b border-slate-100">
                     <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">NEED STATE NEXUS?</h4>
                     <p className="text-2xl font-black mb-8 leading-tight">Scale to all 50 states without the paperwork.</p>
                     <Link href="/pricing" className="block w-full py-4 bg-[#0A1628] text-white font-black rounded-xl hover:scale-105 transition-all text-center">Get Started Free</Link>
                  </div>
                  
                  <div className="space-y-6">
                     <h5 className="font-black text-xs uppercase tracking-widest">Guide Quick Links</h5>
                     <nav className="flex flex-col gap-4">
                        <Link href="#overview" className="text-slate-500 font-bold hover:text-[#0A1628] transition-colors leading-none flex items-center justify-between group">
                          Tax Overview <span className="opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                        </Link>
                        <Link href="#employer" className="text-slate-500 font-bold hover:text-[#0A1628] transition-colors leading-none flex items-center justify-between group">
                          Employer Taxes <span className="opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                        </Link>
                        <Link href="#filing" className="text-slate-500 font-bold hover:text-[#0A1628] transition-colors leading-none flex items-center justify-between group">
                          Filing Timeline <span className="opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                        </Link>
                        <Link href="#tips" className="text-slate-500 font-bold hover:text-[#0A1628] transition-colors leading-none flex items-center justify-between group">
                          Compliance Checklist <span className="opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                        </Link>
                     </nav>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">AI</div>
                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-400">Compliance AI</span>
                     </div>
                     <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        CircleWorks monitors {state.name} tax updates daily. Our system automatically triggers UI notifications if your employee&apos;s address requires new state nexus registrations.
                     </p>
                  </div>
               </div>
            </aside>
         </div>
      </section>

      <ResourceCTA 
         title={`Native ${state.name} Payroll.`} 
         description={`Run payroll for your ${state.name} employees with perfect tax accuracy and automated filing. CircleWorks handles the state-specific complexities for you.`}
      />

      <Footer />
    </main>
  );
}
