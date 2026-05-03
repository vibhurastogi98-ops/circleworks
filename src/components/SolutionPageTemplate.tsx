"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import InteractiveMockup from "@/components/InteractiveMockup";
import FeatureVisual from "@/components/FeatureVisual";

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface BenefitItem {
  metric: string;
  description: string;
  icon: string;
}

interface TestimonialItem {
  quote: string;
  author: string;
  company: string;
  role: string;
  avatar: string;
}

interface UseCaseStep {
  number: string;
  title: string;
  description: string;
  icon: string;
}

interface SolutionPageProps {
  title: string;
  subtitle: string;
  breadcrumbLabel: string;
  heroGradient: string; // gradient color class
  heroEmoji: string;
  problems: { icon: string; title: string; description: string }[];
  solutionIntro: string;
  solutionPoints: string[];
  features: FeatureItem[];
  useCaseSteps: UseCaseStep[];
  benefits: BenefitItem[];
  testimonials: TestimonialItem[];
  ctaHeading: string;
  ctaDescription: string;
}

export default function SolutionPageTemplate({
  title,
  subtitle,
  breadcrumbLabel,
  heroGradient,

  problems,
  solutionIntro,
  solutionPoints,
  features,
  useCaseSteps,
  benefits,
  testimonials,
  ctaHeading,
  ctaDescription,
}: SolutionPageProps) {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden z-10 border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex-1">
            <div className="mb-8">
              <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Solutions", href: "/solutions" }, { label: breadcrumbLabel }]} variant="dark" />
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-block bg-white/5 text-slate-300 border border-white/10 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              For Your Business
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-3xl bg-clip-text text-transparent bg-gradient-to-r ${heroGradient}`}>
              {title}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
              {subtitle}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/pricing" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300">
                Get Started
              </Link>
              <Link href="/contact" className="px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-colors">
                Book a Demo
              </Link>
            </motion.div>
          </div>

          {/* Right Hero Mockup */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="flex-1 hidden lg:flex items-center justify-center">
            <InteractiveMockup moduleName={breadcrumbLabel} initialTab="dashboard" />
          </motion.div>
        </div>
      </section>

      {/* PROBLEMS SECTION */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl lg:text-4xl font-black text-[#0A1628] mb-4">
              The Challenges
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-slate-600 max-w-2xl mx-auto">
              Today&apos;s Payroll & HR challenges demand smart, automated solutions
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group cursor-default">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{problem.icon}</div>
                <h3 className="text-xl font-bold text-[#0A1628] mb-3">{problem.title}</h3>
                <p className="text-slate-600 leading-relaxed">{problem.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="py-20 lg:py-32 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-6 leading-tight">How CircleWorks Helps</h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">{solutionIntro}</p>
              <ul className="space-y-4 mb-10">
                {solutionPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-4 text-slate-300">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">✓</span>
                    <span className="text-lg font-medium leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex-1 w-full relative">
              <FeatureVisual headline={title} accent="bg-blue-600" accentBg="bg-blue-600" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl lg:text-4xl font-black text-[#0A1628] mb-4">
              Key Features
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to run Payroll & HR at scale
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[#0A1628] mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES / WORKFLOW SECTION */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl lg:text-4xl font-black text-[#0A1628] mb-4">
              The CircleWorks Workflow
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-slate-600 max-w-2xl mx-auto">
              From hiring to scaling, we&apos;ve got every step covered
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCaseSteps.map((step, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="relative">
                {/* Connecting Line */}
                {idx < useCaseSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-blue-400 to-transparent" />
                )}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-4xl">{step.icon}</div>
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0A1628] mb-3">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-20 lg:py-32 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl lg:text-4xl font-black text-white mb-4">
              Real Impact
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-slate-300 max-w-2xl mx-auto">
              See what companies like yours achieve with CircleWorks
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8 text-center hover:border-cyan-500/50 transition-colors">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <div className="text-3xl lg:text-4xl font-black text-cyan-400 mb-2">{benefit.metric}</div>
                <p className="text-slate-300 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / TESTIMONIALS SECTION */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl lg:text-4xl font-black text-[#0A1628] mb-4">
              What Our Customers Say
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-slate-600 max-w-2xl mx-auto">
              Join hundreds of companies transforming their HR operations
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed italic">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center text-white font-bold text-lg">{testimonial.avatar}</div>
                  <div>
                    <p className="font-bold text-[#0A1628]">{testimonial.author}</p>
                    <p className="text-sm text-slate-500">{testimonial.role} @ {testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-[#0A1628] to-[#0F1C2E] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[80px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-tight max-w-3xl mx-auto">{ctaHeading}</h2>
            <p className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed max-w-2xl">{ctaDescription}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/pricing" className="px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 w-full sm:w-auto text-center">
                Start Free
              </Link>
              <Link href="/contact" className="px-10 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-colors w-full sm:w-auto text-center">
                Schedule a Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
