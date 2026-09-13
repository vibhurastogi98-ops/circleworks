"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PLATFORM_AUDIT_REASONS, type PlatformAuditReason } from "@/lib/platform-audit-reasons";

const ALL_CAPABILITIES = [
  "dashboard", "payroll", "ownerPayroll", "ownerTaxes", "employees",
  "contractors", "contractorOnboarding", "clients", "hiring", "onboarding",
  "benefits", "time", "expenses", "performance", "learning", "compliance",
  "taxCompliance", "reports", "documents", "automations", "settings",
] as const;

function PlanForm({
  companyId,
  currentPlanId,
  currentSeatCount,
  catalog,
  canEdit,
}: {
  companyId: number;
  currentPlanId: string | null;
  currentSeatCount: number;
  catalog: { id: string; name: string }[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [planId, setPlanId] = useState(currentPlanId ?? catalog[0]?.id ?? "");
  const [seats, setSeats] = useState(currentSeatCount);
  const [reason, setReason] = useState<PlatformAuditReason>("billing_correction");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    setBusy(true);
    const r = await fetch(`/api/platform/billing/tenants/${companyId}/plan`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, seatCount: Number(seats), reasonCode: reason, reasonNotes: notes }),
    });
    setBusy(false);
    if (!r.ok) {
      setErr((await r.json().catch(() => ({}))).error || `plan_change_failed_${r.status}`);
      return;
    }
    setOk(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 text-sm">
      <label>Plan
        <select disabled={!canEdit} value={planId} onChange={(e) => setPlanId(e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950/60 px-2 py-1">
          {catalog.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <label>Seat count
        <input type="number" min={0} disabled={!canEdit} value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="mt-1 w-full rounded border border-slate-700 bg-slate-950/60 px-2 py-1" />
      </label>
      <label>Reason
        <select disabled={!canEdit} value={reason} onChange={(e) => setReason(e.target.value as PlatformAuditReason)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950/60 px-2 py-1">
          {PLATFORM_AUDIT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>
      <label>Notes
        <input disabled={!canEdit} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ticket ref, etc." className="mt-1 w-full rounded border border-slate-700 bg-slate-950/60 px-2 py-1" />
      </label>
      {err && <div className="text-xs text-red-400">{err}</div>}
      {ok && <div className="text-xs text-emerald-300">Plan updated.</div>}
      <button type="submit" disabled={!canEdit || busy} className="rounded bg-orange-500 px-3 py-1.5 font-bold text-slate-950 disabled:opacity-40">
        {busy ? "Saving…" : "Save plan"}
      </button>
    </form>
  );
}

function OverrideEditor({
  companyId,
  overrides,
  canEdit,
}: {
  companyId: number;
  overrides: Record<string, boolean>;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<Record<string, boolean | undefined>>({ ...overrides });
  const [reason, setReason] = useState<PlatformAuditReason>("compliance_review");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function save() {
    setErr(null);
    setOk(false);
    setBusy(true);
    // Only send keys that are explicitly true/false (skip undefined = no override).
    const payload: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(state)) if (typeof v === "boolean") payload[k] = v;
    const r = await fetch(`/api/platform/flags/tenant/${companyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overrides: payload, reasonCode: reason, reasonNotes: notes }),
    });
    setBusy(false);
    if (!r.ok) {
      setErr((await r.json().catch(() => ({}))).error || `override_failed_${r.status}`);
      return;
    }
    setOk(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="max-h-60 overflow-y-auto rounded border border-slate-800 p-2">
        {ALL_CAPABILITIES.map((cap) => {
          const value = state[cap];
          const label = value === true ? "force on" : value === false ? "force off" : "unset";
          return (
            <div key={cap} className="flex items-center justify-between border-b border-slate-800/40 py-1">
              <span className="font-mono text-xs">{cap}</span>
              <select
                disabled={!canEdit}
                value={value === undefined ? "unset" : value ? "on" : "off"}
                onChange={(e) => {
                  const v = e.target.value;
                  setState((s) => ({ ...s, [cap]: v === "unset" ? undefined : v === "on" }));
                }}
                className="rounded border border-slate-700 bg-slate-950/60 px-2 py-0.5 text-xs"
                title={label}
              >
                <option value="unset">unset</option>
                <option value="on">force on</option>
                <option value="off">force off</option>
              </select>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-slate-500">
        "force on" cannot enable a capability the account type's matrix has permanently off — the matrix is the ceiling.
      </div>
      <label>Reason
        <select disabled={!canEdit} value={reason} onChange={(e) => setReason(e.target.value as PlatformAuditReason)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950/60 px-2 py-1">
          {PLATFORM_AUDIT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>
      <label>Notes
        <input disabled={!canEdit} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950/60 px-2 py-1" />
      </label>
      {err && <div className="text-xs text-red-400">{err}</div>}
      {ok && <div className="text-xs text-emerald-300">Overrides saved.</div>}
      <button onClick={save} disabled={!canEdit || busy} className="rounded bg-orange-500 px-3 py-1.5 font-bold text-slate-950 disabled:opacity-40">
        {busy ? "Saving…" : "Save overrides"}
      </button>
    </div>
  );
}

function SoftDeleteButton({ companyId }: { companyId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function go() {
    const notes = prompt("Soft-delete this tenant. Reason notes (min 20 chars):");
    if (!notes || notes.trim().length < 20) {
      setErr("notes_min_20_chars");
      return;
    }
    if (!confirm("Soft-delete confirmed? Tenant traffic will stop and the row is recoverable from the panel.")) return;
    setBusy(true);
    setErr(null);
    const r = await fetch(`/api/platform/tenants/${companyId}/soft-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reasonCode: "legal_request", reasonNotes: notes.trim() }),
    });
    setBusy(false);
    if (!r.ok) {
      setErr((await r.json().catch(() => ({}))).error || `soft_delete_failed_${r.status}`);
      return;
    }
    router.refresh();
  }
  return (
    <div className="flex flex-col gap-2 text-sm">
      <button onClick={go} disabled={busy} className="w-fit rounded bg-red-600 px-3 py-1.5 font-bold text-white disabled:opacity-40">
        {busy ? "…" : "Soft-delete tenant"}
      </button>
      {err && <span className="text-xs text-red-400">{err}</span>}
    </div>
  );
}

const TenantPhase2 = { PlanForm, OverrideEditor, SoftDeleteButton };
export default TenantPhase2;
