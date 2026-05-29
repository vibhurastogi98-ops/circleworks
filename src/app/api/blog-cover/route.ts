const categoryColors: Record<string, { accent: string; glow: string }> = {
  Payroll: { accent: "#2563EB", glow: "#60A5FA" },
  Compliance: { accent: "#0F766E", glow: "#2DD4BF" },
  "HR Tips": { accent: "#4F46E5", glow: "#818CF8" },
  Benefits: { accent: "#DB2777", glow: "#F472B6" },
  Templates: { accent: "#7C3AED", glow: "#A78BFA" },
  "State Guides": { accent: "#0284C7", glow: "#38BDF8" },
  "Case Studies": { accent: "#059669", glow: "#34D399" },
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(title: string, maxLineLength: number, maxLines: number) {
  const words = title.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (current && candidate.length > maxLineLength && lines.length < maxLines) {
      lines.push(current);
      current = word;
      continue;
    }

    current = candidate;
  }

  if (current) {
    lines.push(current);
  }

  const visibleLines = lines.slice(0, maxLines);
  const lastIndex = visibleLines.length - 1;

  if (lines.length > maxLines && lastIndex >= 0) {
    visibleLines[lastIndex] = `${visibleLines[lastIndex].replace(/[.,:;!?-]+$/, "")}...`;
  }

  return visibleLines;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "CircleWorks Blog";
  const category = searchParams.get("category") || "HR & Payroll";
  const variant = searchParams.get("variant") === "wide" ? "wide" : "card";
  const width = variant === "wide" ? 1200 : 900;
  const height = variant === "wide" ? 675 : 600;
  const safeX = variant === "wide" ? 88 : 64;
  const titleSize = variant === "wide" ? 64 : 48;
  const lineHeight = variant === "wide" ? 76 : 60;
  const titleY = variant === "wide" ? 250 : 250;
  const maxLineLength = variant === "wide" ? 33 : 25;
  const maxLines = variant === "wide" ? 3 : 4;
  const colors = categoryColors[category] ?? {
    accent: "#2563EB",
    glow: "#60A5FA",
  };
  const lines = wrapTitle(title, maxLineLength, maxLines);
  const chipWidth = Math.min(
    width - safeX * 2,
    Math.max(150, category.length * 14 + 56),
  );

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A1628"/>
      <stop offset="58%" stop-color="#12345A"/>
      <stop offset="100%" stop-color="${colors.accent}"/>
    </linearGradient>
    <radialGradient id="glow" cx="34%" cy="18%" r="72%">
      <stop offset="0%" stop-color="${colors.glow}" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="${colors.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="${variant === "wide" ? 0 : 28}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" rx="${variant === "wide" ? 0 : 28}" fill="url(#glow)"/>
  <circle cx="${width - 95}" cy="98" r="${variant === "wide" ? 168 : 132}" fill="${colors.glow}" opacity="0.13"/>
  <circle cx="52" cy="${height - 58}" r="${variant === "wide" ? 170 : 130}" fill="#2563EB" opacity="0.18"/>
  <rect x="${safeX}" y="54" width="300" height="48" rx="24" fill="#FFFFFF" opacity="0.08"/>
  <circle cx="${safeX + 30}" cy="78" r="18" fill="none" stroke="#FFFFFF" stroke-width="4"/>
  <path d="M${safeX + 30} 67a11 11 0 0 0 0 22" fill="none" stroke="${colors.glow}" stroke-width="5" stroke-linecap="round"/>
  <text x="${safeX + 64}" y="88" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="850" fill="#FFFFFF">Circle<tspan fill="${colors.glow}">Works</tspan></text>
  <rect x="${safeX}" y="152" rx="22" ry="22" width="${chipWidth}" height="44" fill="${colors.accent}"/>
  <text x="${safeX + 24}" y="181" font-family="Inter, Arial, sans-serif" font-size="17" font-weight="850" letter-spacing="2" fill="#FFFFFF">${escapeXml(category.toUpperCase())}</text>
  ${lines
    .map(
      (line, index) =>
        `<text x="${safeX}" y="${titleY + index * lineHeight}" font-family="Inter, Arial, sans-serif" font-size="${titleSize}" font-weight="900" fill="#FFFFFF">${escapeXml(line)}</text>`,
    )
    .join("\\n  ")}
  <g transform="translate(${safeX}, ${height - 112})">
    <rect width="${variant === "wide" ? 560 : 420}" height="12" rx="6" fill="#FFFFFF" opacity="0.18"/>
    <rect y="28" width="${variant === "wide" ? 420 : 300}" height="12" rx="6" fill="#FFFFFF" opacity="0.14"/>
    <text y="72" font-family="Inter, Arial, sans-serif" font-size="${variant === "wide" ? 24 : 20}" font-weight="750" fill="#DBEAFE">Practical HR &amp; payroll guidance for US teams</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
  });
}
