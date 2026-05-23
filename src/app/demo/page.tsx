"use client";

import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Phone,
  PlayCircle,
  Users,
} from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const demoBullets = [
  "A walkthrough mapped to your payroll, HR, and compliance setup.",
  "A look at real workflows for admins, managers, and employees.",
  "Clear next steps, pricing fit, and migration guidance if CircleWorks is useful.",
];

const salesTeam = [
  {
    name: "Maya",
    role: "Payroll specialist",
    image: "https://i.pravatar.cc/160?img=47",
  },
  {
    name: "Jordan",
    role: "HR systems lead",
    image: "https://i.pravatar.cc/160?img=12",
  },
  {
    name: "Priya",
    role: "Compliance advisor",
    image: "https://i.pravatar.cc/160?img=32",
  },
];

const timeSlots = ["9:30 AM", "11:00 AM", "1:30 PM", "3:00 PM"];
const companySizes = [
  "1-20",
  "21-50",
  "51-200",
  "201-500",
  "501-1,000",
  "1,000+",
];

function getDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().split("T")[0];
}

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState(timeSlots[1]);
  const [selectedDate, setSelectedDate] = useState(getDefaultDate());

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
    const size = String(formData.get("companySize") || "");
    const currentTool = String(formData.get("currentTool") || "");
    const phone = String(formData.get("phone") || "");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "demo",
          name,
          email,
          company,
          companySize: size,
          phone,
          currentTool,
          demoSlot: selectedSlot,
          message: `Demo request for ${selectedSlot}. Current tool: ${currentTool || "Not provided"}. Phone: ${phone || "Not provided"}.`,
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to book demo");
      }

      toast.success(
        "Demo request sent. Sales will confirm the calendar invite shortly.",
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
    <main className="min-h-screen bg-white font-sans text-[#0A1628]">
      <Navbar forceLight />

      <section className="border-b border-slate-200 bg-white px-6 pb-20 pt-28 lg:pb-28 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
              <PlayCircle className="h-4 w-4" />
              No sales pitch
            </p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              See CircleWorks built for your company.
            </h1>
            <p className="mt-5 text-xl leading-8 text-slate-600">
              No sales pitch. Just a real look at the product, your use case,
              and whether CircleWorks is a fit.
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
            <aside className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-black text-slate-950">
                  What to expect in a 30-min demo
                </h2>
                <div className="mt-5 space-y-4">
                  {demoBullets.map((bullet) => (
                    <div key={bullet} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                      <p className="text-sm font-semibold leading-6 text-slate-700">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                  <Users className="h-4 w-4 text-blue-600" />
                  Sales team
                </div>
                <div className="space-y-4">
                  {salesTeam.map((person) => (
                    <div key={person.name} className="flex items-center gap-3">
                      <img
                        src={person.image}
                        alt={`${person.name} headshot`}
                        className="h-12 w-12 rounded-full border-2 border-white bg-slate-200 object-cover shadow-sm"
                      />
                      <div>
                        <div className="font-black text-slate-950">
                          {person.name}
                        </div>
                        <div className="text-sm font-medium text-slate-500">
                          {person.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 md:p-8">
              <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    Choose a demo slot
                  </div>
                  <label className="mt-5 block text-sm font-bold text-slate-700">
                    Date
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                  <div className="mt-5">
                    <div className="mb-2 text-sm font-bold text-slate-700">
                      Time
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`rounded-xl border px-3 py-3 text-sm font-black transition ${selectedTime === slot ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 rounded-xl bg-white p-4 text-sm font-semibold text-slate-600">
                    <div className="flex items-center gap-2 text-slate-950">
                      <Clock className="h-4 w-4 text-blue-600" />
                      30 minutes
                    </div>
                    <p className="mt-2">Selected: {selectedSlot}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm font-bold text-slate-700">
                      Name
                      <input
                        name="name"
                        required
                        type="text"
                        placeholder="Alex Rivera"
                        className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                    </label>
                    <label className="text-sm font-bold text-slate-700">
                      Email
                      <input
                        name="email"
                        required
                        type="email"
                        placeholder="alex@company.com"
                        className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                    </label>
                  </div>
                  <label className="block text-sm font-bold text-slate-700">
                    Company
                    <input
                      name="company"
                      required
                      type="text"
                      placeholder="Company name"
                      className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm font-bold text-slate-700">
                      Size
                      <select
                        name="companySize"
                        required
                        defaultValue=""
                        className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
                      Phone
                      <input
                        name="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                    </label>
                  </div>
                  <label className="block text-sm font-bold text-slate-700">
                    Current tool
                    <input
                      name="currentTool"
                      type="text"
                      placeholder="Gusto, Rippling, ADP, spreadsheets..."
                      className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Request demo"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="flex items-center justify-center gap-2 text-center text-xs font-bold text-slate-500">
                    <Phone className="h-3.5 w-3.5" />
                    Sales notified after submission.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
