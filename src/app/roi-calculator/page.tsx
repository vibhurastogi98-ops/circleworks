"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Mail,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const CURRENT_TOOLS = [
  "ADP",
  "Gusto",
  "QuickBooks",
  "Rippling",
  "Spreadsheets",
  "Paychex",
  "Workday",
  "BambooHR",
  "Other",
];

const PRO_PRICE_PER_EMPLOYEE = 14;
const TIME_SAVED_RATE = 0.7;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(Math.round(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function SliderField({
  id,
  icon: Icon,
  label,
  max,
  min,
  onChange,
  suffix = "",
  value,
}: {
  id: string;
  icon: React.ElementType;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  suffix?: string;
  value: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label
          htmlFor={`${id}-number`}
          className="flex items-center gap-2 text-sm font-semibold text-slate-800"
        >
          <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            id={`${id}-number`}
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(event) =>
              onChange(clamp(parseNumber(event.target.value, min), min, max))
            }
            className="h-10 w-24 rounded-lg border border-slate-200 bg-white px-3 text-right text-sm font-bold text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          {suffix && (
            <span className="min-w-10 text-sm font-semibold text-slate-500">
              {suffix}
            </span>
          )}
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
      <div className="flex justify-between text-xs font-medium text-slate-500">
        <span>
          {min}
          {suffix}
        </span>
        <span>
          {max}
          {suffix}
        </span>
      </div>
    </div>
  );
}

function MoneyInput({
  id,
  label,
  onChange,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>
      <div className="relative">
        <DollarSign
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
        <input
          id={id}
          type="number"
          min={0}
          value={value}
          onChange={(event) =>
            onChange(Math.max(parseNumber(event.target.value), 0))
          }
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 pl-9 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
    </div>
  );
}

function ResultCard({
  accent = "default",
  label,
  note,
  value,
}: {
  accent?: "default" | "blue" | "green";
  label: string;
  note: string;
  value: string;
}) {
  const styles = {
    blue: "border-blue-200 bg-blue-50 text-blue-950",
    default: "border-slate-200 bg-white text-slate-950",
    green: "border-emerald-200 bg-emerald-50 text-emerald-950",
  };

  return (
    <div
      className={`rounded-lg border p-5 shadow-sm ${styles[accent]}`}
      aria-live="polite"
    >
      <p className="text-sm font-semibold opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
      <p className="mt-2 text-xs font-medium opacity-70">{note}</p>
    </div>
  );
}

export default function ROICalculatorPage() {
  const [employees, setEmployees] = useState(50);
  const [selectedTools, setSelectedTools] = useState<string[]>([
    "Spreadsheets",
  ]);
  const [manualHours, setManualHours] = useState(40);
  const [hourlyRate, setHourlyRate] = useState(35);
  const [payrollErrors, setPayrollErrors] = useState(2);
  const [averageErrorCost, setAverageErrorCost] = useState(500);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "ready" | "sent"
  >("idle");
  const [isChartReady, setIsChartReady] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);

  useEffect(() => {
    setIsChartReady(true);
  }, []);

  const calculations = useMemo(() => {
    const annualAdminCost = manualHours * 12 * hourlyRate;
    const annualErrorCost = payrollErrors * 12 * averageErrorCost;
    const currentAnnualCost = annualAdminCost + annualErrorCost;
    const circleWorksAnnualCost = employees * PRO_PRICE_PER_EMPLOYEE * 12;
    const timeSavedPerMonth = manualHours * TIME_SAVED_RATE;
    const remainingAdminCost =
      (manualHours - timeSavedPerMonth) * 12 * hourlyRate;
    const estimatedAnnualSavings =
      currentAnnualCost - circleWorksAnnualCost - remainingAdminCost;

    return {
      annualAdminCost,
      annualErrorCost,
      circleWorksAnnualCost,
      currentAnnualCost,
      estimatedAnnualSavings,
      remainingAdminCost,
      timeSavedPerMonth,
    };
  }, [averageErrorCost, employees, hourlyRate, manualHours, payrollErrors]);

  const chartData = useMemo(
    () => [
      {
        "Admin Time": calculations.annualAdminCost,
        "Payroll Errors": calculations.annualErrorCost,
        "Software Cost": 0,
        name: "Current",
      },
      {
        "Admin Time": calculations.remainingAdminCost,
        "Payroll Errors": 0,
        "Software Cost": calculations.circleWorksAnnualCost,
        name: "CircleWorks",
      },
    ],
    [calculations]
  );

  const toggleTool = (tool: string) => {
    setSelectedTools((current) =>
      current.includes(tool)
        ? current.filter((selectedTool) => selectedTool !== tool)
        : [...current, tool]
    );
  };

  const handleEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent("Your CircleWorks ROI report");
    const body = encodeURIComponent(
      [
        "CircleWorks ROI summary",
        "",
        `Employees: ${employees}`,
        `Current tools: ${selectedTools.join(", ") || "None selected"}`,
        `Hours/month on manual HR tasks: ${manualHours}`,
        `Hourly rate of HR staff: ${formatCurrency(hourlyRate)}/hr`,
        `Payroll errors per month: ${payrollErrors}`,
        `Average cost per error: ${formatCurrency(averageErrorCost)}`,
        "",
        `Current Annual HR Admin Cost: ${formatCurrency(
          calculations.currentAnnualCost
        )}`,
        `CircleWorks Annual Cost: ${formatCurrency(
          calculations.circleWorksAnnualCost
        )}`,
        `Estimated Annual Savings: ${formatCurrency(
          calculations.estimatedAnnualSavings
        )}`,
        `Time Saved Per Month: ${calculations.timeSavedPerMonth.toFixed(
          1
        )} hours`,
      ].join("\n")
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setEmailStatus("sent");
  };

  const savingsText = formatCurrency(
    Math.max(calculations.estimatedAnnualSavings, 0)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />

      <main className="pb-20 pt-28">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-700">
              <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
              ROI Calculator
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-normal text-slate-950 md:text-5xl">
              See what manual HR work is really costing you.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Model your annual admin cost, compare it with CircleWorks Pro,
              and adjust the numbers in real time as your team changes.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-start">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    Your Inputs
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Adjust the sliders and fields to match your current setup.
                  </p>
                </div>
                <Users className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>

              <div className="mt-6 space-y-7">
                <SliderField
                  id="employees"
                  icon={Users}
                  label="Number of employees"
                  min={1}
                  max={500}
                  value={employees}
                  onChange={setEmployees}
                />

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-800">
                    Current tools
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CURRENT_TOOLS.map((tool) => {
                      const isSelected = selectedTools.includes(tool);

                      return (
                        <button
                          key={tool}
                          type="button"
                          onClick={() => toggleTool(tool)}
                          className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
                            isSelected
                              ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                          aria-pressed={isSelected}
                        >
                          {isSelected && (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {tool}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <SliderField
                  id="manual-hours"
                  icon={Clock}
                  label="Hours/month on manual HR tasks"
                  min={0}
                  max={100}
                  suffix="hrs"
                  value={manualHours}
                  onChange={setManualHours}
                />

                <MoneyInput
                  id="hourly-rate"
                  label="Hourly rate of HR staff"
                  value={hourlyRate}
                  onChange={setHourlyRate}
                />

                <SliderField
                  id="payroll-errors"
                  icon={AlertTriangle}
                  label="Payroll errors per month"
                  min={0}
                  max={20}
                  value={payrollErrors}
                  onChange={setPayrollErrors}
                />

                <MoneyInput
                  id="average-error-cost"
                  label="Average cost per error"
                  value={averageErrorCost}
                  onChange={setAverageErrorCost}
                />
              </div>
            </section>

            <section className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <ResultCard
                  label="Current Annual HR Admin Cost"
                  value={formatCurrency(calculations.currentAnnualCost)}
                  note="Manual HR time plus payroll error costs"
                />
                <ResultCard
                  accent="blue"
                  label="CircleWorks Annual Cost"
                  value={formatCurrency(calculations.circleWorksAnnualCost)}
                  note="$14 per employee per month on Pro"
                />
                <ResultCard
                  accent="green"
                  label="Estimated Annual Savings"
                  value={formatCurrency(calculations.estimatedAnnualSavings)}
                  note="Current cost minus Pro plan and remaining admin time"
                />
                <ResultCard
                  label="Time Saved Per Month"
                  value={`${calculations.timeSavedPerMonth.toFixed(1)} hrs`}
                  note="70% of manual HR admin time recovered"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      Current vs. CircleWorks Breakdown
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Annualized cost comparison across admin time, errors, and
                      software.
                    </p>
                  </div>
                </div>
                <div className="h-80 min-w-0">
                  {isChartReady ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ left: -18, top: 12 }}
                      >
                        <CartesianGrid
                          stroke="#e2e8f0"
                          strokeDasharray="4 4"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#475569", fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#475569", fontSize: 12 }}
                          tickFormatter={(value: number) =>
                            `$${Math.round(value / 1000)}k`
                          }
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          formatter={(value) => formatCurrency(Number(value))}
                          contentStyle={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="Admin Time"
                          fill="#2563eb"
                          radius={[6, 6, 0, 0]}
                          stackId="cost"
                        />
                        <Bar
                          dataKey="Payroll Errors"
                          fill="#f97316"
                          stackId="cost"
                        />
                        <Bar
                          dataKey="Software Cost"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                          stackId="cost"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-end gap-4 rounded-lg bg-slate-50 p-6">
                      <div className="h-4/5 flex-1 rounded-t-lg bg-slate-200" />
                      <div className="h-1/2 flex-1 rounded-t-lg bg-slate-200" />
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-slate-950 p-5 text-white shadow-sm sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-normal">
                      Save {savingsText} this year &mdash; Start your free trial
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Start your free trial and bring HR, payroll, benefits,
                      and employee data into one place.
                    </p>
                  </div>
                  <Link
                    href="/signup"
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"
                  >
                    Start your free trial
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>

                <form
                  onSubmit={handleEmailSubmit}
                  className="mt-6 border-t border-white/10 pt-5"
                >
                  <label className="text-sm font-bold text-white">
                    Email me this report
                  </label>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <Mail
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setEmailStatus("ready");
                        }}
                        placeholder="work@email.com"
                        className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 pl-9 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-slate-100"
                    >
                      {emailStatus === "sent" ? (
                        <>
                          <CheckCircle2
                            className="h-4 w-4 text-emerald-600"
                            aria-hidden="true"
                          />
                          Sent
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" aria-hidden="true" />
                          Send
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowAssumptions((visible) => !visible)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-black text-slate-950 transition hover:bg-slate-50 sm:px-6"
                >
                  How we calculate this
                  {showAssumptions ? (
                    <ChevronUp
                      className="h-5 w-5 text-slate-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronDown
                      className="h-5 w-5 text-slate-500"
                      aria-hidden="true"
                    />
                  )}
                </button>
                {showAssumptions && (
                  <div className="space-y-3 border-t border-slate-100 px-5 py-5 text-sm leading-6 text-slate-600 sm:px-6">
                    <p>
                      <strong className="text-slate-950">
                        Current Annual HR Admin Cost:
                      </strong>{" "}
                      (hours/month x 12 x hourly rate) + (payroll errors/month
                      x 12 x average cost per error).
                    </p>
                    <p>
                      <strong className="text-slate-950">
                        CircleWorks Annual Cost:
                      </strong>{" "}
                      employees x $14 x 12, using the Pro plan.
                    </p>
                    <p>
                      <strong className="text-slate-950">
                        Estimated Annual Savings:
                      </strong>{" "}
                      current annual cost minus CircleWorks annual cost minus
                      the 30% of manual admin time assumed to remain.
                    </p>
                    <p>
                      <strong className="text-slate-950">
                        Time Saved Per Month:
                      </strong>{" "}
                      manual HR hours x 0.7.
                    </p>
                    <p>
                      This is an estimate for planning, not a guarantee. Actual
                      savings vary by workflows, implementation, and payroll
                      complexity.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
