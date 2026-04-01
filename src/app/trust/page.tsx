"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Lock, Globe, FileCheck, CheckCircle, Building2, Server, Users, RefreshCw } from "lucide-react";

const CERTIFICATIONS = [
  { label: "SOC 2 Type II", icon: ShieldCheck, description: "Independently audited for security, availability, and confidentiality." },
  { label: "HIPAA Compliant", icon: Lock, description: "Meets all federal standards for protecting sensitive patient health information." },
  { label: "GDPR Ready", icon: Globe, description: "Fully compliant with EU data protection and privacy regulations." },
  { label: "CCPA Compliant", icon: FileCheck, description: "Adheres to California consumer privacy standards for data control." },
  { label: "E-Verify", icon: CheckCircle, description: "Authorized participant in the federal employment eligibility verification program." },
  { label: "BBB Accredited", icon: Building2, description: "Maintaining the highest standards for trust and business ethics." },
];

const TRUST_PILLARS = [
  {
    title: "Data Privacy",
    icon: Lock,
    description: "Your data is yours. We never sell employee information and use industry-leading encryption to keep it private.",
    features: ["End-to-end encryption", "Granular access controls", "Data residency options"]
  },
  {
    title: "System Reliability",
    icon: Server,
    description: "Our infrastructure is built for 99.99% uptime so your team can always access payroll and HR tools when needed.",
    features: ["Redundant AWS hosting", "Sub-second failover", "Real-time status monitoring"]
  },
  {
    title: "Compliance Mastery",
    icon: RefreshCw,
    description: "We handle the complexity of local, state, and federal regulations so you can focus on growing your business.",
    features: ["Automatic tax updates", "Filings in all 50 states", "Automated labor law alerts"]
  }
];

export default function TrustCenterPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden text-center z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 relative"
          >
            Trust Center
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6"
          >
            Built on a foundation <br/> of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">unwavering trust.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Your employees represent your most sensitive data. We protect it with bank-grade security, 
            rigorous compliance, and transparent operations.
          </motion.p>
        </div>
      </section>

      {/* Certifications Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-black text-[#0A1628] mb-4">Certifications & Compliance</h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
            We undergo regular third-party audits to ensure our systems meet the highest global standards.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {CERTIFICATIONS.map((cert, index) => (
            <motion.div 
              key={cert.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <cert.icon className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#0A1628] mb-3">{cert.label}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{cert.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="py-24 bg-[#0A1628] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {TRUST_PILLARS.map((pillar, index) => (
              <motion.div 
                key={pillar.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col gap-6"
              >
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <pillar.icon className="text-blue-400" size={28} />
                </div>
                <h3 className="text-2xl font-bold">{pillar.title}</h3>
                <p className="text-slate-400 leading-relaxed">{pillar.description}</p>
                <ul className="space-y-3 mt-4">
                  {pillar.features.map(feature => (
                    <li key={feature} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Docs */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 rounded-3xl p-12 border border-slate-100 border-dashed">
          <h2 className="text-3xl font-black text-[#0A1628] mb-4">Access our Trust Reports</h2>
          <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto font-medium">
            Verified customers can request access to our full SOC 2 reports, technical architecture diagrams, 
            and quarterly penetration testing results.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors">
              Request Documentation
            </button>
            <button className="bg-white hover:bg-slate-50 text-[#0A1628] border border-slate-200 font-bold py-4 px-8 rounded-xl transition-colors">
              Contact Compliance
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
