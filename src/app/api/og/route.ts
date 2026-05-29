function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(title: string) {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > 30 && lines.length < 3) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 4);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "CircleWorks";
  const category = searchParams.get("category") || "HR & Payroll";
  const lines = wrapTitle(title);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A1628"/>
      <stop offset="60%" stop-color="#102A4A"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <radialGradient id="glow" cx="25%" cy="20%" r="70%">
      <stop offset="0%" stop-color="#60A5FA" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#60A5FA" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <circle cx="1010" cy="112" r="170" fill="#38BDF8" opacity="0.12"/>
  <circle cx="102" cy="544" r="150" fill="#2563EB" opacity="0.18"/>
  <circle cx="90" cy="80" r="24" fill="none" stroke="#FFFFFF" stroke-width="5"/>
  <path d="M90 65a15 15 0 0 0 0 30" fill="none" stroke="#60A5FA" stroke-width="6" stroke-linecap="round"/>
  <text x="132" y="93" font-family="Inter, Arial, sans-serif" font-size="36" font-weight="800" fill="#FFFFFF">Circle<tspan fill="#60A5FA">Works</tspan></text>
  <rect x="72" y="170" rx="24" ry="24" width="${Math.max(210, category.length * 18)}" height="48" fill="#2563EB"/>
  <text x="96" y="202" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800" letter-spacing="2" fill="#FFFFFF">${escapeXml(category.toUpperCase())}</text>
  ${lines
    .map(
      (line, index) =>
        `<text x="72" y="${300 + index * 68}" font-family="Inter, Arial, sans-serif" font-size="${lines.length > 3 ? 56 : 64}" font-weight="900" fill="#FFFFFF">${escapeXml(line)}</text>`,
    )
    .join("\\n  ")}
  <text x="72" y="568" font-family="Inter, Arial, sans-serif" font-size="27" font-weight="700" fill="#CBD5E1">HR &amp; Payroll Insights for US Companies</text>
  <text x="930" y="568" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#DBEAFE">circleworks.com</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
  });
}
