"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ResourceCTA from "@/components/ResourceCTA";
import Link from "next/link";

const industriySolutions = [
  {
    title: "Technology & SaaS",
    description: "Global teams, contractor-heavy, fast scaling with equity integration and SOC-2 compliance.",
    emoji: "💻",
    href: "/solutions/technology-saas",
    gradient: "from-purple-400 to-blue-400",
  },
  {
    title: "Healthcare & Wellness",
    description: "Hourly staff, compliance-heavy, shift management with HIPAA-ready platform.",
    emoji: "⚕️",
    href: "/solutions/health-wellness",
    gradient: "from-green-400 to-teal-400",
  },
  {
    title: "Retail & Ecommerce",
    description: "Shift-based workers, multi-location payroll, and labor cost control.",
    emoji: "🛍️",
    href: "/solutions/retail-ecommerce",
    gradient: "from-orange-400 to-red-400",
  },
  {
    title: "Professional Services",
    description: "Billable hour tracking, client-based teams, and revenue correlation.",
    emoji: "🤝",
    href: "/solutions/professional-services",
    gradient: "from-indigo-400 to-purple-400",
  },
];

const primarySolutions = [
  {
    title: "Agencies",
    description: "Run payroll for all your clients from one dashboard. Multi-client portal, white-label reports, and billable-hour sync.",
    emoji: "🏢",
    href: "/solutions/agencies",
    gradient: "from-blue-600 via-indigo-500 to-purple-600",
    badge: "Most Popular",
  },
  {
    title: "Creators",
    description: "Pay your talent, track royalties, and file 1099s automatically. Built for the creator economy.",
    emoji: "🎬",
    href: "/solutions/creators",
    gradient: "from-pink-500 via-rose-500 to-orange-500",
    badge: null,
  },
  {
    title: "Startups",
    description: "Equity sync, auto-state registration, and R&D tax credits. Scale from first hire to IPO without breaking HR.",
    emoji: "🚀",
    href: "/solutions/startups",
    gradient: "from-blue-400 via-cyan-400 to-emerald-400",
    badge: "VC-Backed",
  },
  {
    title: "Healthcare",
    description: "HIPAA-compliant payroll with shift differentials, 8/80 overtime, and credential tracking for medical teams.",
    emoji: "⚕️",
    href: "/solutions/healthcare",
    gradient: "from-emerald-500 via-teal-500 to-blue-500",
    badge: "HIPAA Ready",
  },
  {
    title: "Tech Companies",
    description: "Unified payroll, IT provisioning, SOC-2 audit logs, and global EOR for remote-first engineering teams.",
    emoji: "⚙️",
    href: "/solutions/tech",
    gradient: "from-slate-700 via-blue-900 to-indigo-900",
    badge: null,
  },
  {
    title: "Restaurants",
    description: "FICA tip credit engine, POS sync with Toast & Square, dual-rate tracking, and mobile onboarding for hospitality.",
    emoji: "🍽️",
    href: "/solutions/restaurants",
    gradient: "from-orange-500 via-red-500 to-rose-600",
    badge: null,
  },
];

const useCaseSolutions = [
  {
    title: "Remote & Global Teams",
    description: "Multi-state tax complexity, nexus tracking, and compliance automation.",
    emoji: "🌎",
    href: "/solutions/remote-teams",
    gradient: "from-cyan-400 to-blue-400",
  },
  {
    title: "Rapid Scaling",
    description: "Automate hiring, onboarding, and payroll for fast-growing teams.",
    emoji: "📈",
    href: "/solutions/rapid-scaling",
    gradient: "from-orange-400 to-yellow-400",
  },
  {
    title: "Compliance-First",
    description: "Audit-ready payroll, tax filing, and regulatory monitoring.",
    emoji: "🛡️",
    href: "/solutions/compliance",
    gradient: "from-green-400 to-blue-400",
  },
  {
    title: "Cost Optimization",
    description: "Reduce labor costs 20-30% through automation and smart scheduling.",
    emoji: "💰",
    href: "/solutions/cost-optimization",
    gradient: "from-yellow-400 to-orange-400",
  },
];

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden z-10 border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="mb-12">
             <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Solutions" }]} variant="dark" />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-white/5 text-slate-300 border border-white/10 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 relative"
          >
            Tailored Solutions for Every Business
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto"
          >
            Payroll & HR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">built for your business.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Whether you&apos;re scaling fast, managing remote teams, or prioritizing compliance, CircleWorks has a solution built for your specific needs.
          </motion.p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/pricing" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300">Get Started</Link>
            <Link href="/contact" className="px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-colors">Book a Demo</Link>
          </div>
        </div>
      </section>

      {/* PRIMARY SOLUTIONS — The 6 required segments */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4"
            >
              Built for your industry
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-3xl lg:text-4xl font-black text-[#0A1628] mb-4"
            >
              Industry-Specific Solutions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Payroll, HR, and compliance workflows tuned for the exact challenges your industry faces.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {primarySolutions.map((solution, idx) => (
              <Link key={idx} href={solution.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: idx * 0.07 }}
                  className="h-full cursor-pointer group"
                >
                  <div className={`bg-gradient-to-br ${solution.gradient} rounded-3xl p-8 h-full relative overflow-hidden border border-transparent hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2`}>
                    {solution.badge && (
                      <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                        {solution.badge}
                      </div>
                    )}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    <div className="relative z-10">
                      <div className="text-5xl mb-5">{solution.emoji}</div>
                      <h3 className="text-2xl font-black text-white mb-3">{solution.title}</h3>
                      <p className="text-white/80 text-sm leading-relaxed mb-6">{solution.description}</p>
                      <div className="text-white font-bold flex items-center gap-2 text-sm group-hover:gap-3 transition-all">
                        Explore features <span className="text-lg">→</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BY INDUSTRY SECTION */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl lg:text-4xl font-black text-[#0A1628] mb-4"
            >
              Solutions by Industry
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Find the solution tailored to your industry&apos;s specific needs
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {industriySolutions.map((solution, idx) => (
              <Link key={idx} href={solution.href}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="h-full groups cursor-pointer"
                >
                  <div className={`bg-gradient-to-br ${solution.gradient} rounded-2xl p-8 h-full border border-transparent hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-2`}>
                    <div className="text-5xl mb-4">{solution.emoji}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{solution.title}</h3>
                    <p className="text-white/90 text-sm leading-relaxed mb-6">{solution.description}</p>
                    <div className="text-white font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more <span>&rarr;</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BY USE CASE SECTION */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl lg:text-4xl font-black text-[#0A1628] mb-4"
            >
              Solutions by Use Case
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Explore solutions designed for your specific business challenges
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCaseSolutions.map((solution, idx) => (
              <Link key={idx} href={solution.href}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="h-full groups cursor-pointer"
                >
                  <div className={`bg-gradient-to-br ${solution.gradient} rounded-2xl p-8 h-full border border-transparent hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-2`}>
                    <div className="text-5xl mb-4">{solution.emoji}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{solution.title}</h3>
                    <p className="text-white/90 text-sm leading-relaxed mb-6">{solution.description}</p>
                    <div className="text-white font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more <span>&rarr;</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-[#0A1628] to-[#0F1C2E] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[80px]" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-tight">Not sure which solution fits?</h2>
            <p className="text-lg text-slate-300 mb-10">Our team can help you find the perfect CircleWorks solution for your business.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 w-full sm:w-auto text-center">
                Schedule a Demo
              </Link>
              <Link href="/resources/roi-calculator" className="px-10 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-colors w-full sm:w-auto text-center">
                Calculate Your ROI
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <ResourceCTA 
         title="Ready to find your solution?" 
         description="Talk to our experts about your specific industry needs and how we can help you scale."
      />

      <Footer />
    </main>
  );
}
