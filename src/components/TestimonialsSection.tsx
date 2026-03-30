"use client";

import React, { useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

// --- Mock Data ---

const FEATURED_QUOTES = [
  {
    quote: "Switching to CircleWorks was the best operational decision we've made this year. We replaced five disjointed tools with one platform, completely eliminating manual data entry across our HR stack.",
    name: "Sarah Jenkins",
    title: "VP of People Operations",
    company: "Acme Corp",
  },
  {
    quote: "The compliant onboarding workflows alone saved us countless hours. We hired 40 people across 12 states last quarter and CircleWorks handled all the local state tax registrations automatically without us lifting a finger.",
    name: "David Rodriguez",
    title: "Chief Financial Officer",
    company: "TechFlow Solutions",
  },
  {
    quote: "Our employees absolutely love the intuitive mobile experience. They can track their time, request PTO, and access their paystubs entirely from their phones. It's transformed our internal satisfaction metrics dramatically.",
    name: "Emily Chen",
    title: "Director of HR",
    company: "BrightStar Retail",
  }
];

const GRID_QUOTES = [
  {
    quote: "CircleWorks is incredibly intuitive. I had our new benefits program configured and deeply integrated directly with payroll deductions within 48 hours. Phenomenal platform.",
    name: "Marcus Thorne",
    role: "HR Business Partner",
    company: "Nexus Dynamics"
  },
  {
    quote: "The built-in ATS pipeline completely changed how we hire. Moving candidates from applied to screened to hired is seamless, and their employee profiles are automatically generated upon offer acceptance.",
    name: "Anna Pavlova",
    role: "Talent Acquisition",
    company: "Elevate AI"
  },
  {
    quote: "Compliance used to keep me up at night. Now, CircleWorks proactively flags potential overtime violations and minimum wage updates before we even run the bi-weekly preview. A lifesaver.",
    name: "Robert Gaines",
    role: "Operations Manager",
    company: "Summit Logistics"
  },
   {
    quote: "Running payroll across 15 states used to take our accounting team three full days. With CircleWorks, we literally click three buttons and our entire workforce is paid correctly within minutes.",
    name: "Lisa Wong",
    role: "Controller",
    company: "Apex Healthcare"
  },
    {
    quote: "The time tracking integration is flawless. Our hourly employees clock in via the app, and managers approve timesheets with one click. It eliminates all manual spreadsheet errors.",
    name: "Thomas Keller",
    role: "General Manager",
    company: "FreshFoods Inc"
  },
    {
    quote: "We were paying for a separate expensive HRIS, benefits broker, and payroll provider. CircleWorks consolidated all of it into one beautiful interface for half the total price.",
    name: "Samantha Reed",
    role: "Founder & CEO",
    company: "Starlight Digital"
  }
];

const PLATFORMS = [
  { name: "G2", color: "text-orange-500", rating: "4.8/5", reviews: 342, desc: "High Performer 2025" },
  { name: "Capterra", color: "text-blue-500", rating: "4.9/5", reviews: 120, desc: "Best Ease of Use" },
  { name: "Trustpilot", color: "text-emerald-500", rating: "4.7/5", reviews: 450, desc: "Excellent Rating" }
];

// --- Utilities ---

const getCompanyColor = (name: string) => {
  const colors = [
    "bg-rose-500", "bg-blue-500", "bg-emerald-500", 
    "bg-amber-500", "bg-purple-500", "bg-cyan-500", 
    "bg-indigo-500", "bg-teal-500"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const StarRating = () => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={16} fill="currentColor" className="text-yellow-400" />
    ))}
  </div>
);

// --- Component ---

export default function TestimonialsSection() {
  const [featuredIdx, setFeaturedIdx] = useState(0);

  const handleNext = () => {
    setFeaturedIdx((prev) => (prev + 1) % FEATURED_QUOTES.length);
  };

  const handlePrev = () => {
    setFeaturedIdx((prev) => (prev - 1 + FEATURED_QUOTES.length) % FEATURED_QUOTES.length);
  };

  const currentFeatured = FEATURED_QUOTES[featuredIdx];

  return (
    <section className="bg-slate-50 py-24 w-full border-t border-slate-200">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tight">
            What USA companies say
          </h2>
        </div>

        {/* FEATURED TESTIMONIAL (No Auto-play) */}
        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10 mb-24">
          
          {/* Giant Quote Icon Decorator */}
          <div className="absolute -top-12 -left-4 md:-left-12 z-0">
            <Quote size={120} className="fill-blue-600/10 text-transparent" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-4 md:px-12 w-full min-h-[220px]">
            <StarRating />

            {/* Transition Wrapper */}
            <div key={featuredIdx} className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center w-full mt-6">
              
              <blockquote className="text-[20px] md:text-[24px] text-slate-900 font-medium leading-relaxed max-w-3xl mb-8">
                &ldquo;{currentFeatured.quote}&rdquo;
              </blockquote>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-[18px] border-2 border-white shadow-sm overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('https://ui-avatars.com/api/?name=${currentFeatured.name.replace(" ", "+")}&background=random&color=fff&size=48')` }} />
                
                <div className="flex flex-col sm:items-start items-center">
                  <span className="font-bold text-slate-900">{currentFeatured.name}</span>
                  <div className="text-[14px] text-slate-500 flex items-center gap-2">
                    {currentFeatured.title} 
                    <span className="hidden sm:block">&middot;</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white ${getCompanyColor(currentFeatured.company)}`}>
                        {currentFeatured.company.charAt(0)}
                      </div>
                      {currentFeatured.company}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Manual Carousel Controls */}
          <div className="flex items-center gap-4 mt-10">
            <button 
              onClick={handlePrev}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1.5">
              {FEATURED_QUOTES.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setFeaturedIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${featuredIdx === i ? "bg-blue-600 w-6" : "bg-slate-300 hover:bg-slate-400"}`}
                />
              ))}
            </div>
            <button 
              onClick={handleNext}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* TESTIMONIAL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {GRID_QUOTES.map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              
              <div className="flex flex-col gap-4">
                <StarRating />
                <p className="text-[16px] text-slate-700 leading-relaxed line-clamp-4 min-h-[96px]">
                  "{card.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 mt-8 border-t border-slate-100 pt-5">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-[14px] border border-white shadow-sm bg-cover bg-center" style={{ backgroundImage: `url('https://ui-avatars.com/api/?name=${card.name.replace(" ", "+")}&background=random&color=fff&size=40')` }} />
                
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="font-bold text-slate-900 text-[14px] truncate">{card.name}</span>
                  <div className="text-[12px] text-slate-500 truncate">{card.role}</div>
                </div>
                
                {/* Company Badge */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 ml-auto whitespace-nowrap">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black text-white ${getCompanyColor(card.company)}`}>
                    {card.company.charAt(0)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-600">{card.company}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* REVIEW PLATFORMS ROW */}
        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12 pt-12 border-t border-slate-200">
          {PLATFORMS.map((platform) => (
            <div key={platform.name} className="flex flex-col items-center sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm w-full sm:w-auto">
              
              {/* Fake Platform Logo Wrapper */}
              <div className={`text-[24px] font-black tracking-tighter w-[100px] text-center ${platform.color} flex items-center justify-center gap-1`}>
                <CheckCircle size={20} className="fill-current text-white border border-current rounded-full p-[2px]" />
                {platform.name}
              </div>

              <div className="w-px h-10 bg-slate-200 hidden sm:block" />

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-[18px]">{platform.rating}</span>
                  <div className="flex items-center">
                     {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" className={platform.color.replace('text-', 'text-').replace('-500', '-400')} />
                     ))}
                  </div>
                </div>
                <div className="text-[12px] text-slate-500 font-medium mt-0.5">
                  {platform.desc} &middot; Based on {platform.reviews} reviews
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
