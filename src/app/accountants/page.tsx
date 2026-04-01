"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LayoutDashboard, Users, PieChart, ShieldCheck, Zap, Laptop, FileDown, BookOpen } from "lucide-react";

/**
 * Accountants Portal Page
 * Targets accounting firms and solo practitioners managing multiple CircleWorks clients.
 */

const ACCOUNTANT_FEATURES = [
  {
    title: "Client Management Dashboard",
    icon: LayoutDashboard,
    description: "Access and switch between all your client accounts from a single, unified workspace. No more multiple logins."
  },
  {
    title: "Advanced Data Export",
    icon: FileDown,
    description: "Export gl-ready reports in CSV, PDF, and specialized formats for QuickBooks, NetSuite, and Sage."
  },
  {
    title: "Real-time Reporting",
    icon: PieChart,
    description: "Generate payroll, tax, and benefits reports instantly to support month-end closing and tax planning."
  },
  {
    title: "Collaborative Workflows",
    icon: Users,
    description: "Work seamlessly with client HR teams. Assign tasks, request documentation, and approve runs."
  },
  {
    title: "Dedicated Accountant Support",
    icon: ShieldCheck,
    description: "Priority access to our most senior support engineers and payroll tax specialists."
  },
  {
    title: "API-First Integrations",
    icon: Zap,
    description: "Connect CircleWorks directly to your firm's professional accounting software suite."
  }
];

export default function AccountantsPortalPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 bg-[#0A1628] overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#3B82F6_0%,transparent_50%),radial-gradient(circle_at_80%_80%,#10B981_0%,transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 flex flex-col items-start text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[12px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
            >
              For Accountants & CPAs
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8"
            >
              Scale your practice with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">CircleWorks.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl text-slate-300 mb-10 leading-relaxed font-normal"
            >
              Centralize your client management, automate high-frequency tasks, 
              and provide more strategic value with our all-in-one payroll and HR platform.
            </motion.p>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
               <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-emerald-900/40 transition-all text-center">
                  Join Accountant Portal
               </button>
               <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-10 rounded-xl border border-slate-700 transition-all text-center">
                  Request a Demo
               </button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:w-1/2 relative"
          >
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-2xl overflow-hidden">
               <div className="flex items-center justify-between mb-4 px-2">
                 <div className="flex gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                   <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                 </div>
                 <div className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Multi-Client Dashboard</div>
               </div>
               <div className="space-y-3">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded-lg group hover:border-emerald-500/50 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400">C{i}</div>
                       <div>
                         <div className="text-xs font-bold text-white leading-none mb-1">Acme Global {i}</div>
                         <div className="text-[10px] text-slate-500 font-medium">Payroll Due: Tomorrow</div>
                       </div>
                     </div>
                     <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded">ACTIVE</div>
                   </div>
                 ))}
               </div>
            </div>
            
            {/* Floating Accents */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-20">
          <h2 className="text-3xl lg:text-5xl font-black text-[#0A1628] mb-6 leading-tight">Everything you need to <span className="text-emerald-600">manage payroll</span> effectively.</h2>
          <p className="text-lg text-slate-600 font-medium">
            We built the CircleWorks Accountant Portal to eliminate the friction between tax preparation, 
            payroll execution, and HR reporting.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ACCOUNTANT_FEATURES.map((feature, index) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 border border-emerald-100">
                <feature.icon className="text-emerald-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#0A1628] mb-4">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed font-normal">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white border-y border-slate-100">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-[#0A1628] rounded-[40px] p-16 shadow-2xl relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
            
            <div className="relative z-10">
               <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">Ready to upgrade your practice?</h2>
               <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto font-medium">
                  Join over 2,500 accounting firms using CircleWorks to provide best-in-class payroll and HR solutions to their clients.
               </p>
               <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 px-12 rounded-2xl transition-all shadow-xl shadow-emerald-900/40">
                     Create Free Partner Account
                  </button>
                  <button className="bg-white hover:bg-slate-50 text-[#0A1628] font-bold py-5 px-12 rounded-2xl transition-all shadow-lg">
                     View Partner Benefits
                  </button>
               </div>
               <div className="mt-12 flex items-center justify-center gap-8 opacity-40">
                  <Laptop className="text-white" size={32} />
                  <BookOpen className="text-white" size={32} />
                  <Users className="text-white" size={32} />
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
