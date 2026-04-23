import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Metadata } from "next";
import React from "react";
import { Check, X, Info, ArrowRight, ArrowRightLeft } from "lucide-react";

export const dynamicParams = false;

const COMPETITORS = [
  "gusto",
  "rippling",
  "adp",
  "paychex",
  "paycom",
  "bamboohr"
] as const;

type Competitor = typeof COMPETITORS[number];

export function generateStaticParams() {
  return COMPETITORS.map((competitor) => ({
    competitor,
  }));
}

const competitorData: Record<Competitor, { name: string; strength: string; pricing: string; hiddenFees: string }> = {
  gusto: {
    name: "Gusto",
    strength: "Small business basic payroll and simple benefits",
    pricing: "Starts at $40/mo base + $6/user (often requires higher tiers for basic HR)",
    hiddenFees: "Time tracking and advanced HR features require Plus/Premium plans.",
  },
  rippling: {
    name: "Rippling",
    strength: "IT management, device provisioning, and complex enterprise setups",
    pricing: "Starts at $35/mo platform fee + $8/user + add-on modules",
    hiddenFees: "Modular pricing means costs multiply quickly as you add features.",
  },
  adp: {
    name: "ADP",
    strength: "Enterprise payroll and legacy compliance for 1,000+ employees",
    pricing: "Custom quote only (typically $50/mo + $10/user)",
    hiddenFees: "Implementation fees, module add-on fees, and charge per payroll run.",
  },
  paychex: {
    name: "Paychex",
    strength: "Traditional payroll processing and basic HR services",
    pricing: "Custom quote only (typically $40/mo + $8/user)",
    hiddenFees: "W-2 processing fees, implementation fees, and costly integrations.",
  },
  paycom: {
    name: "Paycom",
    strength: "Enterprise single-database HR and talent management",
    pricing: "Custom quote only (typically $15+ per user minimum)",
    hiddenFees: "Hefty implementation fees, long-term contracts, and slow deployment.",
  },
  bamboohr: {
    name: "BambooHR",
    strength: "Core HR and basic employee experience tracking",
    pricing: "Custom quote only (typically $8/user + payroll add-on fees)",
    hiddenFees: "Payroll is an extra cost; performance management is a paid add-on.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ competitor: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const comp = resolvedParams.competitor as Competitor;
  const data = competitorData[comp];
  if (!data) return {};

  return {
    title: `CircleWorks vs ${data.name}: 2026 Comparison | CircleWorks`,
    description: `Comparing ${data.name} vs CircleWorks? See why growing agencies, creators, and startups choose CircleWorks for modern, all-in-one HR and payroll.`,
    alternates: {
      canonical: `https://circleworks.com/compare/${comp}`,
    },
  };
}

const FEATURE_GROUPS = [
  {
    name: "Payroll",
    features: [
      { name: "Automated Payroll Runs", cw: true, comp: true },
      { name: "Tax Filing (All 50 States)", cw: true, comp: "Add-on / Tiered" },
      { name: "Next-Day Direct Deposit", cw: true, comp: "Extra fee" },
      { name: "Contractor Payments (1099)", cw: true, comp: true },
    ]
  },
  {
    name: "HRIS",
    features: [
      { name: "Employee Directory & Org Chart", cw: true, comp: true },
      { name: "Document Storage & eSignatures", cw: true, comp: "Limited storage" },
      { name: "Custom Fields & Data", cw: true, comp: "Higher tier only" },
      { name: "Global EOR Services", cw: true, comp: "Via 3rd party" },
    ]
  },
  {
    name: "ATS",
    nameFull: "Applicant Tracking System (ATS)",
    features: [
      { name: "Job Posting Boards", cw: true, comp: "Add-on" },
      { name: "Candidate Pipeline", cw: true, comp: "Add-on" },
      { name: "Custom Offer Letters", cw: true, comp: true },
    ]
  },
  {
    name: "Time",
    nameFull: "Time & Attendance",
    features: [
      { name: "Time Tracking & Timesheets", cw: true, comp: "Add-on" },
      { name: "PTO & Time-Off Management", cw: true, comp: true },
      { name: "Overtime Alerts", cw: true, comp: "Higher tier only" },
    ]
  },
  {
    name: "Benefits",
    features: [
      { name: "Health, Dental, Vision", cw: true, comp: true },
      { name: "401(k) & Retirement", cw: true, comp: true },
      { name: "Commuter & HSA/FSA", cw: true, comp: "Add-on" },
    ]
  },
  {
    name: "Automation",
    features: [
      { name: "Custom Workflow Builder", cw: true, comp: "Enterprise only" },
      { name: "Onboarding/Offboarding Tasks", cw: true, comp: "Higher tier only" },
      { name: "Integration Sync", cw: true, comp: true },
    ]
  },
  {
    name: "Pricing",
    features: [
      { name: "Transparent Pricing", cw: true, comp: false },
      { name: "No Implementation Fees", cw: true, comp: false },
      { name: "Month-to-Month Contracts", cw: true, comp: "Annual Required" },
    ]
  },
  {
    name: "Support",
    features: [
      { name: "Dedicated Account Manager", cw: true, comp: false },
      { name: "24/7 Phone Support", cw: true, comp: "Enterprise only" },
      { name: "3-Minute Average Response SLA", cw: true, comp: false },
    ]
  }
];

export default async function ComparePage({ params }: { params: Promise<{ competitor: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.competitor as Competitor;
  const data = competitorData[slug];
  
  // If not a valid competitor, could return 404, but dynamicParams=false handles it.
  
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const faqs = [
    {
      question: `Is CircleWorks better than ${data.name}?`,
      answer: `CircleWorks is built specifically for modern startups, agencies, and creators under 500 employees. While ${data.name} focuses on ${data.strength.toLowerCase()}, CircleWorks provides an all-in-one experience with transparent pricing, zero implementation fees, and a unified platform that doesn't nickel-and-dime you for essential features.`
    },
    {
      question: `How hard is it to switch from ${data.name}?`,
      answer: `Switching from ${data.name} is seamless. Our white-glove onboarding team handles the entire migration for you. We run parallel payrolls to ensure 100% accuracy, map over all your historical data, and get your team up and running in days, not months.`
    },
    {
      question: `Does CircleWorks integrate with my existing tools?`,
      answer: `Yes. CircleWorks offers native integrations with popular accounting software (QuickBooks, Xero, NetSuite), productivity suites (Google Workspace, Slack, Microsoft 365), and expense management platforms. You won't miss a beat.`
    },
    {
      question: `Are there hidden fees compared to ${data.name}?`,
      answer: `No. Unlike ${data.name}, CircleWorks believes in radically transparent pricing. You get access to the entire platform for one flat per-user rate. No implementation fees, no surprise add-ons, and no restrictive annual contracts.`
    }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const calculateCost = (employees: number) => {
    // CircleWorks simple math: $20 base + $6/user
    return 20 + (6 * employees);
  };

  const getCompetitorCostText = (employees: number, name: string) => {
    if (["adp", "paychex", "paycom", "bamboohr"].includes(name.toLowerCase())) {
      return "Custom Quote";
    }
    if (name === "Gusto") {
      return `$${40 + (6 * employees)}`;
    }
    if (name === "Rippling") {
      return `$${35 + (8 * employees)}`;
    }
    return "Custom Quote";
  };

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-200 selection:text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden text-center border-b border-slate-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Last updated: {currentDate}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8">
            CircleWorks vs <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{data.name}</span>:<br/>
            Side-by-Side Comparison
          </h1>

          {/* VERDICT BOX (Above the fold) */}
          <div className="w-full max-w-3xl mt-6 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch shadow-2xl">
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mb-4">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">CircleWorks is best for:</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                Agencies, creators, startups <span className="text-white">&lt;500 employees</span> looking for a fast, unified, transparently-priced platform.
              </p>
            </div>
            
            <div className="w-px bg-slate-700/50 hidden md:block"></div>
            <div className="h-px w-full bg-slate-700/50 md:hidden"></div>
            
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-slate-400 mb-4">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{data.name} is best for:</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                {data.strength}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE COMPARISON TABLE */}
      <section className="py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-[#0A1628] mb-4">Feature Comparison</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            See exactly how CircleWorks stacks up against {data.name} across every major HR and payroll category.
          </p>
        </div>

        <div className="overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-6 bg-slate-50 border-b border-slate-200 text-lg font-bold text-slate-500 w-1/3 rounded-tl-3xl">
                    Capabilities
                  </th>
                  <th className="p-6 bg-blue-50/50 border-b border-blue-100 border-x w-1/3">
                    <div className="text-2xl font-black text-blue-600">CircleWorks</div>
                  </th>
                  <th className="p-6 bg-slate-50 border-b border-slate-200 text-2xl font-black text-[#0A1628] w-1/3 rounded-tr-3xl">
                    {data.name}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FEATURE_GROUPS.map((group, groupIdx) => (
                  <React.Fragment key={group.name}>
                    {/* Group Header */}
                    <tr className="bg-slate-50/80">
                      <td colSpan={3} className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-sm border-y border-slate-200">
                        {group.nameFull || group.name}
                      </td>
                    </tr>
                    {/* Group Features */}
                    {group.features.map((feature, featureIdx) => (
                      <tr key={feature.name} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5 font-semibold text-[#0A1628]">
                          {feature.name}
                        </td>
                        <td className="px-6 py-5 border-x border-blue-50 bg-blue-50/20">
                          {feature.cw === true ? (
                            <div className="flex items-center gap-2 text-blue-600 font-bold">
                              <div className="bg-blue-100 p-1 rounded-full"><Check className="w-4 h-4" /></div>
                              Included
                            </div>
                          ) : feature.cw === false ? (
                            <div className="flex items-center gap-2 text-slate-400">
                              <X className="w-5 h-5" />
                              Not Available
                            </div>
                          ) : (
                            <span className="font-medium text-blue-700">{feature.cw}</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-slate-500 font-medium">
                          {feature.comp === true ? (
                            <div className="flex items-center gap-2 text-slate-700">
                              <Check className="w-5 h-5 text-slate-400" />
                              Included
                            </div>
                          ) : feature.comp === false ? (
                            <div className="flex items-center gap-2 text-slate-400">
                              <X className="w-5 h-5" />
                              Not Available
                            </div>
                          ) : (
                            <span className="text-slate-600">{feature.comp}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PRICING COMPARISON */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0A1628] mb-4">Pricing Comparison</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              See the real cost difference. No hidden fees, no required annual contracts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* CircleWorks Pricing Card */}
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Transparent Base
                </div>
              </div>
              <h3 className="text-2xl font-black text-[#0A1628] mb-2">CircleWorks</h3>
              <p className="text-slate-500 mb-8">One simple plan, everything included.</p>
              
              <div className="mb-8">
                <div className="text-4xl font-black text-[#0A1628]">$20<span className="text-lg text-slate-500 font-medium">/mo base</span></div>
                <div className="text-xl font-bold text-blue-600 mt-1">+ $6<span className="text-base text-slate-500 font-medium">/user per month</span></div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-semibold text-slate-600">10 Employees</span>
                  <span className="font-black text-[#0A1628]">${calculateCost(10)}/mo</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-semibold text-slate-600">25 Employees</span>
                  <span className="font-black text-[#0A1628]">${calculateCost(25)}/mo</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-semibold text-slate-600">50 Employees</span>
                  <span className="font-black text-[#0A1628]">${calculateCost(50)}/mo</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-semibold text-slate-600">100 Employees</span>
                  <span className="font-black text-[#0A1628]">${calculateCost(100)}/mo</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
                <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 font-medium">
                  Includes everything: Payroll, Time Tracking, HRIS, ATS, and top-tier support.
                </p>
              </div>
            </div>

            {/* Competitor Pricing Card */}
            <div className="bg-slate-100 rounded-3xl p-8 lg:p-10 border border-slate-200">
              <h3 className="text-2xl font-black text-[#0A1628] mb-2">{data.name}</h3>
              <p className="text-slate-500 mb-8">{data.pricing}</p>
              
              <div className="mb-8 opacity-80">
                <div className="text-4xl font-black text-[#0A1628]">Varies</div>
                <div className="text-xl font-bold text-slate-600 mt-1">Based on add-ons</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="font-semibold text-slate-600">10 Employees</span>
                  <span className="font-black text-[#0A1628]">{getCompetitorCostText(10, data.name)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="font-semibold text-slate-600">25 Employees</span>
                  <span className="font-black text-[#0A1628]">{getCompetitorCostText(25, data.name)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="font-semibold text-slate-600">50 Employees</span>
                  <span className="font-black text-[#0A1628]">{getCompetitorCostText(50, data.name)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="font-semibold text-slate-600">100 Employees</span>
                  <span className="font-black text-[#0A1628]">{getCompetitorCostText(100, data.name)}</span>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 flex gap-3 border border-orange-100">
                <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800 font-medium">
                  <strong>Hidden Fees:</strong> {data.hiddenFees}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MIGRATION CTA */}
      <section className="py-24 bg-[#0A1628] text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 mb-8 border border-blue-500/30">
            <ArrowRightLeft className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            Switching from {data.name}?<br className="hidden md:block"/> We make it easy.
          </h2>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Don't let the fear of migration hold you back. Our white-glove team will securely import your data and run parallel payrolls so you never miss a beat.
          </p>
          <div className="flex justify-center flex-wrap gap-4">
             <Link href="/switch" className="group px-8 py-4 bg-white hover:bg-slate-50 text-[#0A1628] font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 text-lg">
                Start Your Migration
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>
      </section>

      {/* COMPETITOR-SPECIFIC FAQ */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-[#0A1628] mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-slate-500">Everything you need to know about switching from {data.name}.</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-[#0A1628] mb-3 flex items-start gap-4">
                <span className="text-blue-500 mt-1">Q.</span>
                {faq.question}
              </h3>
              <div className="text-slate-600 leading-relaxed flex items-start gap-4">
                <span className="text-slate-300 font-bold mt-1 opacity-0">Q.</span>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
