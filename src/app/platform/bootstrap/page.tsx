"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PlatformBootstrapPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!email || !token) return;
    setError(null);
    fetch(`/api/platform/bootstrap?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setError(data.error || `bootstrap_probe_${r.status}`);
          return;
        }
        setMfaSecret(data.mfaSecretBase32);
        setOtpauthUri(data.otpauthUri);
      })
      .catch(() => setError("network_error"));
  }, [email, token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const r = await fetch("/api/platform/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, token, mfaSecret, totpCode }),
    });
    const data = await r.json().catch(() => ({}));
    setSubmitting(false);
    if (!r.ok) {
      setError(data.error || `bootstrap_failed_${r.status}`);
      return;
    }
    router.push("/platform/login?bootstrapped=1");
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 text-slate-100" style={{ background: "#0A1628", minHeight: "100vh" }}>
      <h1 className="text-2xl font-black">Platform bootstrap</h1>
      <p className="mt-2 text-sm text-slate-400">
        One-time super-admin creation. This page auto-disables after the first admin is created.
      </p>

      {error && (
        <div className="mt-4 rounded border border-red-500 bg-red-950/40 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="text-sm">
          Email
          <input
            className="mt-1 w-full rounded bg-slate-900 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            autoComplete="off"
            required
          />
        </label>
        <label className="text-sm">
          Bootstrap token
          <input
            className="mt-1 w-full rounded bg-slate-900 px-3 py-2 font-mono"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            required
          />
        </label>

        {mfaSecret && otpauthUri && (
          <div className="rounded border border-slate-700 bg-slate-950/60 p-3 text-sm">
            <div className="font-bold">Scan in your authenticator app</div>
            <div className="mt-1 break-all font-mono text-xs text-slate-400">{otpauthUri}</div>
            <div className="mt-2 text-slate-300">
              Secret (manual entry): <span className="font-mono">{mfaSecret}</span>
            </div>
          </div>
        )}

        <label className="text-sm">
          Password (min 12 chars)
          <input
            type="password"
            className="mt-1 w-full rounded bg-slate-900 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={12}
            required
          />
        </label>
        <label className="text-sm">
          TOTP code (6 digits)
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
          disabled={submitting || !mfaSecret}
          className="rounded bg-orange-500 px-4 py-2 font-bold text-slate-950 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create super admin"}
        </button>
      </form>
    </main>
  );
}
