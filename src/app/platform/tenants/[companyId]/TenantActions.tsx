"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  PLATFORM_AUDIT_REASONS,
  PLATFORM_AUDIT_REASON_LABELS,
  type PlatformAuditReason,
} from "@/lib/platform-audit-reasons";

type Props = {
  companyId: number;
  suspended: boolean;
  canSuspend: boolean;
  canImpersonate: boolean;
};

function ReasonForm({ label, onSubmit, disabled }: { label: string; onSubmit: (reason: PlatformAuditReason, notes: string) => Promise<void>; disabled?: boolean }) {
  const [reason, setReason] = useState<PlatformAuditReason>("support_ticket");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        setBusy(true);
        try {
          await onSubmit(reason, notes);
        } catch (ex) {
          setErr(ex instanceof Error ? ex.message : "failed");
        } finally {
          setBusy(false);
        }
      }}
    >
      <select value={reason} onChange={(e) => setReason(e.target.value as PlatformAuditReason)} className="rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm">
        {PLATFORM_AUDIT_REASONS.map((r) => (
          <option key={r} value={r}>{PLATFORM_AUDIT_REASON_LABELS[r]}</option>
        ))}
      </select>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes / ticket ref" className="rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-sm" />
      {err && <div className="text-xs text-red-400">{err}</div>}
      <button type="submit" disabled={disabled || busy} className="rounded bg-orange-500 px-3 py-1.5 text-sm font-bold text-slate-950 disabled:opacity-40">
        {busy ? "Working…" : label}
      </button>
    </form>
  );
}

function TenantActions({ companyId, suspended, canSuspend, canImpersonate }: Props) {
  const router = useRouter();

  async function callSuspend(reason: PlatformAuditReason, notes: string) {
    const r = await fetch(`/api/platform/tenants/${companyId}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reasonCode: reason, reasonNotes: notes }),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `suspend_failed_${r.status}`);
    router.refresh();
  }

  async function callReactivate(reason: PlatformAuditReason, notes: string) {
    const r = await fetch(`/api/platform/tenants/${companyId}/reactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reasonCode: reason, reasonNotes: notes }),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `reactivate_failed_${r.status}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      {suspended ? (
        <div>
          <div className="mb-1 font-bold">Reactivate tenant</div>
          <ReasonForm label="Reactivate" disabled={!canSuspend} onSubmit={callReactivate} />
        </div>
      ) : (
        <div>
          <div className="mb-1 font-bold">Suspend tenant</div>
          <ReasonForm label="Suspend" disabled={!canSuspend} onSubmit={callSuspend} />
        </div>
      )}
      {!canImpersonate && <p className="text-xs text-slate-500">Impersonation requires the `impersonation.start` permission.</p>}
    </div>
  );
}

function ImpersonateLink({ companyId, userId, email }: { companyId: number; userId: number; email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function go() {
    if (!confirm(`Impersonate ${email}? A 30-minute session will start with all writes double-audited.`)) return;
    setBusy(true);
    setErr(null);
    const reasonNotes = prompt("Reason notes (support ticket ref, min 20 chars)");
    if (!reasonNotes || reasonNotes.trim().length < 20) {
      setBusy(false);
      setErr("notes_min_20_chars");
      return;
    }
    const r = await fetch(`/api/platform/impersonation/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, userId, reasonCode: "support_ticket", reasonNotes }),
    });
    setBusy(false);
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      setErr(data.error || `impersonation_failed_${r.status}`);
      return;
    }
    router.push("/app");
  }
  return (
    <>
      <button onClick={go} disabled={busy} className="text-xs text-orange-400 hover:underline disabled:opacity-40">
        {busy ? "…" : "Impersonate"}
      </button>
      {err && <div className="text-xs text-red-400">{err}</div>}
    </>
  );
}

TenantActions.ImpersonateLink = ImpersonateLink;
export default TenantActions;
