"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Calculator,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  Download,
  FileText,
  Heart,
  Mail,
  Share2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
} from "recharts";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

type ToolOption = {
  label: string;
  value: string;
  costPerEmployee: number;
};

type CategoryKey = "payroll" | "hris" | "ats" | "benefits" | "admin";

type BreakdownRow = {
  key: CategoryKey;
  label: string;
  currentCost: number;
  circleWorksCost: number;
  savings: number;
  color: string;
};

type TooltipPayload = {
  payload?: {
    color: string;
    name: string;
    value: number;
  };
};

const PAYROLL_TOOLS: ToolOption[] = [
  { label: "ADP", value: "adp", costPerEmployee: 24 },
  { label: "Gusto", value: "gusto", costPerEmployee: 18 },
  { label: "Paychex", value: "paychex", costPerEmployee: 22 },
  { label: "QuickBooks Payroll", value: "quickbooks-payroll", costPerEmployee: 10 },
  { label: "Manual/Spreadsheets", value: "manual-spreadsheets", costPerEmployee: 0 },
  { label: "Other", value: "other", costPerEmployee: 15 },
];

const HRIS_TOOLS: ToolOption[] = [
  { label: "BambooHR", value: "bamboohr", costPerEmployee: 8 },
  { label: "Workday", value: "workday", costPerEmployee: 35 },
  { label: "UKG", value: "ukg", costPerEmployee: 30 },
  { label: "None", value: "none", costPerEmployee: 0 },
  { label: "Other", value: "other", costPerEmployee: 10 },
];

const ATS_TOOLS: ToolOption[] = [
  { label: "Greenhouse", value: "greenhouse", costPerEmployee: 12 },
  { label: "Lever", value: "lever", costPerEmployee: 10 },
  { label: "Workable", value: "workable", costPerEmployee: 6 },
  { label: "None", value: "none", costPerEmployee: 0 },
  { label: "Other", value: "other", costPerEmployee: 8 },
];

const BENEFITS_TOOLS: ToolOption[] = [
  { label: "Zenefits", value: "zenefits", costPerEmployee: 8 },
  { label: "Rippling", value: "rippling", costPerEmployee: 12 },
  { label: "None", value: "none", costPerEmployee: 0 },
  { label: "Other", value: "other", costPerEmployee: 8 },
];

const WEEKS_PER_MONTH = 4.33;
const HOURS_REDUCTION = 0.7;
const CIRCLEWORKS_BASE_PRICE = 79;
const CIRCLEWORKS_PER_EMPLOYEE = 14;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(Math.round(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 10 ? 0 : 1,
  }).format(value);
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseNumericInput(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function findOption(options: ToolOption[], value: string) {
  return options.find((option) => option.value === value) ?? options[0];
}

function RangeNumberField({
  label,
  max,
  min,
  onChange,
  suffix,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  suffix?: string;
  value: number;
}) {
  const fieldId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={`${fieldId}-input`} className="text-sm font-bold text-slate-800">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            id={`${fieldId}-input`}
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(event) =>
              onChange(
                clampNumber(parseNumericInput(event.target.value, value), min, max),
              )
            }
            className="h-10 w-24 rounded-lg border border-slate-300 bg-white px-3 text-right text-sm font-black text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          {suffix ? (
            <span className="min-w-12 text-sm font-semibold text-slate-500">
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
      <input
        aria-label={`${label} slider`}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
      />
      <div className="flex justify-between text-xs font-semibold text-slate-400">
        <span>
          {min}
          {suffix ? ` ${suffix}` : ""}
        </span>
        <span>
          {max}
          {suffix ? ` ${suffix}` : ""}
        </span>
      </div>
    </div>
  );
}

function ToolSelect({
  icon: Icon,
  label,
  onChange,
  options,
  value,
}: {
  icon: typeof Building2;
  label: string;
  onChange: (value: string) => void;
  options: ToolOption[];
  value: string;
}) {
  const selected = findOption(options, value);
  const fieldId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className="flex items-center gap-2 text-sm font-bold text-slate-800"
      >
        <Icon className="h-4 w-4 text-blue-600" aria-hidden="true" />
        {label}
      </label>
      <select
        id={fieldId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-xs font-semibold text-slate-500">
        Average benchmark: {formatCurrency(selected.costPerEmployee)} per employee/month
      </p>
    </div>
  );
}

function CostTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length || !payload[0].payload) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      <div className="font-black text-slate-950">{item.name}</div>
      <div className="mt-1 font-semibold text-slate-600">
        {formatCurrency(item.value)}/month
      </div>
    </div>
  );
}

export default function ROICalculatorClient() {
  const [employees, setEmployees] = useState(75);
  const [payrollTool, setPayrollTool] = useState("gusto");
  const [hrisTool, setHrisTool] = useState("bamboohr");
  const [atsTool, setAtsTool] = useState("greenhouse");
  const [benefitsTool, setBenefitsTool] = useState("zenefits");
  const [manualHours, setManualHours] = useState(18);
  const [hourlyRate, setHourlyRate] = useState(40);
  const [email, setEmail] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "error" | "sent">("idle");
  const [shareUrl, setShareUrl] = useState("");
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    setIsChartReady(true);

    const params = new URLSearchParams(window.location.search);
    const employeeParam = params.get("employees");
    const hoursParam = params.get("hours");
    const rateParam = params.get("rate");
    const payrollParam = params.get("payroll");
    const hrisParam = params.get("hris");
    const atsParam = params.get("ats");
    const benefitsParam = params.get("benefits");

    if (employeeParam) {
      setEmployees(clampNumber(parseNumericInput(employeeParam, 75), 1, 500));
    }
    if (hoursParam) {
      setManualHours(clampNumber(parseNumericInput(hoursParam, 18), 0, 40));
    }
    if (rateParam) {
      setHourlyRate(clampNumber(parseNumericInput(rateParam, 40), 15, 150));
    }
    if (payrollParam && PAYROLL_TOOLS.some((tool) => tool.value === payrollParam)) {
      setPayrollTool(payrollParam);
    }
    if (hrisParam && HRIS_TOOLS.some((tool) => tool.value === hrisParam)) {
      setHrisTool(hrisParam);
    }
    if (atsParam && ATS_TOOLS.some((tool) => tool.value === atsParam)) {
      setAtsTool(atsParam);
    }
    if (benefitsParam && BENEFITS_TOOLS.some((tool) => tool.value === benefitsParam)) {
      setBenefitsTool(benefitsParam);
    }
  }, []);

  const results = useMemo(() => {
    const payroll = findOption(PAYROLL_TOOLS, payrollTool);
    const hris = findOption(HRIS_TOOLS, hrisTool);
    const ats = findOption(ATS_TOOLS, atsTool);
    const benefits = findOption(BENEFITS_TOOLS, benefitsTool);

    const payrollCost = payroll.costPerEmployee * employees;
    const hrisCost = hris.costPerEmployee * employees;
    const atsCost = ats.costPerEmployee * employees;
    const benefitsCost = benefits.costPerEmployee * employees;
    const adminCost = manualHours * hourlyRate * WEEKS_PER_MONTH;
    const currentCost =
      payrollCost + hrisCost + atsCost + benefitsCost + adminCost;
    const circleWorksCost = CIRCLEWORKS_BASE_PRICE + CIRCLEWORKS_PER_EMPLOYEE * employees;
    const monthlySavings = currentCost - circleWorksCost;
    const annualSavings = monthlySavings * 12;
    const timeSavedWeekly = manualHours * HOURS_REDUCTION;
    const productiveWeeksBack = (timeSavedWeekly * 52) / 40;

    const allocations: Record<CategoryKey, number> = {
      admin: 0.15,
      ats: 0.15,
      benefits: 0.15,
      hris: 0.2,
      payroll: 0.35,
    };

    const breakdown: BreakdownRow[] = [
      {
        key: "payroll",
        label: "Payroll software",
        currentCost: payrollCost,
        circleWorksCost: circleWorksCost * allocations.payroll,
        savings: payrollCost - circleWorksCost * allocations.payroll,
        color: "#2563EB",
      },
      {
        key: "hris",
        label: "HRIS",
        currentCost: hrisCost,
        circleWorksCost: circleWorksCost * allocations.hris,
        savings: hrisCost - circleWorksCost * allocations.hris,
        color: "#0891B2",
      },
      {
        key: "ats",
        label: "ATS",
        currentCost: atsCost,
        circleWorksCost: circleWorksCost * allocations.ats,
        savings: atsCost - circleWorksCost * allocations.ats,
        color: "#7C3AED",
      },
      {
        key: "benefits",
        label: "Benefits admin",
        currentCost: benefitsCost,
        circleWorksCost: circleWorksCost * allocations.benefits,
        savings: benefitsCost - circleWorksCost * allocations.benefits,
        color: "#059669",
      },
      {
        key: "admin",
        label: "Manual HR admin",
        currentCost: adminCost,
        circleWorksCost: circleWorksCost * allocations.admin,
        savings: adminCost - circleWorksCost * allocations.admin,
        color: "#F97316",
      },
    ];

    return {
      annualSavings,
      breakdown,
      circleWorksCost,
      currentCost,
      monthlySavings,
      productiveWeeksBack,
      timeSavedWeekly,
    };
  }, [atsTool, benefitsTool, employees, hourlyRate, hrisTool, manualHours, payrollTool]);

  const chartData = useMemo(
    () =>
      results.breakdown
        .filter((row) => row.currentCost > 0)
        .map((row) => ({
          color: row.color,
          name: row.label,
          value: Math.round(row.currentCost),
        })),
    [results.breakdown],
  );

  const positiveMonthlySavings = Math.max(results.monthlySavings, 0);
  const positiveAnnualSavings = Math.max(results.annualSavings, 0);

  function buildShareUrl() {
    const params = new URLSearchParams({
      ats: atsTool,
      benefits: benefitsTool,
      employees: String(employees),
      hris: hrisTool,
      hours: String(manualHours),
      payroll: payrollTool,
      rate: String(hourlyRate),
    });

    return `${window.location.origin}/roi-calculator?${params.toString()}`;
  }

  async function handleShare() {
    const nextShareUrl = buildShareUrl();
    setShareUrl(nextShareUrl);

    try {
      await navigator.clipboard.writeText(nextShareUrl);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 2000);
    } catch {
      setShareState("idle");
    }
  }

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailState("error");
      return;
    }

    setEmailState("sent");
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="calculator-shell">
        <section className="bg-white px-6 pb-12 pt-24 lg:pb-16 lg:pt-32">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-4xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-700">
                <Calculator className="h-4 w-4" aria-hidden="true" />
                ROI calculator
              </div>
              <h1 className="text-4xl font-black leading-tight text-[#0A1628] md:text-6xl">
                See exactly how much CircleWorks saves you
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Enter your current HR stack and team size - we&apos;ll show you
                the numbers.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1fr)]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6 lg:p-8">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#0A1628]">
                    Your current setup
                  </h2>
                  <p className="text-sm font-semibold text-slate-500">
                    Results update live as you change each input.
                  </p>
                </div>
              </div>

              <div className="space-y-7">
                <RangeNumberField
                  label="Number of employees"
                  min={1}
                  max={500}
                  value={employees}
                  onChange={setEmployees}
                  suffix="people"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <ToolSelect
                    icon={DollarSign}
                    label="Current payroll software"
                    options={PAYROLL_TOOLS}
                    value={payrollTool}
                    onChange={setPayrollTool}
                  />
                  <ToolSelect
                    icon={Building2}
                    label="Current HRIS tool"
                    options={HRIS_TOOLS}
                    value={hrisTool}
                    onChange={setHrisTool}
                  />
                  <ToolSelect
                    icon={Briefcase}
                    label="Current ATS"
                    options={ATS_TOOLS}
                    value={atsTool}
                    onChange={setAtsTool}
                  />
                  <ToolSelect
                    icon={Heart}
                    label="Current benefits tool"
                    options={BENEFITS_TOOLS}
                    value={benefitsTool}
                    onChange={setBenefitsTool}
                  />
                </div>

                <RangeNumberField
                  label="Hours/week spent on manual HR admin"
                  min={0}
                  max={40}
                  value={manualHours}
                  onChange={setManualHours}
                  suffix="hrs"
                />

                <div className="space-y-3">
                  <label
                    htmlFor="hourly-rate"
                    className="flex items-center gap-2 text-sm font-bold text-slate-800"
                  >
                    <Clock className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    Average HR team hourly rate
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden="true"
                    />
                    <input
                      id="hourly-rate"
                      type="number"
                      min={15}
                      max={150}
                      value={hourlyRate}
                      onChange={(event) =>
                        setHourlyRate(
                          clampNumber(
                            parseNumericInput(event.target.value, hourlyRate),
                            15,
                            150,
                          ),
                        )
                      }
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pl-9 text-sm font-black text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  <input
                    aria-label="Average HR team hourly rate slider"
                    type="range"
                    min={15}
                    max={150}
                    value={hourlyRate}
                    onChange={(event) => setHourlyRate(Number(event.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
                  />
                </div>
              </div>
            </div>

            <aside className="rounded-2xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-950/5 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                    Savings estimate
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-[#0A1628]">
                    Your CircleWorks ROI
                  </h2>
                </div>
                <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 sm:flex">
                  <Calculator className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Your current cost
                  </p>
                  <p className="mt-3 text-3xl font-black text-[#0A1628]">
                    {formatCurrency(results.currentCost)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    per month
                  </p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                    CircleWorks cost
                  </p>
                  <p className="mt-3 text-3xl font-black text-[#0A1628]">
                    {formatCurrency(results.circleWorksCost)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    Pro plan per month
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6">
                <p className="text-sm font-black uppercase tracking-widest text-slate-500">
                  Savings
                </p>
                <p className="mt-3 bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-600 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
                  You could save {formatCurrency(positiveMonthlySavings)} per month
                </p>
                <p className="mt-3 text-xl font-black text-[#0A1628]">
                  {formatCurrency(positiveAnnualSavings)} per year
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-5">
                  <p className="flex items-center gap-2 text-sm font-black text-[#0A1628]">
                    <Clock className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    Time saved
                  </p>
                  <p className="mt-3 text-2xl font-black text-slate-950">
                    Save ~{formatNumber(results.timeSavedWeekly)} hours/week
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Based on a 70% reduction in manual HR admin.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-5">
                  <p className="flex items-center gap-2 text-sm font-black text-[#0A1628]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    Efficiency gain
                  </p>
                  <p className="mt-3 text-2xl font-black text-slate-950">
                    {formatNumber(results.productiveWeeksBack)} weeks/year
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    That&apos;s productive work back for your team.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-6 2xl:grid-cols-[minmax(560px,1fr)_300px]">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-[560px] w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-500">
                      <tr>
                        <th className="w-[34%] px-4 py-3">Category</th>
                        <th className="w-[22%] px-4 py-3 text-right">Current</th>
                        <th className="w-[22%] px-4 py-3 text-right">CircleWorks</th>
                        <th className="w-[22%] px-4 py-3 text-right">Savings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {results.breakdown.map((row) => (
                        <tr key={row.key}>
                          <td className="px-4 py-3 font-bold text-slate-800">
                            {row.label}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-600">
                            {formatCurrency(row.currentCost)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-600">
                            {formatCurrency(row.circleWorksCost)}
                          </td>
                          <td className="px-4 py-3 text-right font-black text-emerald-700">
                            {formatCurrency(Math.max(row.savings, 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-black text-[#0A1628]">
                    Current spend breakdown
                  </p>
                  <div className="h-56 w-full">
                    {isChartReady ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={56}
                            outerRadius={86}
                            paddingAngle={3}
                            stroke="#F8FAFC"
                            strokeWidth={3}
                          >
                            {chartData.map((item) => (
                              <Cell key={item.name} fill={item.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<CostTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="no-print mt-7 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/signup?source=roi-calculator"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Start Free <span aria-hidden="true">&mdash;</span> See Your Real Savings
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/contact?intent=sales"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-black text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  Talk to Sales to Build a Custom Quote
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-black text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download This Report as PDF
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-black text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {shareState === "copied" ? (
                    <Copy className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                  )}
                  {shareState === "copied" ? "Copied!" : "Share your results"}
                </button>
              </div>

              {shareUrl ? (
                <div className="no-print mt-3 rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-500">
                  {shareUrl}
                </div>
              ) : null}

              <form
                onSubmit={handleEmailSubmit}
                className="no-print mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-[#0A1628]">
                      Get a personalized savings report in your inbox
                    </h3>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input
                        aria-label="Work email for savings report"
                        type="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setEmailState("idle");
                        }}
                        placeholder="you@company.com"
                        className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                      <button
                        type="submit"
                        className="h-11 rounded-lg bg-[#0A1628] px-5 text-sm font-black text-white transition hover:bg-blue-700"
                      >
                        Send Report
                      </button>
                    </div>
                    {emailState === "error" ? (
                      <p className="mt-3 text-sm font-semibold text-red-600">
                        Enter a valid work email.
                      </p>
                    ) : null}
                    {emailState === "sent" ? (
                      <p className="mt-3 text-sm font-black text-emerald-700">
                        Report prepared for {email.trim()}.
                      </p>
                    ) : null}
                  </div>
                </div>
              </form>
            </aside>
          </div>
        </section>

        <section className="hidden print:block px-8 pb-10">
          <div className="rounded-xl border border-slate-300 p-6">
            <h2 className="text-2xl font-black text-[#0A1628]">
              CircleWorks ROI Report
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>Employees: {employees}</div>
              <div>Current cost/month: {formatCurrency(results.currentCost)}</div>
              <div>CircleWorks cost/month: {formatCurrency(results.circleWorksCost)}</div>
              <div>Estimated savings/year: {formatCurrency(positiveAnnualSavings)}</div>
              <div>Time saved/week: {formatNumber(results.timeSavedWeekly)} hours</div>
              <div>Productive weeks/year: {formatNumber(results.productiveWeeksBack)}</div>
            </div>
          </div>
        </section>
      </main>

      <div className="no-print">
        <Footer />
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: #ffffff !important;
          }

          .calculator-shell {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
