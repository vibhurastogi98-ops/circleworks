"use client";

import { useEffect, useState } from "react";

type Props = {
  impersonationId: number;
  targetEmail: string;
  expiresAt: string; // ISO
};

function formatRemaining(ms: number): string {
  if (ms < 0) return "0:00";
  const s = Math.floor(ms / 1000);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

export default function ImpersonationBanner({ impersonationId, targetEmail, expiresAt }: Props) {
  const [now, setNow] = useState(Date.now());
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = new Date(expiresAt).getTime() - now;

  async function end() {
    setEnding(true);
    await fetch("/api/platform/impersonation/stop", { method: "POST" }).catch(() => undefined);
    window.location.reload();
  }

  return (
    <div
      id="cw-impersonation-banner"
      role="alert"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2147483647,
        background: "#dc2626",
        color: "#fff",
        padding: "8px 16px",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        fontSize: 13,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
      }}
    >
      <span>
        IMPERSONATING <span style={{ fontFamily: "monospace" }}>{targetEmail}</span> · session #{impersonationId} ·{" "}
        {formatRemaining(remaining)} remaining
      </span>
      <button
        onClick={end}
        disabled={ending}
        style={{
          background: "#fff",
          color: "#dc2626",
          border: "none",
          padding: "4px 10px",
          borderRadius: 4,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {ending ? "Ending…" : "End impersonation"}
      </button>
    </div>
  );
}

export function ImpersonationBannerFallback({ reason }: { reason: string }) {
  // Server-rendered fallback when the client component fails to hydrate.
  // The tenant shell should hard-fail rather than render without the banner
  // (spec §12 decision #4). This is that fallback.
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", background: "#0A1628", color: "#fff", minHeight: "100vh" }}>
      <h1>Impersonation session active</h1>
      <p>Reason: {reason}. Reload to continue in the app.</p>
      <form action="/api/platform/impersonation/stop" method="post">
        <button type="submit" style={{ marginTop: 12, padding: "8px 12px" }}>End impersonation</button>
      </form>
    </div>
  );
}
