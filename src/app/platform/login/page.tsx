"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PlatformLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/platform";
  const bootstrapped = params.get("bootstrapped") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const r = await fetch("/api/platform/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, totpCode }),
    });
    setSubmitting(false);
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      setError(data.error || `login_failed_${r.status}`);
      return;
    }
    router.push(next);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12" style={{ minHeight: "100vh" }}>
      <div className="mb-8 flex items-center gap-2">
        <span className="rounded bg-orange-500 px-2 py-1 text-xs font-black text-slate-950">PLATFORM</span>
        <h1 className="text-2xl font-black">CircleWorks Admin</h1>
      </div>

      {bootstrapped && (
        <div className="mb-4 rounded border border-emerald-500 bg-emerald-950/40 p-3 text-sm text-emerald-300">
          Super admin created. Sign in below.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded border border-red-500 bg-red-950/40 p-3 text-sm text-red-300">{error}</div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="text-sm">
          Email
          <input
            className="mt-1 w-full rounded bg-slate-900 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            autoComplete="username"
            required
          />
        </label>
        <label className="text-sm">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded bg-slate-900 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <label className="text-sm">
          TOTP code
          <input
            className="mt-1 w-full rounded bg-slate-900 px-3 py-2 font-mono"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            maxLength={6}
            required
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-orange-500 px-4 py-2 font-bold text-slate-950 disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
