"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Share2,
  ShieldCheck,
} from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const companySizes = [
  "1-20",
  "21-50",
  "51-200",
  "201-500",
  "501-1,000",
  "1,000+",
];

const supportChannels = [
  {
    title: "Chat",
    detail: "Online Monday-Friday, 9am-6pm ET",
    href: "/help",
    icon: MessageCircle,
  },
  {
    title: "Email",
    detail: "24hr response for all teams",
    href: "mailto:support@circleworks.com",
    icon: Mail,
  },
  {
    title: "Phone",
    detail: "Priority support for Pro+ only",
    href: "tel:+18005550198",
    icon: Phone,
  },
];

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: Share2 },
  { label: "X", href: "https://twitter.com", icon: MessageCircle },
  { label: "Community", href: "/community", icon: Share2 },
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      requestType: "contact",
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      company: String(formData.get("company") || ""),
      companySize: String(formData.get("companySize") || ""),
      message: String(formData.get("message") || ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to send message");
      }

      toast.success("Message sent. We will reply within one business day.");
      form.reset();
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
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-16">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              Contact CircleWorks
            </p>
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
              Payroll and HR questions, answered by humans.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Tell us about your team, current stack, and what you are trying to
              solve. We will route your message to the right specialist.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-bold text-slate-700">
                  Name
                  <input
                    name="name"
                    required
                    type="text"
                    placeholder="Alex Rivera"
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Work Email
                  <input
                    name="email"
                    required
                    type="email"
                    placeholder="alex@company.com"
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Company
                  <input
                    name="company"
                    required
                    type="text"
                    placeholder="Company name"
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Company size
                  <select
                    name="companySize"
                    required
                    defaultValue=""
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
              </div>
              <label className="mt-5 block text-sm font-bold text-slate-700">
                Message
                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder="Tell us what you need help with."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Submit"}
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          <aside className="space-y-5 lg:pt-32">
            <div className="grid gap-4">
              {supportChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <Link
                    key={channel.title}
                    href={channel.href}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-base font-black text-slate-950">
                            {channel.title}
                          </h2>
                          <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-blue-600" />
                        </div>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {channel.detail}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-950">
                    We're remote-first
                  </h2>
                  <p className="text-sm font-medium text-slate-500">
                    Serving all 50 states.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center">
                <div>
                  <MapPin className="mx-auto h-7 w-7 text-blue-600" />
                  <p className="mt-3 text-sm font-black text-slate-700">
                    We're remote-first - serving all 50 states.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                <Clock3 className="h-4 w-4 text-blue-600" />
                Follow and reach us
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
