"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BookOpen,
  BriefcaseBusiness,
  CalendarHeart,
  HeartPulse,
  MapPin,
  MonitorCheck,
  Mountain,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getJobsByDepartment, type Role } from "@/data/careers";

const culturePhotos = [
  {
    src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
    alt: "CircleWorks teammates planning product work around a conference table",
  },
  {
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    alt: "CircleWorks team members collaborating in a bright office",
  },
  {
    src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
    alt: "CircleWorks remote-first team workshop",
  },
];

const perks = [
  { title: "Remote-first", icon: MonitorCheck, description: "Work from where you do your best thinking, with intentional in-person moments." },
  { title: "Competitive pay + equity", icon: BadgeDollarSign, description: "Strong salary bands and ownership for people building the company." },
  { title: "Full benefits", icon: HeartPulse, description: "Medical, dental, vision, mental health support, and family-friendly coverage." },
  { title: "Learning budget", icon: BookOpen, description: "Annual funds for courses, books, conferences, and role-specific growth." },
  { title: "Unlimited PTO", icon: CalendarHeart, description: "Flexible time away, manager-supported rest, and space for real life." },
  { title: "Team retreats", icon: Mountain, description: "Company gatherings built around planning, trust, and a little fun." },
];

const departmentLabels: Record<Role["department"], string> = {
  Engineering: "Engineering",
  Product: "Product",
  Sales: "Sales",
  CS: "Customer Success",
  HR: "HR",
};

export default function CareersPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const jobsByDepartment = getJobsByDepartment();

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-[#0A1628]">
      <Navbar />

      <section className="pt-32 pb-20 lg:pt-40 lg:pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-700 mb-6">
                <Sparkles size={14} />
                Careers at CircleWorks
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#0A1628] leading-[1.02] tracking-tight">
                Build the future of American HR
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-8 max-w-xl">
                Join a team building payroll, HR, compliance, and workforce tools for the companies that keep America moving.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href="#open-roles" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors">
                  View Open Roles
                  <ArrowRight size={16} />
                </a>
                <a href="#culture-video" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-bold text-[#0A1628] hover:border-blue-200 hover:text-blue-700 transition-colors">
                  Watch Culture Video
                  <Play size={16} />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 h-[360px] sm:h-[430px]">
              {culturePhotos.map((photo, index) => (
                <div key={photo.src} className={`overflow-hidden rounded-lg border border-slate-200 bg-slate-100 ${index === 1 ? "mt-8 mb-8" : ""}`}>
                  <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-[#0A1628] tracking-tight">Perks Built For Sustainable Work</h2>
            <p className="mt-4 text-slate-600 leading-7">We care about high standards and humane pacing. The benefits are designed to support both.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-5">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0A1628]">{perk.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{perk.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="open-roles" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-[#0A1628] tracking-tight">Open Roles</h2>
              <p className="mt-3 text-slate-600">Find the team where your work can matter most.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
              <BriefcaseBusiness size={16} />
              {Object.values(jobsByDepartment).flat().length} open roles
            </div>
          </div>

          <div className="space-y-8">
            {(Object.keys(jobsByDepartment) as Role["department"][]).map((department) => {
              const roles = jobsByDepartment[department];
              if (!roles.length) return null;
              return (
                <div key={department} className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
                    <Users size={18} className="text-blue-700" />
                    <h3 className="text-base font-black text-[#0A1628]">{departmentLabels[department]}</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {roles.map((role) => (
                      <div key={role.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
                        <div>
                          <h4 className="text-xl font-bold text-[#0A1628]">{role.title}</h4>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 font-medium">
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={14} />
                              {role.location}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span>{role.type}</span>
                          </div>
                        </div>
                        <Link href={`/careers/${role.slug}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                          Apply Now
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="culture-video" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl lg:text-4xl font-black text-[#0A1628] tracking-tight">How We Work Together</h2>
            <p className="mt-4 text-slate-600 leading-7">A short look at the rituals, collaboration style, and customer obsession behind CircleWorks.</p>
          </div>
          <div className="aspect-video overflow-hidden rounded-lg border border-slate-200 bg-[#0A1628] shadow-sm">
            {isVideoOpen ? (
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="CircleWorks culture video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <button type="button" onClick={() => setIsVideoOpen(true)} className="relative block w-full h-full group text-left">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80"
                  alt="CircleWorks team culture video thumbnail"
                  className="h-full w-full object-cover opacity-85 group-hover:opacity-75 transition-opacity"
                />
                <span className="absolute inset-0 bg-[#0A1628]/30" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-20 h-20 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Play size={30} fill="currentColor" />
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
