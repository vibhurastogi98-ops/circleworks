"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Phone,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const timeSlots = ["9:30 AM", "11:00 AM", "1:30 PM", "3:00 PM"];

const companySizes = [
  "1-20",
  "21-50",
  "51-200",
  "201-500",
  "501-1,000",
  "1,000+",
];

const providers = [
  "Gusto",
  "ADP",
  "Paychex",
  "QuickBooks Payroll",
  "Rippling",
  "BambooHR",
  "Excel/CSV",
  "Other",
];

const planningNotes = [
  "Current provider export checklist",
  "Historical payroll import scope",
  "Parallel run and go-live timeline",
];

function getDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().split("T")[0];
}

export default function MigrationInterestForm() {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getDefaultDate());
  const [selectedTime, setSelectedTime] = useState(timeSlots[1]);

  const selectedSlot = useMemo(
    () => `${selectedDate} at ${selectedTime} ET`,
    [selectedDate, selectedTime],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const company = String(formData.get("company") || "");
    const companySize = String(formData.get("companySize") || "");
    const phone = String(formData.get("phone") || "");
    const currentTool = String(formData.get("currentTool") || "");
    const firstPayrollDate = String(formData.get("firstPayrollDate") || "");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "migration",
          name,
          email,
          company,
          companySize,
          phone,
          currentTool,
          demoSlot: selectedSlot,
          message: [
            `Migration planning request for ${selectedSlot}.`,
            `Current provider: ${currentTool || "Not provided"}.`,
            `Target first payroll date: ${firstPayrollDate || "Not provided"}.`,
          ].join(" "),
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to send migration request");
      }

      toast.success(
        "Migration request sent. A specialist will confirm the 30-minute call shortly.",
      );
      form.reset();
      setSelectedDate(getDefaultDate());
      setSelectedTime(timeSlots[1]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="migration-interest"
      className="border-t border-slate-200 bg-[#0A1628] px-6 py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <div className="text-white">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-white/10 text-blue-200">
            <CalendarDays className="h-7 w-7" />
          </div>
          <h2 className="max-w-2xl text-3xl font-black tracking-tight md:text-5xl">
            Talk to a migration specialist
          </h2>
          <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-slate-300">
            Book a 30-minute session to review your current provider, export
            path, first payroll date, and parallel run plan.
          </p>

          <div className="mt-8 grid gap-3">
            {planningNotes.map((note) => (
              <div key={note} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-300" />
                <span className="text-sm font-bold text-slate-200">
                  {note}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-white/10 bg-white p-5 shadow-2xl shadow-black/30 md:p-7"
        >
          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                <Clock className="h-5 w-5 text-blue-600" />
                30-minute planning call
              </div>
              <label className="mt-5 block text-sm font-bold text-slate-700">
                Preferred date
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>
              <div className="mt-5">
                <div className="mb-2 text-sm font-bold text-slate-700">
                  Preferred time
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`rounded-lg border px-3 py-3 text-sm font-black transition ${selectedTime === slot ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5 rounded-lg bg-white p-4 text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-2 text-slate-950">
                  <Phone className="h-4 w-4 text-blue-600" />
                  Requested slot
                </div>
                <p className="mt-1">{selectedSlot}</p>
              </div>
            </div>

            <div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold text-slate-700">
                  Name
                  <input
                    name="name"
                    required
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Rivera"
                    className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Work Email
                  <input
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="alex@company.com"
                    className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Company
                  <input
                    name="company"
                    required
                    type="text"
                    autoComplete="organization"
                    placeholder="Company name"
                    className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Phone
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(555) 123-0198"
                    className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Company size
                  <select
                    name="companySize"
                    required
                    defaultValue=""
                    className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="" disabled>
                      Select size
                    </option>
                    {companySizes.map((size) => (
                      <option key={size} value={size}>
                        {size} employees
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Current provider
                  <select
                    name="currentTool"
                    required
                    defaultValue=""
                    className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="" disabled>
                      Select provider
                    </option>
                    {providers.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-4 block text-sm font-bold text-slate-700">
                Target first payroll date
                <input
                  name="firstPayrollDate"
                  type="date"
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? "Sending..." : "Talk to a migration specialist"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Users className="h-4 w-4 text-blue-600" />
                Dedicated specialist assigned after the request is confirmed.
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
