"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PLATFORM_AUDIT_REASONS, type PlatformAuditReason } from "@/lib/platform-audit-reasons";

export default function KillSwitchToggle({
  capability,
  currentlyEnabled,
  disabled,
}: {
  capability: string;
  currentlyEnabled: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function toggle() {
    if (disabled) return;
    const target = !currentlyEnabled;
    const reason = prompt(
      `Reason code (one of: ${PLATFORM_AUDIT_REASONS.join(", ")})`,
      "security_incident",
    ) as PlatformAuditReason | null;
    if (!reason) return;
    setBusy(true);
    setErr(null);
    const r = await fetch(`/api/platform/flags/kill/${encodeURIComponent(capability)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: target, reasonCode: reason }),
    });
    setBusy(false);
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      setErr(data.error || `toggle_failed_${r.status}`);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={toggle}
        className={`rounded px-2 py-1 text-xs font-bold ${
          currentlyEnabled ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
        } disabled:opacity-40`}
      >
        {busy ? "…" : currentlyEnabled ? "Kill" : "Restore"}
      </button>
      {err && <span className="text-xs text-red-400">{err}</span>}
    </div>
  );
}
