"use client";

import { useState } from "react";
import { PLATFORM_AUDIT_REASONS, type PlatformAuditReason } from "@/lib/platform-audit-reasons";

type Props = {
  userId: number;
  email: string;
  canReset: boolean;
  canMfa: boolean;
  canInvite: boolean;
};

async function callAction(url: string, reason: PlatformAuditReason, notes: string) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reasonCode: reason, reasonNotes: notes }),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `action_failed_${r.status}`);
}

function ActionButton({ label, disabled, url }: { label: string; disabled?: boolean; url: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  async function go() {
    const notes = prompt(`${label} — support ticket ref or notes (min 20 chars)`);
    if (!notes || notes.trim().length < 20) {
      setErr("notes_min_20_chars");
      return;
    }
    setBusy(true);
    setErr(null);
    setOk(false);
    try {
      await callAction(url, "support_ticket", notes.trim());
      setOk(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex items-center gap-2">
      <button disabled={disabled || busy} onClick={go} className="rounded bg-orange-500 px-3 py-1.5 text-sm font-bold text-slate-950 disabled:opacity-40">
        {busy ? "…" : label}
      </button>
      {ok && <span className="text-xs text-emerald-300">done</span>}
      {err && <span className="text-xs text-red-400">{err}</span>}
    </div>
  );
}

export default function SupportActions({ userId, canReset, canMfa, canInvite }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <ActionButton label="Force password reset" disabled={!canReset} url={`/api/platform/support/users/${userId}/force-password-reset`} />
      <ActionButton label="Force MFA reset" disabled={!canMfa} url={`/api/platform/support/users/${userId}/force-mfa-reset`} />
      <ActionButton label="Resend invite" disabled={!canInvite} url={`/api/platform/support/users/${userId}/resend-invite`} />
    </div>
  );
}
