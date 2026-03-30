import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";


export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar forceLight />

      {/* HERO / MISSION - Full bleed dark section */}
      <section className="pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] relative overflow-hidden text-center text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-block bg-white/10 border border-white/20 text-blue-300 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
            Mission
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-[64px] font-black leading-[1.1] tracking-tight mb-6">
            Our mission is to eliminate the HR tax.
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
            US companies waste 12+ hours/week on HR admin. We fix that.
          </p>
        </div>
      </section>

      {/* PRESS LOGOS */}
      <section className="py-10 bg-slate-50 border-b border-slate-100 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">As featured in</div>
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* placeholders for logos */}
            <div className="font-black text-2xl text-slate-800 tracking-tighter">TechCrunch</div>
            <div className="font-serif font-bold text-2xl text-slate-800">Forbes</div>
            <div className="font-black text-2xl text-blue-600">SHRM</div>
            <div className="font-bold text-xl text-slate-800 uppercase tracking-widest">HR<span className="text-rose-500">Brew</span></div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-black text-[#0A1628] mb-6">The origin story</h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  CircleWorks started with a simple realization: the tools meant to help companies manage their people were actually holding them back.
                </p>
                <p>
                  Our founders, Sarah and David, experienced this first-hand while scaling their previous startup. They found themselves spending Sundays manually syncing payroll data across three different systems, tracking down elusive I-9 forms, and deciphering complex multi-state compliance laws.
                </p>
                <p>
                  We built CircleWorks to be the unified, automated, and compliance-first system that we wished we had. Today, we&apos;re building the infrastructure that powers the modern American workforce.
                </p>
              </div>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="aspect-[4/3] w-full bg-slate-100 rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-lg">
                  [ Team Photo Placeholder ]
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0A1628] mb-6">Our core values</h2>
            <p className="text-lg text-slate-500">The principles that guide every feature we build and every person we hire.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6">🇺🇸</div>
              <h3 className="text-xl font-bold text-[#0A1628] mb-3">USA-First</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Focused entirely on mastering the complexities of US multi-state payroll, tax, and labor laws.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6">🔍</div>
              <h3 className="text-xl font-bold text-[#0A1628] mb-3">Radical Transparency</h3>
              <p className="text-slate-500 leading-relaxed text-sm">No hidden fees, no opaque algorithms. We build in the open so you know exactly how your data is handled.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6">🛡️</div>
              <h3 className="text-xl font-bold text-[#0A1628] mb-3">Compliance by Default</h3>
              <p className="text-slate-500 leading-relaxed text-sm">We don&apos;t let you make mistakes. Our system actively guides you to compliant outcomes automatically.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6">🤝</div>
              <h3 className="text-xl font-bold text-[#0A1628] mb-3">Employee-First</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Software should be loved by the people actually using it, not just the executives buying it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0A1628] mb-6">Meet the leadership</h2>
            <p className="text-lg text-slate-500">Decades of experience in HR, payroll, and scaling venture-backed startups.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { id: 1, name: "Sarah Jenkins", role: "Co-Founder & CEO" },
              { id: 2, name: "David Chen", role: "Co-Founder & CTO" },
              { id: 3, name: "Marcus Johnson", role: "VP of Engineering" },
              { id: 4, name: "Elena Rodriguez", role: "VP of Product" },
              { id: 5, name: "Dr. James Smith", role: "Head of Compliance" },
              { id: 6, name: "Priya Patel", role: "Head of Customer Success" }
            ].map(member => (
              <div key={member.id} className="group">
                <div className="aspect-[4/5] w-full bg-slate-100 rounded-2xl border border-slate-200 shadow-sm mb-6 flex items-center justify-center overflow-hidden relative">
                  <div className="text-slate-400 font-bold group-hover:scale-105 transition-transform duration-500">[ Photo ]</div>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#0A1628]">{member.name}</h3>
                    <p className="text-blue-600 font-bold text-sm mt-1">{member.role}</p>
                  </div>
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0077b5] hover:border-[#0077b5] hover:bg-white transition-all">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-24 bg-[#0A1628] text-white overflow-hidden relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-16 text-center">Our journey</h2>
          
          <div className="relative border-l-2 border-slate-700/50 ml-4 md:ml-0 md:border-none">
            <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-1 bg-slate-700/50" />
            
            <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-4 relative text-left md:text-center">
              
              <div className="flex flex-row md:flex-col items-start md:items-center relative pl-8 md:pl-0 w-full md:w-1/4">
                <div className="w-14 h-14 bg-[#0A1628] border-4 border-blue-600 rounded-full flex items-center justify-center text-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] absolute left-[-28px] md:relative md:left-0 md:mb-6 z-10">🌱</div>
                <div className="mt-2 md:mt-0">
                  <div className="text-blue-400 font-black tracking-widest text-sm mb-2 uppercase">2021</div>
                  <h3 className="text-xl font-bold mb-2">Founded</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Built the first prototype in a garage to solve our own payroll pain points.</p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-start md:items-center relative pl-8 md:pl-0 w-full md:w-1/4">
                <div className="w-14 h-14 bg-[#0A1628] border-4 border-slate-700 rounded-full flex items-center justify-center text-xl shadow-lg absolute left-[-28px] md:relative md:left-0 md:mb-6 z-10">🛠️</div>
                <div className="mt-2 md:mt-0">
                  <div className="text-blue-400 font-black tracking-widest text-sm mb-2 uppercase">2022</div>
                  <h3 className="text-xl font-bold mb-2">Private Beta</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">100 early adopters helped us refine the core payroll engine and UI.</p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-start md:items-center relative pl-8 md:pl-0 w-full md:w-1/4">
                <div className="w-14 h-14 bg-[#0A1628] border-4 border-slate-700 rounded-full flex items-center justify-center text-xl shadow-lg absolute left-[-28px] md:relative md:left-0 md:mb-6 z-10">🚀</div>
                <div className="mt-2 md:mt-0">
                  <div className="text-blue-400 font-black tracking-widest text-sm mb-2 uppercase">2023</div>
                  <h3 className="text-xl font-bold mb-2">Public Launch</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Opened the platform, hitting $1M ARR in just 6 months post-launch.</p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-start md:items-center relative pl-8 md:pl-0 w-full md:w-1/4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 border-4 border-[#0A1628] rounded-full flex items-center justify-center text-xl shadow-[0_0_30px_rgba(99,102,241,0.6)] absolute left-[-28px] md:relative md:left-0 md:mb-6 z-10">📈</div>
                <div className="mt-2 md:mt-0">
                  <div className="text-blue-400 font-black tracking-widest text-sm mb-2 uppercase">2024</div>
                  <h3 className="text-xl font-bold mb-2">Series A</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Raised $25M led by top tier VCs to accelerate product development.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* INVESTORS */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-[#0A1628] mb-12">Backed by the best</h2>
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20 opacity-50 grayscale">
            <div className="font-black text-2xl tracking-tighter text-slate-800">Sequoia</div>
            <div className="font-black italic text-2xl text-slate-800">a16z</div>
            <div className="font-bold text-2xl tracking-widest uppercase text-slate-800">Lightspeed</div>
            <div className="font-black text-2xl text-slate-800">Y Combinator</div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-[#0A1628] tracking-tight mb-8">
            Help us build the future of work. Or start experiencing it today.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link href="/careers" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                Join our team
             </Link>
             <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg hover:-translate-y-1">
                Try CircleWorks free
             </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
