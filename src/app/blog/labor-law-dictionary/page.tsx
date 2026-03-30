"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ResourceCTA from "@/components/ResourceCTA";
import Link from "next/link";
import { useState } from "react";

const dictionaryTerms = [
  { term: "FLSA", fullName: "Fair Labor Standards Act", desc: "A federal law which establishes minimum wage, overtime pay eligibility, recordkeeping, and child labor standards affecting full-time and part-time workers in the private sector and in Federal, State, and local governments." },
  { term: "FMLA", fullName: "Family and Medical Leave Act", desc: "Allows eligible employees to take up to 12 work weeks of unpaid, job-protected leave in a 12-month period for specified family and medical reasons." },
  { term: "COBRA", fullName: "Consolidated Omnibus Budget Reconciliation Act", desc: "Gives workers and their families who lose their health benefits the right to choose to continue group health benefits provided by their group health plan for limited periods of time under certain circumstances." },
  { term: "ERISA", fullName: "Employee Retirement Income Security Act", desc: "A federal law that sets minimum standards for most voluntarily established retirement and health plans in private industry to provide protection for individuals in these plans." },
  { term: "EEOC", fullName: "Equal Employment Opportunity Commission", desc: "A federal agency that administers and enforces civil rights laws against workplace discrimination." },
  { term: "At-Will Employment", fullName: "Employment-at-Will", desc: "A common-law doctrine that an employment relationship may be terminated by either party at any time and for any reason, with or without notice." },
  { term: "W-2", fullName: "Wage and Tax Statement", desc: "An IRS form used to report wages, tips, and other compensation paid to an employee, and the taxes withheld from them." },
  { term: "1099-NEC", fullName: "Nonemployee Compensation", desc: "The form used to report payments of $600 or more to independent contractors (non-employees)." },
  { term: "SUI", fullName: "State Unemployment Insurance", desc: "A tax used to fund unemployment benefits for workers who have lost their jobs through no fault of their own." },
  { term: "I-9", fullName: "Employment Eligibility Verification", desc: "Used for verifying the identity and employment authorization of individuals hired for employment in the United States." },
];

export default function LaborLawDictionary() {
  const [search, setSearch] = useState("");

  const filteredTerms = dictionaryTerms.filter(t => 
    t.term.toLowerCase().includes(search.toLowerCase()) || 
    t.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden z-10 border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="mb-12">
             <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Resources", href: "/guides" }, { label: "Dictionary" }]} variant="dark" />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-white/5 text-slate-300 border border-white/10 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
          >
            Employment glossary
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8 max-w-4xl mx-auto"
          >
            US Labor Law <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Dictionary.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            HR and payroll terminology simplified. We break down the acronyms and legal technicalities of employment in America.
          </motion.p>

          <div className="w-full max-w-xl relative group">
             <input 
                type="text" 
                placeholder="Search definitions (e.g. FLSA, compliance...)" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border-2 border-slate-700/50 text-white bg-transparent rounded-2xl px-6 py-5 focus:outline-none focus:border-cyan-400 transition-all shadow-2xl backdrop-blur-sm font-bold placeholder:text-slate-500"
             />
             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 font-black text-xs uppercase tracking-widest">
                {filteredTerms.length} Results
             </div>
          </div>
        </div>
      </section>

      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid gap-8">
            {filteredTerms.map((term, idx) => (
               <motion.div 
                  key={term.term}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative"
               >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 group-hover:bg-cyan-400 transition-colors" />
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                     <div>
                        <span className="text-blue-600 font-black text-4xl tracking-tight leading-none transition-colors">{term.term}</span>
                        <h4 className="text-slate-500 font-bold mt-2 uppercase text-xs tracking-widest">{term.fullName}</h4>
                     </div>
                     <div className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100 shadow-inner">Official Term</div>
                  </div>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                     {term.desc}
                  </p>
               </motion.div>
            ))}
            
            {filteredTerms.length === 0 && (
               <div className="text-center py-20 text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50">
                  No definitions found for "{search}".
               </div>
            )}
         </div>
         
         <div className="mt-20 p-16 bg-slate-50 rounded-[4rem] text-center border border-slate-200 shadow-inner group">
            <h3 className="text-3xl font-black text-[#0A1628] mb-4">Still confused by <span className="text-blue-600 group-hover:text-cyan-500 transition-colors">compliance?</span></h3>
            <p className="text-slate-500 mb-10 max-w-lg mx-auto text-lg font-medium">Our automated payroll system handles all of these regulations natively, so you don't have to be a legal expert.</p>
            <Link href="/pricing" className="inline-block bg-[#0A1628] text-white font-black px-10 py-5 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-slate-900/20">
               Explore Compliance Features
            </Link>
         </div>
      </section>

      <ResourceCTA 
         title="Ready to speak HR fluently?" 
         description="Talk to our experts about how CircleWorks handles FLSA, FMLA, and COBRA automatically for your business."
      />

      <Footer />
    </main>
  );
}
