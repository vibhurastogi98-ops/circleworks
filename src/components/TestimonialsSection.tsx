"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

const featuredTestimonials = [
  {
    quote: "CircleWorks gave our HR and finance teams one calm place to run payroll, onboard employees, and stay compliant across multiple states. We went from days of manual work to a clean weekly workflow.",
    name: "Jordan Mills",
    title: "VP of Operations",
    company: "Northstar Supply Co.",
    logo: "N",
  },
  {
    quote: "The biggest win is confidence. Payroll, direct deposit, tax forms, and onboarding all stay in sync, so our managers can focus on people instead of chasing spreadsheets.",
    name: "Alyssa Grant",
    title: "Head of People",
    company: "Summit Ridge Health",
    logo: "S",
  },
  {
    quote: "CircleWorks replaced three separate systems for us. Our employees get a better self-service experience, and our back office finally has reliable reporting.",
    name: "Marcus Reed",
    title: "Chief Financial Officer",
    company: "Harborline Logistics",
    logo: "H",
  },
];

const gridTestimonials = [
  {
    quote: "We run payroll for hourly and salaried teams in five states. CircleWorks made the entire process faster and much easier to audit.",
    name: "Priya Shah",
    role: "Controller",
    company: "Blue Oak Dental",
  },
  {
    quote: "Employee onboarding used to mean a long checklist across email, payroll, and docs. Now new hires have one clear path from offer to first paycheck.",
    name: "Daniel Brooks",
    role: "People Operations Manager",
    company: "Lakefront Brands",
  },
  {
    quote: "The employee portal is simple enough that our team actually uses it. Time off, documents, payment details, and profile updates are all in one place.",
    name: "Maya Henderson",
    role: "HR Director",
    company: "CedarWorks Manufacturing",
  },
  {
    quote: "CircleWorks gives our leadership team live visibility into payroll cost and headcount without asking finance to pull another custom report.",
    name: "Owen Parker",
    role: "COO",
    company: "BrightPath Services",
  },
  {
    quote: "We needed something built for a modern distributed company. Multi-state compliance and employee self-service were ready from day one.",
    name: "Elena Torres",
    role: "Founder",
    company: "Mesa Cloud",
  },
  {
    quote: "Implementation was refreshingly direct. We moved employee data, set up payroll, and started onboarding new team members without a huge consulting project.",
    name: "Ben Caldwell",
    role: "Finance Lead",
    company: "Redwood Field Co.",
  },
];

const platforms = [
  { name: "G2", rating: "4.8/5", count: "Based on 342 reviews", color: "bg-orange-500" },
  { name: "Capterra", rating: "4.9/5", count: "Based on 342 reviews", color: "bg-blue-500" },
  { name: "Trustpilot", rating: "4.7/5", count: "Based on 342 reviews", color: "bg-emerald-500" },
];

function companyColor(name: string) {
  const colors = [
    "bg-blue-600",
    "bg-emerald-600",
    "bg-rose-600",
    "bg-amber-600",
    "bg-indigo-600",
    "bg-cyan-600",
    "bg-slate-700",
    "bg-violet-600",
  ];
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function Stars({ size = 16 }: { size?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label="5 star rating">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={size} className="fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

function PersonAvatar({ name, size = "h-12 w-12" }: { name: string; size?: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-sm`}>
      {initials}
    </div>
  );
}

function CompanyBadge({ company }: { company: string }) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white ${companyColor(company)}`}>
        {company[0]}
      </span>
      <span className="truncate text-xs font-bold text-slate-700">{company}</span>
    </div>
  );
}

export function TestimonialsSection() {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featured = featuredTestimonials[featuredIndex];

  const featuredAvatar = useMemo(() => (
    <PersonAvatar name={featured.name} />
  ), [featured.name]);

  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mb-14 text-center">
          <h2 className="text-[40px] font-bold leading-tight tracking-tight text-gray-900">
            What USA companies say
          </h2>
        </header>

        <div className="mx-auto mb-20 max-w-3xl text-center">
          <div className="relative px-4 py-6">
            <Quote
              size={120}
              className="pointer-events-none absolute -left-5 -top-8 z-0 fill-blue-600 text-blue-600 opacity-20"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col items-center">
              <Stars size={20} />
              <blockquote className="mt-6 whitespace-pre-line text-[24px] font-medium leading-relaxed text-gray-900">
                &ldquo;{featured.quote}&rdquo;
              </blockquote>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:text-left">
                {featuredAvatar}
                <div>
                  <div className="text-sm font-bold text-gray-900">{featured.name}</div>
                  <div className="text-sm text-gray-600">
                    {featured.title} · {featured.company}
                  </div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-black text-white ${companyColor(featured.company)}`}>
                  {featured.logo}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setFeaturedIndex((index) => (index - 1 + featuredTestimonials.length) % featuredTestimonials.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-blue-600"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {featuredTestimonials.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setFeaturedIndex(index)}
                  className={`h-2 rounded-full transition-all ${index === featuredIndex ? "w-7 bg-blue-600" : "w-2 bg-slate-300 hover:bg-slate-400"}`}
                  aria-label={`Show testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFeaturedIndex((index) => (index + 1) % featuredTestimonials.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-blue-600"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gridTestimonials.map((testimonial) => (
            <article key={`${testimonial.name}-${testimonial.company}`} className="rounded-xl bg-white p-6 shadow-sm">
              <Stars />
              <p className="mt-4 line-clamp-4 min-h-[96px] text-[16px] leading-6 text-gray-700">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <PersonAvatar name={testimonial.name} size="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-gray-900">{testimonial.name}</div>
                  <div className="truncate text-xs text-gray-500">
                    {testimonial.role} · {testimonial.company}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <CompanyBadge company={testimonial.company} />
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-stretch justify-center gap-4 border-t border-slate-200 pt-10 sm:flex-row sm:flex-wrap">
          {platforms.map((platform) => (
            <div key={platform.name} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-black text-white ${platform.color}`}>
                {platform.name[0]}
              </div>
              <div>
                <div className="text-sm font-black text-gray-900">
                  {platform.name} <span className="font-bold text-slate-600">{platform.rating}</span>
                </div>
                <div className="text-xs font-medium text-slate-500">{platform.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
