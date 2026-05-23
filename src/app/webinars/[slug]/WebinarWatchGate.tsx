"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { CheckCircle2, PlayCircle } from "lucide-react";

import type { Webinar } from "@/data/webinars";

export default function WebinarWatchGate({ webinar }: { webinar: Webinar }) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/webinars/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "lead",
        webinarId: webinar.id,
        name: form.name,
        email: form.email,
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error || "Unable to unlock this webinar right now.");
      return;
    }

    setIsUnlocked(true);
  }

  if (isUnlocked) {
    return (
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
          <CheckCircle2 className="w-5 h-5" />
          Video unlocked
        </div>
        <div className="aspect-video bg-black rounded-2xl overflow-hidden">
          <iframe
            src={webinar.videoUrl}
            title={webinar.title}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <PlayCircle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#0A1628]">Watch this webinar</h2>
          <p className="text-sm font-bold text-slate-500">Enter your name and email to unlock the video.</p>
        </div>
      </div>

      <form onSubmit={submitLead} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
        <label className="sr-only" htmlFor="watch-name">
          Full name
        </label>
        <input
          id="watch-name"
          required
          type="text"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Full name"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <label className="sr-only" htmlFor="watch-email">
          Work email
        </label>
        <input
          id="watch-email"
          required
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="Work email"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-blue-600 px-6 py-3 font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? "Unlocking..." : "Watch Now"}
        </button>
      </form>
      {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
    </div>
  );
}
