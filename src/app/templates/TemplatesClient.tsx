"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, FileText, Download, Filter, FileSpreadsheet, CheckCircle2 } from "lucide-react";

export default function TemplatesClient({ initialTemplates }: { initialTemplates: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeType, setActiveType] = useState("All");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ firstName: "", email: "", companySize: "" });
  const [hasCookie, setHasCookie] = useState(false);

  useEffect(() => {
    // Check if user has previously downloaded (using a simple localStorage flag for demo)
    const cookie = localStorage.getItem("cw_template_access");
    if (cookie) setHasCookie(true);
  }, []);

  const categories = ["All", "Offer Letters", "Onboarding", "Policies", "Payroll", "Compliance"];
  const types = ["All", "Word (.docx)", "PDF", "Excel (.xlsx)"];

  const filteredTemplates = initialTemplates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    const matchesType = activeType === "All" || t.type === activeType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleDownloadClick = (template: any) => {
    if (hasCookie) {
      // Trigger download immediately
      alert(`Downloading ${template.title}...`);
      return;
    }
    setSelectedTemplate(template);
    setIsModalOpen(true);
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/templates/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, templateId: selectedTemplate?.id })
      });
      
      if (res.ok) {
        setIsSuccess(true);
        localStorage.setItem("cw_template_access", formData.email);
        setHasCookie(true);
        // Simulate auto-download
        setTimeout(() => {
          alert(`Downloading ${selectedTemplate.title}...`);
          setIsModalOpen(false);
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type: string) => {
    if (type.includes("Word")) return <FileText className="w-8 h-8 text-blue-500" />;
    if (type.includes("Excel")) return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
    return <FileText className="w-8 h-8 text-red-500" />;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* HERO SECTION */}
      <section className="bg-[#0A1628] pt-32 pb-24 text-center px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Free HR Templates & Resources
          </h1>
          <p className="text-xl text-slate-300 mb-10">
            Download expert-crafted policies, checklists, and agreements to scale your HR operations effortlessly.
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search templates (e.g. Offer Letter, Non-Disclosure...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-4 py-5 rounded-2xl bg-white border-0 focus:ring-4 focus:ring-blue-500/50 outline-none text-lg text-[#0A1628] font-medium shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR */}
          <div className="lg:w-64 shrink-0 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 font-black text-[#0A1628] mb-4 text-lg">
                <Filter className="w-5 h-5" />
                Categories
              </div>
              <ul className="space-y-2">
                {categories.map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                        activeCategory === cat ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0A1628]"
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="font-black text-[#0A1628] mb-4 text-lg">File Type</div>
              <ul className="space-y-2">
                {types.map(type => (
                  <li key={type}>
                    <button 
                      onClick={() => setActiveType(type)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                        activeType === type ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#0A1628]"
                      }`}
                    >
                      {type}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* TEMPLATE GRID */}
          <div className="flex-1">
            <div className="mb-6 text-slate-500 font-medium">
              Showing {filteredTemplates.length} templates
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#0A1628] mb-2">No templates found</h3>
                <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                        {getIcon(template.type)}
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">
                        {template.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#0A1628] mb-2 leading-tight">
                      <Link href={`/templates/${template.slug}`} className="hover:text-blue-600 transition-colors">
                        {template.title}
                      </Link>
                    </h3>
                    
                    <p className="text-slate-500 text-sm mb-6 flex-1">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-400">
                        {template.type}
                      </span>
                      <button 
                        onClick={() => handleDownloadClick(template)}
                        className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:text-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download Free
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DOWNLOAD GATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
            
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#0A1628] mb-2">Check Your Inbox!</h3>
                <p className="text-slate-500">We've sent the download link to {formData.email}. The download will also start automatically.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                   <div className="p-4 bg-blue-50 rounded-full text-blue-600">
                     <Download className="w-8 h-8" />
                   </div>
                </div>
                <h3 className="text-2xl font-bold text-[#0A1628] text-center mb-2">Get Your Free Template</h3>
                <p className="text-slate-500 text-center mb-6 font-medium text-sm">
                  Enter your details to download the <strong>{selectedTemplate?.title}</strong> and join 10,000+ HR professionals getting our weekly insights.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                    <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="Jane" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Work Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="jane@company.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Company Size</label>
                    <select required value={formData.companySize} onChange={e => setFormData({...formData, companySize: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-700 bg-white">
                      <option value="" disabled>Select company size...</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201+">201+ employees</option>
                    </select>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors mt-2">
                    {isSubmitting ? "Sending..." : "Download Free Template"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
