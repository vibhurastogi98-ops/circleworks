"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileCode2, Terminal, Cpu, Globe, Lock, Workflow, ArrowRight, Zap, Copy, Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const API_RESOURCES = [
  {
    title: "Authentication",
    desc: "Learn how to authenticate your API requests using our proprietary Bearer token system.",
    icon: Lock,
    href: "#auth"
  },
  {
    title: "Payroll API",
    desc: "Endpoints to trigger payroll runs, fetch paystubs, and manage employee bank details.",
    icon: Zap,
    href: "#payroll"
  },
  {
    title: "HRIS Sync",
    desc: "Synchronize employee data across your entire tech stack with real-time webhooks.",
    icon: Workflow,
    href: "#hris"
  },
  {
    title: "Compliance Webhooks",
    desc: "Receive automated alerts for tax filing statuses and regulatory updates.",
    icon: Cpu,
    href: "#webhooks"
  }
];

export default function DocsPage() {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText('curl -X GET "https://api.circleworks.com/v1/employees" \\\n  -H "Authorization: Bearer {YOUR_API_KEY}"');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0A1628] font-sans selection:bg-blue-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
              >
                <Terminal size={14} /> Developer Portal
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6"
              >
                Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">builders.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg lg:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl"
              >
                Integrate high-fidelity payroll and HR functionality into your own application with a few lines of code. Restful, reliable, and ridiculously fast.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="#reference" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
                  Read API Reference <ArrowRight size={18} />
                </Link>
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold rounded-xl transition-all">
                  Get API Key
                </button>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="lg:w-1/2 w-full"
            >
              <div className="bg-[#0D1D35] rounded-3xl p-1 border border-white/10 shadow-2xl relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur opacity-50 rounded-3xl" />
                
                <div className="relative bg-[#0A1628] rounded-[22px] overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50" />
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Quickstart.sh</div>
                  </div>
                  
                  <div className="p-8 font-mono text-sm leading-relaxed overflow-x-auto">
                    <div className="flex items-center gap-3 mb-4 text-emerald-400">
                      <Check size={16} /> <span># Fetch all employees with active payroll</span>
                    </div>
                    <div className="text-white">
                      <span className="text-blue-400">curl</span> -X GET <span className="text-cyan-300">&quot;https://api.circleworks.com/v1/employees&quot;</span> \
                    </div>
                    <div className="text-white ml-8">
                      -H <span className="text-cyan-300">&quot;Authorization: Bearer {'{YOUR_API_KEY}'}&quot;</span>
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-white/5">
                      <div className="text-slate-500 mb-2">// Response 200 OK</div>
                      <div className="text-white">
                        <span className="text-pink-400">{'{'}</span>
                      </div>
                      <div className="ml-4 text-white">
                         <span className="text-blue-400">&quot;status&quot;</span>: <span className="text-cyan-300">&quot;success&quot;</span>,
                      </div>
                      <div className="ml-4 text-white">
                         <span className="text-blue-400">&quot;data&quot;</span>: <span className="text-pink-400">[</span>
                      </div>
                      <div className="ml-8 text-white">
                         <span className="text-pink-400">{'{'}</span> <span className="text-blue-400">&quot;id&quot;</span>: <span className="text-orange-300">1024</span>, <span className="text-blue-400">&quot;name&quot;</span>: <span className="text-cyan-300">&quot;Elena Rossi&quot;</span> <span className="text-pink-400">{'}'}</span>,
                      </div>
                      <div className="ml-4 text-white">
                         <span className="text-pink-400">]</span>
                      </div>
                      <div className="text-white">
                        <span className="text-pink-400">{'}'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={copyCode}
                    className="absolute bottom-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-all border border-white/10"
                  >
                    {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-24 bg-[#0A1628]" id="reference">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-black text-white mb-4">Core Resources</h2>
            <p className="text-slate-400 max-w-2xl font-medium">Everything you need to build powerful extensions and custom HR flows on top of CircleWorks.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {API_RESOURCES.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white/[0.03] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.05] hover:border-blue-500/30 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{item.desc}</p>
                <div className="text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                  Read More <ArrowRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SDK Section */}
      <section className="py-24 bg-[#0A1628] border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { name: "Node.js", version: "v1.4.2", color: "from-emerald-500 to-green-600" },
                   { name: "Python", version: "v1.1.0", color: "from-blue-500 to-indigo-600" },
                   { name: "Go", version: "v0.9.0", color: "from-cyan-400 to-blue-500" },
                   { name: "Ruby", version: "v1.0.4", color: "from-rose-500 to-red-600" }
                 ].map((sdk, i) => (
                   <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center hover:bg-white/[0.04] transition-colors">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sdk.color} mb-4 flex items-center justify-center text-white font-black`}>
                         {sdk.name[0]}
                      </div>
                      <div className="text-white font-bold">{sdk.name}</div>
                      <div className="text-[10px] font-black text-slate-500 uppercase mt-1">{sdk.version}</div>
                   </div>
                 ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 order-1 lg:order-2">
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-tight">Official Client <span className="text-blue-500">Libraries.</span></h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed font-medium">
                Spend less time writing boilerplate and more time building features. Our official SDKs take care of retries, timeouts, and authentication for you.
              </p>
              <div className="flex flex-col gap-4">
                 {[
                   "Auto-complete for all API methods",
                   "Built-in TypeScript and Python types",
                   "Optimized for high-concurrency environments"
                 ].map((feat, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                         <Check size={12} />
                      </div>
                      <span className="text-slate-300 font-medium">{feat}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-[#0A1628] to-[#0D1D35]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-12 lg:p-20 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-600 relative overflow-hidden shadow-2xl shadow-blue-500/20"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-tight">Ready to start building?</h2>
              <p className="text-lg text-blue-100 mb-10 opacity-80 font-medium">Apply for early API access and get $500 in processing credits for your first project.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="px-10 py-5 bg-white text-blue-600 font-bold rounded-2xl hover:scale-105 transition-all shadow-xl">
                  Create API Key
                </button>
                <button className="px-10 py-5 bg-blue-700/50 text-white font-bold rounded-2xl hover:bg-blue-700/70 border border-white/20 transition-all">
                  Join our Discord
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
