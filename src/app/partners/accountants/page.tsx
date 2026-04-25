"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Building2, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Search, 
  Award,
  PlayCircle,
  MapPin,
  Briefcase,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

// Mock Directory Data
const PARTNERS = [
  { 
    id: 1, 
    name: "Jane Smith, CPA", 
    firm: "Smith & Co Accounting", 
    location: "New York, NY", 
    specialties: ["Startups", "SaaS", "Tax Planning"] 
  },
  { 
    id: 2, 
    name: "Robert Johnson", 
    firm: "RJ Financial Advisors", 
    location: "Austin, TX", 
    specialties: ["Non-Profit", "Bookkeeping", "Payroll"] 
  },
  { 
    id: 3, 
    name: "Sarah Jenkins, CPA", 
    firm: "Jenkins Associates", 
    location: "Chicago, IL", 
    specialties: ["Retail", "Ecommerce", "Audit"] 
  },
  { 
    id: 4, 
    name: "Michael Chen", 
    firm: "Chen & Partners", 
    location: "San Francisco, CA", 
    specialties: ["Healthcare", "Tech", "Advisory"] 
  },
  { 
    id: 5, 
    name: "Amanda Davis", 
    firm: "Davis Bookkeeping", 
    location: "Denver, CO", 
    specialties: ["Small Business", "Real Estate"] 
  },
];

export default function AccountantPartnerPage() {
  // Directory state
  const [searchTerm, setSearchTerm] = useState("");
  
  // Application Form state
  const [formData, setFormData] = useState({
    name: "",
    firm: "",
    email: "",
    phone: "",
    clients: "1-10"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const filteredPartners = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return PARTNERS.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.firm.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term) ||
      p.specialties.some(s => s.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    
    try {
      const res = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", firm: "", email: "", phone: "", clients: "1-10" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error(error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToApply = () => {
    document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-900 dark:bg-[#0A1628]">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
          
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6"
            >
              <Award className="w-4 h-4" /> CircleWorks Partner Program
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto mb-6 leading-tight"
            >
              The payroll platform built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">accountants</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-300 max-w-2xl mx-auto mb-10"
            >
              Free dashboard, revenue share, and tools that make you look like a hero to your clients. Manage multiple businesses from one unified portal.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button 
                onClick={scrollToApply}
                className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Apply to Partner Program <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg transition-all flex items-center gap-2 border border-slate-700 w-full sm:w-auto justify-center">
                <PlayCircle className="w-5 h-5" /> Watch 2-min demo
              </button>
            </motion.div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to grow your practice</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">Join thousands of accountants who are standardizing on CircleWorks.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Benefit 1 */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Free Accountant Dashboard</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Get a single, unified view of all your clients. Switch between company accounts with one click without needing separate logins. Always free for accountants.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <BarChart3 className="w-32 h-32 text-emerald-600" />
                </div>
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Revenue Share</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">
                  Earn a highly competitive, recurring percentage for every active client you refer and manage on the platform. Build a predictable revenue stream.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Client Management Tools</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Run payroll in batches, generate consolidated cross-client reporting, and set up custom permission levels for your firm&apos;s staff.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#030712] relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">How the program works</h2>
              <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mb-6"></div>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                Four simple steps to transform your practice and unlock new revenue streams.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { step: "01", title: "Apply", desc: "Fill out the simple partner application form below to get started." },
                { step: "02", title: "Get Certified", desc: "Complete our free 2-hour CircleWorks certification course online." },
                { step: "03", title: "Onboard Clients", desc: "Work with a dedicated migration specialist to move your clients over." },
                { step: "04", title: "Earn", desc: "Start collecting your recurring revenue share from day one." }
              ].map((item) => (
                <div key={item.step} className="relative group">
                  {/* Background Number with better contrast */}
                  <div className="text-8xl font-black text-slate-200/60 dark:text-slate-800/60 mb-2 transition-all duration-500 group-hover:text-blue-600/20 dark:group-hover:text-blue-400/20 select-none group-hover:scale-110 group-hover:-translate-x-2">
                    {item.step}
                  </div>
                  
                  {/* Decorative Bar */}
                  <div className="absolute top-14 left-0 w-12 h-1.5 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-300 group-hover:w-20"></div>
                  
                  {/* Content */}
                  <div className="pt-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CERTIFICATION */}
        <section className="py-20 bg-blue-600 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="flex-1 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-semibold mb-6 backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4" /> Certification Program
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Become a Certified Expert</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl">
                Master the platform with our 2-hour self-paced online course. You&apos;ll learn how to set up new accounts, run advanced reports, and troubleshoot common payroll scenarios.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-blue-300 w-5 h-5" /> Receive the official &quot;CircleWorks Certified&quot; badge</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-blue-300 w-5 h-5" /> Placement in our public Partner Directory</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-blue-300 w-5 h-5" /> Continuing Professional Education (CPE) credits</li>
              </ul>
            </div>
            <div className="w-full md:w-1/3">
              <div className="bg-white rounded-3xl p-8 text-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">CircleWorks Certified</h3>
                <p className="text-slate-500 text-sm mt-1 mb-4">Partner Program 2026</p>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col lg:flex-row gap-16">
          
          {/* PARTNER DIRECTORY */}
          <section className="flex-1">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Partner Directory</h2>
                <p className="text-slate-600 dark:text-slate-400">Find a CircleWorks Certified Accountant near you.</p>
              </div>
              <button 
                onClick={scrollToApply}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                List your firm here &rarr;
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, firm, location, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredPartners.length > 0 ? (
                filteredPartners.map(partner => (
                  <div key={partner.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                          {partner.name} <Award className="w-4 h-4 text-blue-500" />
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">{partner.firm}</p>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full w-fit">
                        <MapPin className="w-4 h-4" /> {partner.location}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {partner.specialties.map(spec => (
                        <span key={spec} className="text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-800/30">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No partners found matching &quot;{searchTerm}&quot;</p>
                </div>
              )}
            </div>
          </section>

          {/* APPLICATION FORM */}
          <section id="apply-form" className="w-full lg:w-[450px] shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Apply to Partner</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm">Fill out the form below to initiate your application process. Our team will reach out within 24 hours.</p>
              
              {submitStatus === "success" ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-emerald-900 dark:text-emerald-300 mb-2">Application Received!</h3>
                  <p className="text-emerald-700 dark:text-emerald-400/80 text-sm">We&apos;ll be in touch shortly to get you started with the certification program.</p>
                  <button 
                    onClick={() => setSubmitStatus("idle")}
                    className="mt-6 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    Submit another application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Firm Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.firm}
                      onChange={(e) => setFormData({...formData, firm: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      placeholder="Doe Accounting"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                        placeholder="jane@firm.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                      <input 
                        required
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Number of Payroll Clients</label>
                    <select 
                      value={formData.clients}
                      onChange={(e) => setFormData({...formData, clients: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    >
                      <option value="1-10">1 - 10 clients</option>
                      <option value="11-25">11 - 25 clients</option>
                      <option value="26-50">26 - 50 clients</option>
                      <option value="51-100">51 - 100 clients</option>
                      <option value="101+">101+ clients</option>
                    </select>
                  </div>
                  
                  {submitStatus === "error" && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                      An error occurred submitting your application. Please try again.
                    </div>
                  )}
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
                    By applying, you agree to our <a href="/terms" className="underline">Partner Terms of Service</a>.
                  </p>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
