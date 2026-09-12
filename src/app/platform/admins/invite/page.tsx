"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PLATFORM_ADMIN_ROLES, type PlatformAdminRole } from "@/lib/platform-rbac";
import { PLATFORM_AUDIT_REASONS, type PlatformAuditReason } from "@/lib/platform-audit-reasons";

export default function InviteAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<PlatformAdminRole>("read_only");
  const [reasonCode, setReasonCode] = useState<PlatformAuditReason>("internal_investigation");
  const [reasonNotes, setReasonNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const r = await fetch("/api/platform/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role, reasonCode, reasonNotes }),
    });
    setBusy(false);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setErr(data.error || `invite_failed_${r.status}`);
      return;
    }
    setMfaSecret(data.mfaSecretBase32);
    setOtpauthUri(data.otpauthUri);
  }

  if (mfaSecret) {
    return (
      <div className="p-8 text-slate-100">
        <h1 className="text-2xl font-black">Admin created — hand off credentials</h1>
        <p className="mt-2 text-sm text-slate-400">
          Deliver these securely (Signal, in person). This screen shows the TOTP secret exactly ONCE.
        </p>
        <div className="mt-4 rounded border border-orange-500/60 bg-orange-500/10 p-4 font-mono text-sm">
          <div><b>Email:</b> {email}</div>
          <div className="mt-2 break-all"><b>otpauth URI:</b> {otpauthUri}</div>
          <div className="mt-2"><b>Secret (manual):</b> {mfaSecret}</div>
        </div>
        <button
          className="mt-6 rounded bg-slate-800 px-3 py-1.5 text-sm font-bold"
          onClick={() => router.push("/platform/admins")}
        >
          Back to admins
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 text-slate-100">
      <h1 className="text-2xl font-black">Invite platform admin</h1>
      <form onSubmit={submit} className="mt-4 flex max-w-md flex-col gap-3 text-sm">
        {err && <div className="rounded border border-red-500 bg-red-950/40 p-2 text-red-300">{err}</div>}
        <label>Email
          <input value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} required className="mt-1 w-full rounded bg-slate-900 px-3 py-2" />
        </label>
        <label>Initial password (min 12 chars)
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={12} required className="mt-1 w-full rounded bg-slate-900 px-3 py-2" />
        </label>
        <label>Role
          <select value={role} onChange={(e) => setRole(e.target.value as PlatformAdminRole)} className="mt-1 w-full rounded bg-slate-900 px-3 py-2">
            {PLATFORM_ADMIN_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label>Reason code
          <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value as PlatformAuditReason)} className="mt-1 w-full rounded bg-slate-900 px-3 py-2">
            {PLATFORM_AUDIT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label>Reason notes
          <input value={reasonNotes} onChange={(e) => setReasonNotes(e.target.value)} className="mt-1 w-full rounded bg-slate-900 px-3 py-2" />
        </label>
        <button type="submit" disabled={busy} className="mt-2 rounded bg-orange-500 px-3 py-1.5 font-bold text-slate-950 disabled:opacity-40">
          {busy ? "Creating…" : "Create admin"}
        </button>
      </form>
    </div>
  );
}
