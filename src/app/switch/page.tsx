import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Metadata } from "next";
import { 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Database, 
  AlertTriangle, 
  Clock, 
  UserPlus, 
  Download, 
  Upload, 
  Copy, 
  Rocket,
  ShieldCheck,
  Check
} from "lucide-react";

export const metadata: Metadata = {
  title: "Switch to CircleWorks | Hassle-Free Payroll Migration",
  description: "Switching payroll providers is easier than you think. We handle the heavy lifting, data import, and parallel runs. Migrate to CircleWorks today.",
  alternates: {
    canonical: "https://circleworks.com/switch",
  },
};

const providers = [
  "Gusto",
  "ADP",
  "Paychex",
  "QuickBooks Payroll",
  "Rippling",
  "BambooHR",
  "Excel / CSV"
];

const fears = [
  {
    icon: <Database className="w-8 h-8 text-blue-500" />,
    question: "What if my historical data gets lost?",
    answer: "We import all payroll history — pay stubs, tax records, W-2s, 1099s, and employee files. Nothing gets left behind.",
  },
  {
    icon: <AlertTriangle className="w-8 h-8 text-orange-500" />,
    question: "What if there are errors in the first run?",
    answer: "We run parallel payroll alongside your old system for 1 month — completely free. We compare the pennies so you don't have to.",
  },
  {
    icon: <Clock className="w-8 h-8 text-emerald-500" />,
    question: "How long does it take?",
    answer: "Most companies are fully migrated in 2 weeks. Enterprise organizations (500+ employees) typically take 30 days with a dedicated specialist.",
  }
];

const steps = [
  {
    day: "Day 1",
    title: "Sign up & assign specialist",
    desc: "Create your account and meet your dedicated migration specialist who will guide you from start to finish.",
    icon: <UserPlus className="w-6 h-6 text-white" />,
    color: "bg-blue-600"
  },
  {
    day: "Day 2",
    title: "Export your data",
    desc: "Export your data from your current provider. We provide exact, step-by-step guides for Gusto, ADP, Paychex, and more.",
    icon: <Download className="w-6 h-6 text-white" />,
    color: "bg-indigo-600"
  },
  {
    day: "Days 3-5",
    title: "We import everything",
    desc: "Hand us your raw exports. Our team maps your fields, imports your history, and structures your new account.",
    icon: <Upload className="w-6 h-6 text-white" />,
    color: "bg-purple-600"
  },
  {
    day: "1 Pay Period",
    title: "Parallel Run",
    desc: "We run payroll alongside your old system for one full cycle to guarantee 100% accuracy before you cut the cord.",
    icon: <Copy className="w-6 h-6 text-white" />,
    color: "bg-cyan-600"
  },
  {
    day: "Go Live",
    title: "Launch CircleWorks",
    desc: "Run your first official payroll on CircleWorks. Your employees get invited to the app on a date of your choosing.",
    icon: <Rocket className="w-6 h-6 text-white" />,
    color: "bg-emerald-600"
  }
];

export default function SwitchPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-200 selection:text-navy">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-8">
              <ShieldCheck className="w-4 h-4" />
              White-glove migration included
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8">
              Switching payroll providers is <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">easier than you think</span>.
            </h1>
            
            <p className="text-xl text-slate-300 mb-10 leading-relaxed font-medium max-w-2xl">
              We handle the heavy lifting — data import, parallel runs, and dedicated support. You won't miss a beat (or a paycheck).
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/calendly" 
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#0A1628] font-bold rounded-xl hover:bg-slate-50 transition-all shadow-lg text-lg"
              >
                Start Your Migration
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DATA IMPORT SUPPORT MARQUEE / GRID */}
      <section className="py-12 bg-slate-50 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">We seamlessly import data from</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-70">
            {providers.map((provider) => (
              <div key={provider} className="flex items-center gap-2 text-slate-700 font-bold text-lg md:text-xl">
                <Check className="w-5 h-5 text-blue-500" />
                {provider}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEAR ADDRESSER SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0A1628] mb-6">
              The #1 objection to switching? <br className="hidden md:block" />
              <span className="text-blue-600">Fear of breaking payroll.</span>
            </h2>
            <p className="text-lg text-slate-500">
              We get it. Payroll is mission-critical. That's why we've engineered a migration process that eliminates risk entirely.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {fears.map((fear, idx) => (
              <div key={idx} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 border border-slate-100">
                    {fear.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#0A1628] mb-4 leading-tight">
                    "{fear.question}"
                  </h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {fear.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GUARANTEE BANNER */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 text-white mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Our Ironclad Guarantee</h2>
          <p className="text-xl text-blue-100 font-medium max-w-3xl mx-auto leading-relaxed">
            If our migration process causes errors on your first official CircleWorks payroll, <span className="text-white font-bold bg-white/20 px-2 py-1 rounded">we cover any resulting tax penalties.</span> Period.
          </p>
        </div>
      </section>

      {/* STEP-BY-STEP PROCESS */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Background decorative path */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-slate-200 hidden lg:block" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-[#0A1628] mb-6">Your Migration Roadmap</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              A transparent, predictable process that gets you live without the headaches.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col md:flex-row gap-8 items-start group">
                
                {/* Desktop Line Connector */}
                {idx !== steps.length - 1 && (
                  <div className="absolute top-12 left-[2.25rem] md:left-[5.5rem] bottom-[-3rem] w-0.5 bg-slate-200 group-hover:bg-blue-200 transition-colors z-0 hidden md:block" />
                )}

                {/* Left Side: Timeline / Day */}
                <div className="md:w-48 shrink-0 pt-2 relative z-10 flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl ${step.color} shadow-lg flex items-center justify-center shrink-0`}>
                    {step.icon}
                  </div>
                  <div className="font-bold text-slate-400 uppercase tracking-widest text-sm">
                    {step.day}
                  </div>
                </div>

                {/* Right Side: Content */}
                <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative z-10">
                  <div className="absolute top-8 -left-3 w-6 h-6 bg-white border-t border-l border-slate-200 rotate-45 hidden md:block" />
                  <h3 className="text-2xl font-bold text-[#0A1628] mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-[#0A1628] text-center relative overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-500/20 text-blue-400 mb-8 border border-blue-500/30 backdrop-blur-sm shadow-2xl">
            <Calendar className="w-10 h-10" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to pull the trigger?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Book a 30-minute working session with a migration specialist to review your current setup and build your custom transition timeline.
          </p>
          <div className="flex justify-center">
             <Link href="/calendly" className="group px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center gap-3 text-lg">
                <Calendar className="w-6 h-6" />
                Talk to a Migration Specialist
             </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
