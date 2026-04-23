"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, User, PlayCircle, Download, CheckCircle2, ChevronRight } from "lucide-react";

export default function WebinarsClient({ initialWebinars }: { initialWebinars: any[] }) {
  const [activeTab, setActiveTab] = useState("All");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLeadGateOpen, setIsLeadGateOpen] = useState(false);
  const [selectedWebinar, setSelectedWebinar] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", email: "", company: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const upcomingWebinars = initialWebinars.filter(w => w.type === "upcoming");
  const onDemandWebinars = initialWebinars.filter(w => w.type === "ondemand");

  const filteredOnDemand = activeTab === "All" 
    ? onDemandWebinars 
    : onDemandWebinars.filter(w => w.topics.includes(activeTab));

  const tabs = ["All", "Payroll", "Compliance", "HR Tips", "Product Demo"];

  const handleRegisterClick = (webinar: any) => {
    setSelectedWebinar(webinar);
    setIsRegisterModalOpen(true);
    setIsSuccess(false);
  };

  const handleWatchClick = (webinar: any) => {
    setSelectedWebinar(webinar);
    setIsLeadGateOpen(true);
    setIsSuccess(false);
  };

  const generateICS = (webinar: any) => {
    const startDate = new Date(webinar.date);
    const durationMatch = webinar.duration.match(/\d+/);
    const durationMins = durationMatch ? parseInt(durationMatch[0]) : 60;
    const endDate = new Date(startDate.getTime() + durationMins * 60000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${webinar.title}
DESCRIPTION:${webinar.description}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${webinar.slug}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent, type: "register" | "lead") => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/webinars/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, webinarId: selectedWebinar?.id, type })
      });
      
      if (res.ok) {
        setIsSuccess(true);
        if (type === "lead" && selectedWebinar?.videoUrl) {
           // In a real app, you might route to the video or show it inline.
           // For this demo, we just show a success message.
           setTimeout(() => {
              window.location.href = `/webinars/${selectedWebinar.slug}`;
           }, 1500);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* HERO SECTION */}
      <section className="bg-[#0A1628] pt-32 pb-24 text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
          Webinars & Events
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Join our expert-led sessions to master payroll, HR, and compliance. Learn best practices and stay ahead of regulatory changes.
        </p>
      </section>

      {/* UPCOMING WEBINARS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-[#0A1628] mb-12 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          Upcoming Webinars
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {upcomingWebinars.map(webinar => (
            <div key={webinar.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col group">
              <div className="h-48 overflow-hidden relative">
                <img src={webinar.thumbnail} alt={webinar.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 flex gap-2">
                  {webinar.topics.map((t: string) => (
                    <span key={t} className="bg-white/90 backdrop-blur text-[#0A1628] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-[#0A1628] mb-4">
                  <Link href={`/webinars/${webinar.slug}`} className="hover:text-blue-600 transition-colors">
                    {webinar.title}
                  </Link>
                </h3>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-slate-500 font-medium">
                    <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                    {new Date(webinar.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                  </div>
                  <div className="flex items-center text-slate-500 font-medium">
                    <Clock className="w-5 h-5 mr-3 text-blue-500" />
                    {webinar.duration}
                  </div>
                  <div className="flex items-center text-slate-500 font-medium">
                    <User className="w-5 h-5 mr-3 text-blue-500" />
                    {webinar.speaker}
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap gap-4">
                  <button 
                    onClick={() => handleRegisterClick(webinar)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                  >
                    Register Free
                  </button>
                  <button 
                    onClick={() => generateICS(webinar)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span className="sr-only sm:not-sr-only">Add to Calendar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ON-DEMAND LIBRARY */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-black text-[#0A1628] mb-4 flex items-center gap-3">
                <PlayCircle className="w-8 h-8 text-blue-600" />
                On-Demand Library
              </h2>
              <p className="text-slate-500 text-lg">Watch our previous sessions anytime, anywhere.</p>
            </div>
            
            {/* TABS */}
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                    activeTab === tab 
                      ? "bg-[#0A1628] text-white" 
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {filteredOnDemand.map(webinar => (
              <div key={webinar.id} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-shadow group flex flex-col">
                <div className="h-48 overflow-hidden relative cursor-pointer" onClick={() => handleWatchClick(webinar)}>
                  <img src={webinar.thumbnail} alt={webinar.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                    {webinar.duration}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-[#0A1628] mb-3 leading-tight">
                    <Link href={`/webinars/${webinar.slug}`} className="hover:text-blue-600 transition-colors">
                      {webinar.title}
                    </Link>
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {webinar.topics.map((t: string) => (
                      <span key={t} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                        {t}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => handleWatchClick(webinar)}
                    className="mt-auto text-blue-600 font-bold flex items-center gap-1 group/btn"
                  >
                    Watch Now 
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-6">Want to stay in the loop?</h2>
          <p className="text-xl text-blue-100 mb-10">Join our mailing list to get early invites to upcoming webinars, or suggest a topic you'd like us to cover.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button className="bg-white text-blue-600 px-8 py-4 font-bold rounded-xl shadow-xl hover:-translate-y-1 transition-transform">
                Join Mailing List
             </button>
             <button className="bg-transparent border-2 border-white/30 text-white px-8 py-4 font-bold rounded-xl hover:bg-white/10 transition-colors">
                Suggest a Topic
             </button>
          </div>
        </div>
      </section>

      {/* REGISTRATION MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsRegisterModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
            
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#0A1628] mb-2">You're Registered!</h3>
                <p className="text-slate-500">We've sent a calendar invite and confirmation to your email.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-[#0A1628] mb-2">Register for Webinar</h3>
                <p className="text-slate-500 mb-6 font-medium">{selectedWebinar?.title}</p>
                
                <form onSubmit={(e) => handleSubmit(e, "register")} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Work Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="jane@company.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Company Name</label>
                    <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="Acme Corp" />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors mt-2">
                    {isSubmitting ? "Registering..." : "Complete Registration"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* LEAD GATE MODAL */}
      {isLeadGateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsLeadGateOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
            
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PlayCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#0A1628] mb-2">Unlocking Video...</h3>
                <p className="text-slate-500">Redirecting you to the webinar session.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-[#0A1628] mb-2">Watch On-Demand</h3>
                <p className="text-slate-500 mb-6 font-medium">Please enter your details to access this exclusive content.</p>
                
                <form onSubmit={(e) => handleSubmit(e, "lead")} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Work Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="jane@company.com" />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-[#0A1628] hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors mt-2">
                    {isSubmitting ? "Unlocking..." : "Watch Video Now"}
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
