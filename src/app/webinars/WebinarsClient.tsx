"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  Clock,
  Lightbulb,
  Mail,
  PlayCircle,
  User,
  X,
} from "lucide-react";

import {
  buildWebinarIcs,
  formatWebinarDateTime,
  type Webinar,
  type WebinarTopic,
} from "@/data/webinars";

type CaptureFields = {
  name: string;
  email: string;
  company: string;
};

type WebinarsClientProps = {
  initialWebinars: Webinar[];
  featuredTags: string[];
};

const tabs = ["All", "Payroll", "Compliance", "HR Tips", "Product Demo"];

const blankCapture: CaptureFields = {
  name: "",
  email: "",
  company: "",
};

function topicClasses(topic: string) {
  if (topic === "Payroll") return "bg-blue-50 text-blue-700 border-blue-100";
  if (topic === "Compliance") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (topic === "Product Demo") return "bg-violet-50 text-violet-700 border-violet-100";
  return "bg-amber-50 text-amber-700 border-amber-100";
}

export default function WebinarsClient({
  initialWebinars,
  featuredTags,
}: WebinarsClientProps) {
  const [activeTab, setActiveTab] = useState("All");
  const [registerWebinar, setRegisterWebinar] = useState<Webinar | null>(null);
  const [leadGateWebinar, setLeadGateWebinar] = useState<Webinar | null>(null);
  const [capture, setCapture] = useState<CaptureFields>(blankCapture);
  const [mailingEmail, setMailingEmail] = useState("");
  const [suggestion, setSuggestion] = useState({ name: "", email: "", topic: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState<"register" | "lead" | "mailing" | "topic" | null>(null);
  const [error, setError] = useState("");

  const upcomingWebinars = useMemo(
    () => initialWebinars.filter((webinar) => webinar.type === "upcoming"),
    [initialWebinars],
  );
  const onDemandWebinars = useMemo(
    () => initialWebinars.filter((webinar) => webinar.type === "ondemand"),
    [initialWebinars],
  );
  const filteredOnDemand =
    activeTab === "All"
      ? onDemandWebinars
      : onDemandWebinars.filter((webinar) =>
          webinar.topics.includes(activeTab as WebinarTopic),
        );

  function openRegisterModal(webinar: Webinar) {
    setRegisterWebinar(webinar);
    setLeadGateWebinar(null);
    setSuccessState(null);
    setError("");
    setCapture(blankCapture);
  }

  function openLeadGate(webinar: Webinar) {
    setLeadGateWebinar(webinar);
    setRegisterWebinar(null);
    setSuccessState(null);
    setError("");
    setCapture({ ...blankCapture, company: "" });
  }

  function closeModals() {
    setRegisterWebinar(null);
    setLeadGateWebinar(null);
    setSuccessState(null);
    setError("");
  }

  function downloadCalendar(webinar: Webinar) {
    const blob = new Blob([buildWebinarIcs(webinar)], {
      type: "text/calendar;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${webinar.slug}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async function submitRegistration(event: React.FormEvent<HTMLFormElement>, type: "register" | "lead") {
    event.preventDefault();
    const selectedWebinar = type === "register" ? registerWebinar : leadGateWebinar;

    if (!selectedWebinar) return;

    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/webinars/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...capture,
        webinarId: selectedWebinar.id,
        type,
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error || "Something went wrong. Please try again.");
      return;
    }

    setSuccessState(type);
  }

  async function submitCta(event: React.FormEvent<HTMLFormElement>, type: "mailing" | "topic") {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/webinars/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        type === "mailing"
          ? { type, email: mailingEmail }
          : { type, name: suggestion.name, email: suggestion.email, topic: suggestion.topic },
      ),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error || "Something went wrong. Please try again.");
      return;
    }

    setSuccessState(type);
    if (type === "mailing") setMailingEmail("");
    if (type === "topic") setSuggestion({ name: "", email: "", topic: "" });
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="bg-[#0A1628] pt-32 pb-20 text-center px-4 border-b border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-200 mb-7">
            Live events and on-demand sessions
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            Webinars & Events
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
            Expert-led sessions for payroll, HR, compliance, and CircleWorks product workflows.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {featuredTags.map((tag) => (
              <a
                key={tag}
                href="#on-demand"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-blue-300/60 hover:text-white"
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600 mb-3">
              Reserve a seat
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0A1628] tracking-tight">
              Upcoming Webinars
            </h2>
          </div>
          <p className="text-slate-500 font-medium max-w-xl">
            Registration is free. Confirmation details are sent by email after signup.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {upcomingWebinars.map((webinar) => (
            <article
              key={webinar.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 transition-all flex flex-col group"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={webinar.thumbnail}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {webinar.topics.map((topic) => (
                    <span
                      key={topic}
                      className={`border text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${topicClasses(topic)}`}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-[#0A1628] mb-4 leading-tight">
                  <Link href={`/webinars/${webinar.slug}`} className="hover:text-blue-600 transition-colors">
                    {webinar.title}
                  </Link>
                </h3>

                <div className="space-y-3 mb-7 text-sm">
                  <div className="flex items-start text-slate-600 font-semibold">
                    <Calendar className="w-5 h-5 mr-3 text-blue-500 shrink-0" />
                    <span>{formatWebinarDateTime(webinar)}</span>
                  </div>
                  <div className="flex items-center text-slate-600 font-semibold">
                    <Clock className="w-5 h-5 mr-3 text-blue-500 shrink-0" />
                    {webinar.durationMinutes} minutes
                  </div>
                  <div className="flex items-start text-slate-600 font-semibold">
                    <User className="w-5 h-5 mr-3 text-blue-500 shrink-0" />
                    <span>
                      {webinar.speaker}
                      <span className="block text-slate-400 font-bold">{webinar.speakerTitle}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => openRegisterModal(webinar)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-5 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Register Free
                  </button>
                  <button
                    onClick={() => downloadCalendar(webinar)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 px-5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <CalendarPlus className="w-5 h-5" />
                    Add to Calendar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="on-demand" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600 mb-3">
                Watch anytime
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-[#0A1628] tracking-tight">
                On-Demand Library
              </h2>
            </div>

            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter on-demand webinars">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full font-black text-sm transition-all ${
                    activeTab === tab
                      ? "bg-[#0A1628] text-white shadow-lg shadow-slate-900/15"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                  aria-selected={activeTab === tab}
                  role="tab"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {filteredOnDemand.map((webinar) => (
              <article
                key={webinar.id}
                className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:shadow-slate-200/80 transition-shadow group flex flex-col"
              >
                <button
                  type="button"
                  className="h-48 overflow-hidden relative text-left"
                  onClick={() => openLeadGate(webinar)}
                  aria-label={`Watch ${webinar.title}`}
                >
                  <img
                    src={webinar.thumbnail}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-16 h-16 text-white" />
                  </span>
                  <span className="absolute bottom-4 right-4 bg-black/75 text-white text-xs font-black px-2 py-1 rounded">
                    {webinar.durationMinutes} min
                  </span>
                </button>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-black text-[#0A1628] mb-3 leading-tight">
                    <Link href={`/webinars/${webinar.slug}`} className="hover:text-blue-600 transition-colors">
                      {webinar.title}
                    </Link>
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {webinar.topics.map((topic) => (
                      <span
                        key={topic}
                        className={`border text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${topicClasses(topic)}`}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => openLeadGate(webinar)}
                    className="mt-auto text-blue-600 font-black flex items-center gap-1 group/btn w-max"
                  >
                    Watch Now
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.85fr_1fr] gap-10 items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300 mb-3">
                Keep the calendar useful
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-5">
                Get invites, or tell us what to cover next.
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed font-medium">
                Join the webinar mailing list for upcoming invites, or send a topic request to the CircleWorks team.
              </p>
              {successState === "mailing" && (
                <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">
                  <CheckCircle2 className="w-5 h-5" />
                  You're on the invite list.
                </p>
              )}
              {successState === "topic" && (
                <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">
                  <CheckCircle2 className="w-5 h-5" />
                  Topic suggestion received.
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <form
                onSubmit={(event) => submitCta(event, "mailing")}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-6"
              >
                <Mail className="w-8 h-8 text-blue-300 mb-5" />
                <h3 className="text-xl font-black mb-2">Join mailing list</h3>
                <label className="sr-only" htmlFor="mailing-email">
                  Work email
                </label>
                <input
                  id="mailing-email"
                  name="email"
                  required
                  type="email"
                  autoComplete="email"
                  value={mailingEmail}
                  onChange={(event) => setMailingEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="mt-5 w-full px-4 py-3 rounded-xl border border-white/10 bg-white text-[#0A1628] placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/30 outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-3 w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-3 rounded-xl transition-colors disabled:opacity-60"
                >
                  Join Mailing List
                </button>
              </form>

              <form
                onSubmit={(event) => submitCta(event, "topic")}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-6"
              >
                <Lightbulb className="w-8 h-8 text-amber-200 mb-5" />
                <h3 className="text-xl font-black mb-2">Suggest a webinar topic</h3>
                <div className="mt-5 space-y-3">
                  <input
                    name="name"
                    required
                    type="text"
                    autoComplete="name"
                    value={suggestion.name}
                    onChange={(event) => setSuggestion({ ...suggestion, name: event.target.value })}
                    placeholder="Name"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white text-[#0A1628] placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/30 outline-none"
                  />
                  <input
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                    value={suggestion.email}
                    onChange={(event) => setSuggestion({ ...suggestion, email: event.target.value })}
                    placeholder="Work email"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white text-[#0A1628] placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/30 outline-none"
                  />
                  <textarea
                    name="topic"
                    required
                    rows={3}
                    value={suggestion.topic}
                    onChange={(event) => setSuggestion({ ...suggestion, topic: event.target.value })}
                    placeholder="Topic idea"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white text-[#0A1628] placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/30 outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-3 w-full bg-white hover:bg-slate-100 text-blue-700 font-black py-3 rounded-xl transition-colors disabled:opacity-60"
                >
                  Send Topic
                </button>
              </form>
            </div>
          </div>
          {error && <p className="mt-6 text-sm font-bold text-red-200">{error}</p>}
        </div>
      </section>

      {(registerWebinar || leadGateWebinar) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModals}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {registerWebinar && successState === "register" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-[#0A1628] mb-2">You're registered</h3>
                <p className="text-slate-500 font-medium">
                  A confirmation email with webinar details is on its way.
                </p>
                <button
                  type="button"
                  onClick={() => downloadCalendar(registerWebinar)}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-700"
                >
                  <CalendarPlus className="w-5 h-5" />
                  Add to Calendar
                </button>
              </div>
            )}

            {leadGateWebinar && successState === "lead" && (
              <div>
                <h3 className="text-2xl font-black text-[#0A1628] mb-5">{leadGateWebinar.title}</h3>
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-950">
                  <iframe
                    src={leadGateWebinar.videoUrl}
                    title={leadGateWebinar.title}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {registerWebinar && successState !== "register" && (
              <>
                <h3 className="text-2xl font-black text-[#0A1628] mb-2">Register Free</h3>
                <p className="text-slate-500 mb-6 font-medium">{registerWebinar.title}</p>
                <form onSubmit={(event) => submitRegistration(event, "register")} className="space-y-4">
                  <CaptureInputs capture={capture} setCapture={setCapture} includeCompany />
                  {error && <p className="text-sm font-bold text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-colors mt-2 disabled:opacity-60"
                  >
                    {isSubmitting ? "Registering..." : "Complete Registration"}
                  </button>
                </form>
              </>
            )}

            {leadGateWebinar && successState !== "lead" && (
              <>
                <h3 className="text-2xl font-black text-[#0A1628] mb-2">Watch On Demand</h3>
                <p className="text-slate-500 mb-6 font-medium">
                  Enter your details to unlock {leadGateWebinar.title}.
                </p>
                <form onSubmit={(event) => submitRegistration(event, "lead")} className="space-y-4">
                  <CaptureInputs capture={capture} setCapture={setCapture} />
                  {error && <p className="text-sm font-bold text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0A1628] hover:bg-slate-800 text-white font-black py-4 rounded-xl transition-colors mt-2 disabled:opacity-60"
                  >
                    {isSubmitting ? "Unlocking..." : "Watch Video Now"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CaptureInputs({
  capture,
  setCapture,
  includeCompany = false,
}: {
  capture: CaptureFields;
  setCapture: React.Dispatch<React.SetStateAction<CaptureFields>>;
  includeCompany?: boolean;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
        <input
          name="name"
          required
          type="text"
          autoComplete="name"
          value={capture.name}
          onChange={(event) => setCapture({ ...capture, name: event.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          placeholder="Jane Doe"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Work Email</label>
        <input
          name="email"
          required
          type="email"
          autoComplete="email"
          value={capture.email}
          onChange={(event) => setCapture({ ...capture, email: event.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          placeholder="jane@company.com"
        />
      </div>
      {includeCompany && (
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Company Name</label>
          <input
            required
            name="company"
            type="text"
            autoComplete="organization"
            value={capture.company}
            onChange={(event) => setCapture({ ...capture, company: event.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            placeholder="Acme Corp"
          />
        </div>
      )}
    </>
  );
}
