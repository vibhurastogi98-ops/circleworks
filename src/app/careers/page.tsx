"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const openRoles = [
  { id: 1, title: "Senior Full Stack Engineer", dept: "Engineering", type: "Remote (US)", href: "/careers" },
  { id: 2, title: "Product Manager, Payroll", dept: "Product", type: "Remote (US)", href: "/careers" },
  { id: 3, title: "Enterprise Account Executive", dept: "Sales", type: "San Francisco / Remote", href: "/careers" },
  { id: 4, title: "Customer Success Manager", dept: "Support", type: "Remote (Global)", href: "/careers" },
  { id: 5, title: "Staff Product Designer", dept: "Design", type: "Remote (US)", href: "/careers" },
];

const perks = [
  { title: "Remote First", desc: "Work from anywhere in the US, plus standard international hubs.", icon: "🌍" },
  { title: "100% Healthcare Coverage", desc: "We pay 100% of medical, dental, and vision premiums for you and your dependents.", icon: "🏥" },
  { title: "Unlimited PTO", desc: "Take the time you need. We truly mean it, and managers enforce it.", icon: "🏖️" },
  { title: "401(k) Matching", desc: "We match 100% of your contributions up to 5% of your salary.", icon: "💰" },
  { title: "Home Office Stipend", desc: "$1,500 to set up your dream home office on day one.", icon: "🖥️" },
  { title: "Annual Retreats", desc: "Join the entire company once a year in a fun, exotic location.", icon: "✈️" },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-cyan-200 selection:text-navy">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-[#0A1628] overflow-hidden text-center z-10 border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none opacity-50" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-white/5 text-slate-300 border border-white/10 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
          >
            Careers at CircleWorks
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto"
          >
            Come build the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">infrastructure</span> of work.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Join a fast-growing team of builders, designers, and operators dedicated to freeing businesses from archaic HR software.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
             <a href="#open-roles" className="px-8 py-4 bg-white text-[#0A1628] font-bold rounded-xl transition-all shadow-lg hover:-translate-y-1">
                View Open Roles &darr;
             </a>
          </motion.div>
        </div>
      </section>

      {/* Perks Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black text-[#0A1628] mb-4 tracking-tight">Why work at CircleWorks?</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">We take care of our own. Besides a competitive salary and equity packages, here is what you can expect.</p>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {perks.map((p, i) => (
                 <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="text-4xl mb-6">{p.icon}</div>
                    <h4 className="text-lg font-bold text-[#0A1628] mb-3">{p.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* Open Roles Section */}
      <section id="open-roles" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="mb-12 flex items-center justify-between">
              <div>
                 <h2 className="text-3xl lg:text-4xl font-black text-[#0A1628] mb-2 tracking-tight">Open Roles</h2>
                 <p className="text-slate-500">Find where you belong on the rocket ship.</p>
              </div>
           </div>
           
           <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                 {openRoles.map(role => (
                    <Link key={role.id} href={role.href} className="group block p-6 sm:px-8 sm:py-6 hover:bg-slate-50 transition-colors">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                             <h3 className="text-xl font-bold text-[#0A1628] mb-2 group-hover:text-blue-600 transition-colors">{role.title}</h3>
                             <div className="flex items-center gap-3 text-sm text-slate-500 font-medium font-mono">
                                <span>{role.dept}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                <span>{role.type}</span>
                             </div>
                          </div>
                          
                          <div className="shrink-0 flex items-center">
                             <div className="hidden sm:flex items-center justify-center bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                Apply &rarr;
                             </div>
                             <div className="sm:hidden text-blue-600 font-bold flex items-center gap-1">
                                Apply <span>&rarr;</span>
                             </div>
                          </div>
                       </div>
                    </Link>
                 ))}
              </div>
           </div>
           
           <div className="mt-10 text-center text-slate-500 bg-white border border-slate-200 border-dashed rounded-2xl p-8">
              Don't see your role? Email us at <a href="mailto:careers@circleworks.com" className="text-blue-600 font-bold hover:underline">careers@circleworks.com</a> and tell us why you'd be a great fit.
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
