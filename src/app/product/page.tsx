"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const MODULES = [
  {
    id: "payroll",
    name: "Payroll",
    title: "Run payroll in minutes. Worldwide.",
    desc: "Automate your payroll runs with a few clicks. We handle local, state, and federal setup, tax calculations, forms, and filings automatically.",
    features: ["50-state automated tax filing", "2-day direct deposit", "W-2 and 1099 generation", "Off-cycle runs & bonuses"],
    link: "/product/payroll",
  },
  {
    id: "hris",
    name: "HRIS",
    title: "Your single source of truth.",
    desc: "Centralize employee records, documents, and reporting. Keep everything organized and accessible in one place.",
    features: ["Secure employee records", "Dynamic visual org charts", "Custom fields & workflows", "e-Signatures & document storage"],
    link: "/product/hris",
  },
  {
    id: "ats",
    name: "Hiring / ATS",
    title: "Hire the best, faster.",
    desc: "From job posting to offer letter, manage your entire recruiting pipeline from a collaborative dashboard.",
    features: ["Custom branded career pages", "Interview scheduling", "Collaborative scorecards", "Offer letter staging"],
    link: "/product/ats",
  },
  {
    id: "onboarding",
    name: "Onboarding",
    title: "A flawless day one.",
    desc: "Turn complex onboarding into a seamless automated experience that wows new hires and keeps you compliant.",
    features: ["Automated task checklists", "IT & software provisioning", "I-9 and W-4 workflows", "Welcome packets"],
    link: "/product/onboarding",
  },
  {
    id: "benefits",
    name: "Benefits",
    title: "World-class health and wealth.",
    desc: "Offer big-company benefits on a small-company budget. Health, dental, vision, 401(k), and more.",
    features: ["Health, Dental, & Vision", "401(k) retirement plans", "HSA, FSA, & Commuter", "Workers Comp"],
    link: "/product/benefits",
  },
  {
    id: "time",
    name: "Time & Scheduling",
    title: "Track every hour precisely.",
    desc: "Integrated time tracking that flows straight into payroll. No more data syncing or spreadsheet errors.",
    features: ["Geo-fenced clock-ins", "Overtime & labor alerts", "Drag-and-drop scheduling", "PTO tracking & accruals"],
    link: "/product/time-tracking",
  },
  {
    id: "expenses",
    name: "Expenses",
    title: "Reimburse faster than ever.",
    desc: "Simplify expense reporting with receipt capture and automated approval routing.",
    features: ["Receipt OCR scanning", "Multi-level approvals", "Policy enforcement rules", "Auto-reimburse via payroll"],
    link: "/product/expenses",
  },
  {
    id: "performance",
    name: "Performance & Learning",
    title: "Scale growth and feedback.",
    desc: "Align your team with goals, continuous feedback, and structured performance reviews.",
    features: ["360° peer reviews", "Goal & OKR tracking", "1-on-1 agendas", "Learning management (LMS)"],
    link: "/product/performance",
  },
  {
    id: "compliance",
    name: "Compliance",
    title: "Stay legal across all 50 states.",
    desc: "Proactive compliance alerts and required training to protect your business from costly penalties.",
    features: ["State tax registrations", "ACA & EEO-1 reporting", "Labor law poster updates", "Harassment training"],
    link: "/product/compliance",
  },
  {
    id: "analytics",
    name: "Analytics",
    title: "Decisive board-ready insights.",
    desc: "Turn raw team data into actionable intelligence with pre-built reports and custom dashboards.",
    features: ["40+ pre-built reports", "AI-driven insights", "Headcount forecasting", "Compensation parity checks"],
    link: "/product/reporting",
  },
];

export default function ProductPage() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 120; // Accounts for sticky nav and padding
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-[#0A1628]">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#0A1628] pt-32 pb-20 lg:pt-48 lg:pb-32 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-[72px] font-black text-white leading-[1.05] tracking-tight mb-6"
          >
            One Platform.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Every HR Task.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto font-medium"
          >
            See the complete CircleWorks platform.
          </motion.p>
        </div>
      </section>

      {/* Sticky Module Navigation pills */}
      <div className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm py-4 w-full overflow-x-auto hide-scrollbar">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 w-max sm:w-auto">
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => scrollToSection(mod.id)}
              className="px-4 py-2 rounded-full text-[14px] font-semibold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              {mod.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="py-10 overflow-hidden">
        {MODULES.map((mod, index) => {
          const isEven = index % 2 === 0;
          return (
            <section key={mod.id} id={mod.id} className="py-20 lg:py-32">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className={`flex flex-col gap-12 lg:gap-20 items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  
                  {/* Text Column */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="flex-1 w-full"
                  >
                    <span className="text-cyan-500 font-bold uppercase tracking-wider text-sm mb-4 block">
                      {mod.name}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                      {mod.title}
                    </h2>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                      {mod.desc}
                    </p>
                    
                    <ul className="space-y-4 mb-10">
                      {mod.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                          <Check className="text-emerald-500 mt-1 shrink-0" size={20} strokeWidth={3} />
                          <span className="text-[16px]">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <Link 
                      href={mod.link} 
                      className="inline-flex items-center gap-2 text-blue-600 font-bold text-lg hover:text-blue-800 transition-colors group"
                    >
                      Learn more
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>

                  {/* Visual Column */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? 40 : -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="flex-1 w-full"
                  >
                    <div className="relative w-full aspect-[4/3] rounded-2xl bg-[#0A1628] border border-slate-200 shadow-2xl overflow-hidden group">
                      {/* Browser Top Bar */}
                      <div className="absolute top-0 left-0 right-0 h-10 bg-[#0F172A] border-b border-slate-700/50 flex items-center px-4 gap-2 z-10">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      
                      {/* Abstract Visual Content to represent UI */}
                      <div className="absolute inset-0 pt-10 p-6 flex flex-col gap-4 bg-gradient-to-br from-[#0A1628] to-[#152336]">
                        <div className="w-1/3 h-6 bg-slate-700/50 rounded-lg animate-pulse" />
                        <div className="w-full flex-1 flex gap-4">
                           <div className="flex-1 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
                           </div>
                           <div className="w-1/3 bg-white/5 rounded-xl border border-white/5" />
                        </div>
                      </div>

                      {/* Floating Badge */}
                      <div className="absolute -bottom-10 group-hover:bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300">
                        <div className="px-4 py-2 bg-blue-600 text-white font-bold rounded-full text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] whitespace-nowrap">
                          {mod.name} Preview
                        </div>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom CTA Section */}
      <section className="py-24 bg-[#0A1628] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Start with what you need,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              add more as you grow.
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Choose a plan that fits your business today. Upgrade anytime with a single click.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link 
              href="/pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-[#0A1628] font-bold text-[16px] hover:bg-slate-100 transition-colors"
            >
              Compare Plans
            </Link>
            <Link 
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[16px] font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-shadow"
            >
              Start Free Trial
            </Link>
          </div>
          
          <p className="text-slate-400 text-sm font-medium">
             30-day free trial on all plans. No credit card required to start.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
