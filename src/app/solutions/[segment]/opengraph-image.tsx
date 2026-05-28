import { ImageResponse } from "next/og";

import { segments } from "./segmentData";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const themes: Record<
  string,
  { background: string; accent: string; panel: string }
> = {
  agencies: {
    background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 52%, #7c3aed 100%)",
    accent: "#bfdbfe",
    panel: "rgba(30, 64, 175, 0.42)",
  },
  creators: {
    background: "linear-gradient(135deg, #ec4899 0%, #f43f5e 48%, #f97316 100%)",
    accent: "#ffe4e6",
    panel: "rgba(159, 18, 57, 0.36)",
  },
  startups: {
    background: "linear-gradient(135deg, #38bdf8 0%, #06b6d4 48%, #10b981 100%)",
    accent: "#ecfeff",
    panel: "rgba(8, 145, 178, 0.35)",
  },
  healthcare: {
    background: "linear-gradient(135deg, #10b981 0%, #14b8a6 48%, #2563eb 100%)",
    accent: "#ccfbf1",
    panel: "rgba(6, 95, 70, 0.36)",
  },
  tech: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 58%, #312e81 100%)",
    accent: "#dbeafe",
    panel: "rgba(15, 23, 42, 0.55)",
  },
  restaurants: {
    background: "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #e11d48 100%)",
    accent: "#ffedd5",
    panel: "rgba(154, 52, 18, 0.35)",
  },
};

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ segment: string }>;
}) {
  const { segment } = await params;
  const data = segments[segment] ?? segments.agencies;
  const theme = themes[segment] ?? themes.agencies;
  const sub = Array.isArray(data.sub) ? data.sub.join(" ") : data.sub;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: theme.background,
          color: "white",
          fontFamily: "Arial, Helvetica, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 520,
            background: "rgba(255, 255, 255, 0.16)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 0,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              border: "6px solid rgba(255,255,255,0.9)",
              boxSizing: "border-box",
            }}
          />
          <span>
            Circle<span style={{ color: theme.accent }}>Works</span>
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "10px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.24)",
              fontSize: 20,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 2.4,
            }}
          >
            Solutions / {segment.replaceAll("-", " ")}
          </div>
          <div
            style={{
              maxWidth: 890,
              fontSize: 74,
              lineHeight: 0.98,
              fontWeight: 900,
              letterSpacing: 0,
            }}
          >
            {data.title}
          </div>
          <div
            style={{
              maxWidth: 850,
              fontSize: 28,
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            {sub}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 28px",
            borderRadius: 28,
            background: theme.panel,
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 900 }}>
            Starting at $8/employee/month
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: theme.accent }}>
            Start Free Trial
          </div>
        </div>
      </div>
    ),
    size
  );
}
