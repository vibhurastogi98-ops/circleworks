import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileCheck2,
  Flag,
  LockKeyhole,
  Share2,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const values = [
  {
    title: "USA-First",
    description:
      "Built around US payroll, tax, benefits, labor rules, and state-by-state compliance from day one.",
    icon: Flag,
  },
  {
    title: "Radical Transparency",
    description:
      "Clear pricing, visible workflows, audit trails, and no mystery boxes between HR, finance, and employees.",
    icon: BadgeCheck,
  },
  {
    title: "Compliance by Default",
    description:
      "The product guides teams toward compliant decisions before a missed deadline becomes an expensive problem.",
    icon: FileCheck2,
  },
  {
    title: "Employee-First",
    description:
      "Every workflow is designed to reduce confusion for the people behind the paperwork.",
    icon: Users,
  },
];

const team = [
  { name: "Sarah Jenkins", title: "Co-founder & CEO", initials: "SJ" },
  { name: "David Chen", title: "Co-founder & CTO", initials: "DC" },
  { name: "Priya Patel", title: "Head of Customer Success", initials: "PP" },
];

const milestones = [
  {
    label: "Founded",
    date: "2021",
    body: "CircleWorks begins as a payroll automation project for distributed US teams.",
  },
  {
    label: "Beta",
    date: "2022",
    body: "The first 100 companies run payroll, onboarding, and HR workflows in private beta.",
  },
  {
    label: "Launch",
    date: "2023",
    body: "CircleWorks opens publicly with payroll, HRIS, ATS, benefits, time, and expenses.",
  },
  {
    label: "Series A",
    date: "2024",
    body: "New funding accelerates compliance automation and employee self-service tools.",
  },
];

const pressLogos = ["TechCrunch", "Forbes", "SHRM", "HR Brew"];
const investorLogos = [
  "Northstar Ventures",
  "Foundry Capital",
  "Payroll Angels",
  "Union Square Labs",
  "Operator Collective",
  "Cedar Fund",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#0A1628] selection:bg-cyan-200 selection:text-[#0A1628]">
      <Navbar forceLight />

      <section className="relative overflow-hidden bg-[#0A1628] px-6 pb-24 pt-36 text-center text-white lg:pb-32 lg:pt-44">
        <div
          className="pointer-events-none absolute inset-0 bg-[length:180%_180%] opacity-80"
          style={{
            background:
              "linear-gradient(120deg, rgba(29, 78, 216, 0.28), transparent 34%), linear-gradient(250deg, rgba(6, 182, 212, 0.18), transparent 38%), linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(10, 22, 40, 0))",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="mb-6 text-[12px] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Mission
          </p>
          <h1 className="text-[40px] font-black leading-[1.05] tracking-tight sm:text-[52px] lg:text-[64px]">
            Our mission is to eliminate the HR tax.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-slate-300 md:text-2xl">
            US companies waste 12+ hours/week on HR admin. We fix that.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
            As featured in
          </p>
          <div className="grid grid-cols-2 items-center gap-6 text-center grayscale md:grid-cols-4">
            {pressLogos.map((logo) => (
              <div
                key={logo}
                className="text-xl font-black text-slate-500 opacity-70"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
              Story
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Built by people tired of HR busywork.
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-slate-600">
              <p>
                CircleWorks started after our founding team spent too many late
                nights reconciling payroll exports, onboarding packets, benefits
                updates, time sheets, and tax notices across disconnected tools.
              </p>
              <p>
                The problem was not that HR teams lacked effort. It was that the
                work lived in systems that made every small change feel manual,
                fragile, and risky.
              </p>
              <p>
                We built CircleWorks as the operating layer for US companies:
                payroll, HRIS, ATS, benefits, time, and expenses working
                together with compliance built into the path.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
            <div className="aspect-[4/3] bg-[linear-gradient(135deg,#dbeafe_0%,#f8fafc_42%,#cffafe_100%)] p-6">
              <div className="grid h-full grid-cols-3 gap-3">
                {["SJ", "DC", "PP", "MJ", "AR", "NL"].map((initials, index) => (
                  <div
                    key={initials}
                    className={`flex items-end rounded-lg bg-white/70 p-3 shadow-sm ${index % 2 === 0 ? "translate-y-4" : ""}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1628] text-xs font-black text-white">
                      {initials}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
              Values
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              What we refuse to compromise.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article
                  key={value.title}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-xl font-black">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
                Team
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                The people building CircleWorks.
              </h2>
            </div>
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
            >
              View open roles <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {team.map((member) => (
              <article
                key={member.name}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0A1628] text-xl font-black text-white">
                    {member.initials}
                  </div>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black">{member.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {member.title}
                    </p>
                  </div>
                  <a
                    href="#"
                    aria-label={`${member.name} on LinkedIn`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-blue-600 hover:text-blue-700"
                  >
                    <Share2 size={18} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1628] px-6 py-24 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
            Timeline
          </p>
          <h2 className="mt-4 text-center text-4xl font-black tracking-tight md:text-5xl">
            From payroll pain to platform.
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {milestones.map((milestone, index) => (
              <article
                key={milestone.label}
                className="relative rounded-lg border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-cyan-300">
                    {milestone.date}
                  </span>
                </div>
                <h3 className="text-xl font-black">{milestone.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {milestone.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
            Investors
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Backed by operators and builders.
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
            {investorLogos.map((logo) => (
              <div
                key={logo}
                className="flex h-24 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-center text-lg font-black text-slate-500 grayscale"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-6 py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
              Next
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Build with us, or put CircleWorks to work.
            </h2>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/careers"
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-bold text-[#0A1628] transition hover:border-slate-500"
            >
              Join our team
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Try CircleWorks free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#0A1628] px-6 py-6 text-center text-sm text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <LockKeyhole size={16} className="text-cyan-300" />
          <span>SOC 2 Certified</span>
          <span aria-hidden="true">·</span>
          <span>Bank-grade encryption</span>
          <span aria-hidden="true">·</span>
          <span>CCPA compliant</span>
          <Building2 size={16} className="text-cyan-300" />
        </div>
      </section>

      <Footer />

    </main>
  );
}
