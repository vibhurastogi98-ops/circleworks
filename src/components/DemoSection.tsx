"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Loader2,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DemoTab = "Payroll" | "Employees" | "Benefits" | "Time" | "Reports";
type PayrollStatus = "ready" | "processing" | "paid";

const tabs: DemoTab[] = ["Payroll", "Employees", "Benefits", "Time", "Reports"];

const payrollRows = [
  { name: "Sarah Morgan", team: "Design", amount: "$4,240.00" },
  { name: "Eli Brooks", team: "Engineering", amount: "$5,880.00" },
  { name: "Maya Patel", team: "Operations", amount: "$3,950.00" },
  { name: "Noah Kim", team: "Sales", amount: "$4,610.00" },
];

const employeeRows = [
  { name: "Sarah Morgan", role: "Product Designer", location: "Austin, TX" },
  { name: "Marcus Lee", role: "Payroll Lead", location: "Seattle, WA" },
  { name: "Priya Shah", role: "People Ops", location: "New York, NY" },
  { name: "Daniel Park", role: "Benefits Admin", location: "Denver, CO" },
];

const benefitPlans = [
  {
    name: "Core Health",
    price: "$0/mo",
    detail: "HSA-ready plan for lean monthly costs.",
    icon: ShieldCheck,
  },
  {
    name: "Balanced PPO",
    price: "$49/mo",
    detail: "Lower deductible with broader provider access.",
    icon: HeartPulse,
  },
  {
    name: "Family Plus",
    price: "$119/mo",
    detail: "Expanded coverage for dependents and care.",
    icon: CheckCircle2,
  },
];

const reportData = [
  { month: "Jan", value: 96 },
  { month: "Feb", value: 118 },
  { month: "Mar", value: 104 },
  { month: "Apr", value: 142 },
  { month: "May", value: 158 },
  { month: "Jun", value: 184 },
];

function BrowserChrome({ activeTab, children }: { activeTab: DemoTab; children: React.ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0B1220] shadow-[0_34px_90px_rgba(0,0,0,0.45)]">
      <div className="flex h-14 items-center gap-4 border-b border-white/10 bg-[#07111F] px-5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="hidden min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-slate-400 sm:block">
          circleworks.app/demo/{activeTab.toLowerCase()}
        </div>
        <div className="ml-auto rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
          Live demo
        </div>
      </div>
      <div className="min-h-[560px] bg-[#0F172A] p-4 sm:min-h-[500px] sm:p-6">
        {children}
      </div>
    </div>
  );
}

function PayrollDemo() {
  const [status, setStatus] = useState<PayrollStatus>("ready");

  useEffect(() => {
    if (status !== "processing") {
      return undefined;
    }

    const timer = window.setTimeout(() => setStatus("paid"), 1300);
    return () => window.clearTimeout(timer);
  }, [status]);

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/40 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-300">Payroll run</p>
          <h3 className="mt-2 text-2xl font-black text-white">May 31 regular payroll</h3>
          <p className="mt-1 text-sm text-slate-400">4 employees &middot; $18,680 gross pay</p>
        </div>
        <button
          type="button"
          onClick={() => setStatus("processing")}
          disabled={status !== "ready"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-[0_16px_40px_rgba(37,99,235,0.36)] transition hover:bg-blue-500 disabled:cursor-default disabled:bg-emerald-500/15 disabled:text-emerald-300"
        >
          {status === "ready" && "Run Payroll"}
          {status === "processing" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          )}
          {status === "paid" && (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Paid &#10003;
            </>
          )}
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] bg-white/[0.03] px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          <span>Employee</span>
          <span>Gross</span>
          <span className="text-right">Status</span>
        </div>
        {payrollRows.map((row, index) => (
          <div
            key={row.name}
            className="grid grid-cols-[1.4fr_0.8fr_0.8fr] items-center border-t border-white/10 px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 font-black text-blue-200">
                {row.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-white">{row.name}</p>
                <p className="text-xs text-slate-500">{row.team}</p>
              </div>
            </div>
            <span className="font-mono text-sm text-slate-200">{row.amount}</span>
            <div className="flex justify-end">
              {status === "paid" ? (
                <motion.span
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.16, type: "spring", stiffness: 280, damping: 18 }}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300"
                >
                  Paid &#10003; <CheckCircle2 className="h-3.5 w-3.5" />
                </motion.span>
              ) : (
                <span className="rounded-full bg-slate-700/60 px-3 py-1 text-xs font-bold text-slate-300">
                  {status === "processing" ? "Processing" : "Ready"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeesDemo() {
  const [query, setQuery] = useState("");
  const filtered = employeeRows.filter((employee) =>
    employee.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/40 p-5">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-300">Employee directory</p>
        <label className="relative mt-2 block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type Sarah to filter live"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((employee) => (
            <motion.div
              key={employee.name}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 font-black text-white">
                  {employee.name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-white">{employee.name}</p>
                  <p className="text-sm text-slate-400">{employee.role}</p>
                  <p className="mt-1 text-xs text-slate-500">{employee.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BenefitsDemo() {
  const [selectedPlan, setSelectedPlan] = useState("Balanced PPO");

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/40 p-5">
      <div className="border-b border-white/10 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-300">Benefits enrollment</p>
        <h3 className="mt-2 text-2xl font-black text-white">Step 1: Choose a health plan</h3>
        <p className="mt-1 text-sm text-slate-400">Click a card to compare coverage before enrolling.</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {benefitPlans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.name;

          return (
            <button
              key={plan.name}
              type="button"
              onClick={() => setSelectedPlan(plan.name)}
              className={`rounded-3xl border p-5 text-left transition ${
                isSelected
                  ? "border-blue-400 bg-blue-500/15 shadow-[0_18px_44px_rgba(37,99,235,0.2)]"
                  : "border-white/10 bg-white/[0.04] hover:border-blue-400/60 hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <Icon className={isSelected ? "h-7 w-7 text-blue-300" : "h-7 w-7 text-slate-400"} />
                {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-300" />}
              </div>
              <h4 className="mt-8 text-lg font-black text-white">{plan.name}</h4>
              <p className="mt-1 text-2xl font-black text-blue-200">{plan.price}</p>
              <p className="mt-4 text-sm leading-6 text-slate-400">{plan.detail}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeDemo() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  const display = new Date(seconds * 1000).toISOString().slice(11, 19);

  return (
    <div className="grid h-full place-items-center rounded-3xl border border-white/10 bg-slate-950/40 p-5">
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
        <div className="absolute inset-x-10 top-8 h-40 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
            <Clock3 className="h-7 w-7" />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Current shift</p>
          <div className="mt-3 font-mono text-5xl font-black tracking-[0.1em] text-white sm:text-6xl">
            {display}
          </div>
          <button
            type="button"
            onClick={() => setIsRunning((value) => !value)}
            className={`mt-8 w-full rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-[0.18em] transition ${
              isRunning
                ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/40"
                : "bg-emerald-500 text-white shadow-[0_18px_44px_rgba(16,185,129,0.25)] hover:bg-emerald-400"
            }`}
          >
            {isRunning ? "Clock out" : "Clock in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportsDemo() {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/40 p-5">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-300">Reports</p>
          <h3 className="mt-2 text-2xl font-black text-white">Labor cost by month</h3>
          <p className="mt-1 text-sm text-slate-400">Animated reporting snapshot for leadership.</p>
        </div>
        <div className="rounded-2xl bg-cyan-400/10 px-4 py-3 text-right">
          <p className="text-2xl font-black text-cyan-200">+18.5%</p>
          <p className="text-xs font-semibold text-slate-500">vs last period</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-6 min-h-[300px] flex-1"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={reportData} margin={{ top: 12, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "rgba(37, 99, 235, 0.08)" }}
              contentStyle={{
                background: "#0F172A",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "14px",
                color: "#fff",
              }}
              formatter={(value) => [`$${value}k`, "Labor cost"]}
            />
            <Bar dataKey="value" radius={[12, 12, 4, 4]} animationBegin={120} animationDuration={950}>
              {reportData.map((entry, index) => (
                <Cell key={entry.month} fill={index === reportData.length - 1 ? "#22D3EE" : "#2563EB"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

function DemoContent({ activeTab }: { activeTab: DemoTab }) {
  if (activeTab === "Payroll") {
    return <PayrollDemo />;
  }

  if (activeTab === "Employees") {
    return <EmployeesDemo />;
  }

  if (activeTab === "Benefits") {
    return <BenefitsDemo />;
  }

  if (activeTab === "Time") {
    return <TimeDemo />;
  }

  return <ReportsDemo />;
}

export default function DemoSection() {
  const [activeTab, setActiveTab] = useState<DemoTab>("Payroll");

  return (
    <section className="relative w-full overflow-hidden bg-[#0A1628] py-24">
      <div className="absolute left-1/2 top-8 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-cyan-400/10 blur-[110px]" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6">
        <div className="text-center">
          <h2 className="text-[40px] font-black leading-[1.05] tracking-[-0.04em] text-white md:text-[48px]">
            See CircleWorks in Action
          </h2>
          <p className="mt-4 text-lg font-medium text-slate-400">No signup required. Explore live.</p>
        </div>

        <div className="mt-10 flex max-w-full flex-wrap justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative rounded-full px-5 py-2.5 text-sm font-black transition ${
                activeTab === tab ? "text-white" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {activeTab === tab && (
                <motion.span
                  layoutId="demo-active-tab"
                  className="absolute inset-0 rounded-full bg-blue-600 shadow-[0_12px_28px_rgba(37,99,235,0.38)]"
                  transition={{ type: "spring", bounce: 0.18, duration: 0.55 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 w-full">
          <BrowserChrome activeTab={activeTab}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="h-full"
              >
                <DemoContent activeTab={activeTab} />
              </motion.div>
            </AnimatePresence>
          </BrowserChrome>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-base font-black text-white shadow-[0_18px_46px_rgba(37,99,235,0.32)] transition hover:-translate-y-0.5 hover:bg-blue-500"
          >
            Ready to see your data? Start your free trial
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
          <p className="mt-4 text-sm font-medium text-slate-500">
            All demo data is fictional. Your real data stays private.
          </p>
        </div>
      </div>
    </section>
  );
}
