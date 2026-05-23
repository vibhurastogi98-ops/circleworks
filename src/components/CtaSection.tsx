"use client";

import React from "react";
import { ArrowRight, CalendarDays, LockKeyhole } from "lucide-react";
import Link from "next/link";

const AVATARS = [
  { initials: "AM", bg: "from-cyan-300 to-blue-500" },
  { initials: "JR", bg: "from-blue-400 to-indigo-500" },
  { initials: "SK", bg: "from-emerald-300 to-cyan-500" },
  { initials: "DL", bg: "from-sky-300 to-blue-600" },
  { initials: "NP", bg: "from-violet-300 to-blue-500" },
];

export default function CtaSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0A1628] py-24">
      <div className="cta-gradient pointer-events-none absolute inset-0 opacity-80" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center lg:px-8">
        <h2 className="text-[38px] font-black leading-[1.05] text-white sm:text-[48px] md:text-[56px]">
          Ready to simplify your HR?
        </h2>

        <p className="mt-5 max-w-2xl text-[20px] leading-relaxed text-slate-300">
          Join 5,000+ US companies using CircleWorks. Start free today.
        </p>

        <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <Link
            href="/signup"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] px-8 text-base font-semibold text-white shadow-[0_18px_45px_rgba(29,78,216,0.28)] transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_34px_rgba(59,130,246,0.5)] sm:w-auto"
          >
            Start Free Trial
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/demo"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-white/30 px-8 text-base font-semibold text-white transition duration-300 hover:bg-white hover:text-[#0A1628] sm:w-auto"
          >
            <CalendarDays size={18} />
            Schedule a Demo
          </Link>
        </div>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <div className="flex -space-x-3">
            {AVATARS.map((avatar) => (
              <div
                key={avatar.initials}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0A1628] bg-gradient-to-br ${avatar.bg} text-xs font-black text-white shadow-lg`}
              >
                {avatar.initials}
              </div>
            ))}
          </div>
          <p className="text-sm font-medium text-slate-300">
            Rated 4.9/5 by HR teams across America
          </p>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-400">
          <LockKeyhole size={16} className="text-cyan-400" />
          <span>SOC 2 Certified · Bank-grade encryption · CCPA compliant</span>
        </div>
      </div>

      <style jsx>{`
        .cta-gradient {
          background:
            linear-gradient(115deg, rgba(29, 78, 216, 0.24), transparent 34%),
            linear-gradient(245deg, rgba(6, 182, 212, 0.18), transparent 36%),
            linear-gradient(180deg, rgba(99, 102, 241, 0.14), rgba(10, 22, 40, 0) 68%);
          background-size: 180% 180%;
          animation: ctaGradientShift 12s ease-in-out infinite alternate;
        }

        @keyframes ctaGradientShift {
          0% {
            background-position: 0% 40%;
          }
          100% {
            background-position: 100% 60%;
          }
        }
      `}</style>
    </section>
  );
}
