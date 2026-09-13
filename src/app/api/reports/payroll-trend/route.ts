import { NextResponse, type NextRequest } from "next/server";
import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { payrolls } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

type TrendPoint = {
  month: string; // "Mmm" — kept for the dashboard chart which just labels the axis
  yearMonth: string; // "YYYY-MM" — unambiguous key for consumers that need it
  gross: number;
  taxes: number;
  net: number;
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  const requestedMonths = Number(request.nextUrl.searchParams.get("months") || 12);
  const months = Number.isFinite(requestedMonths)
    ? Math.min(Math.max(Math.trunc(requestedMonths), 1), 24)
    : 12;

  // Compute the earliest month to include (first-of-month, N-1 months back).
  const now = new Date();
  const startOfWindow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));
  const startIso = startOfWindow.toISOString().slice(0, 10);

  // Sum per month over paid payroll runs whose check_date falls in-window.
  // to_char groups by month bucket at the DB layer; grouping in JS would
  // require pulling every row.
  const rows = await db
    .select({
      yearMonth: sql<string>`to_char(${payrolls.checkDate}, 'YYYY-MM')`,
      gross: sql<number>`coalesce(sum(${payrolls.totalGross}),0)::int`,
      taxes: sql<number>`coalesce(sum(${payrolls.totalTaxes}),0)::int`,
      net: sql<number>`coalesce(sum(${payrolls.totalNet}),0)::int`,
    })
    .from(payrolls)
    .where(and(
      eq(payrolls.companyId, ctx.companyId),
      eq(payrolls.status, "paid"),
      gte(payrolls.checkDate, startIso),
    ))
    .groupBy(sql`to_char(${payrolls.checkDate}, 'YYYY-MM')`);

  // Fill in months with no runs as zero-buckets so the chart doesn't skip gaps.
  const byMonth = new Map<string, { gross: number; taxes: number; net: number }>();
  for (const r of rows) byMonth.set(r.yearMonth, { gross: r.gross, taxes: r.taxes, net: r.net });

  const data: TrendPoint[] = [];
  for (let i = 0; i < months; i += 1) {
    const d = new Date(Date.UTC(startOfWindow.getUTCFullYear(), startOfWindow.getUTCMonth() + i, 1));
    const yearMonth = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const hit = byMonth.get(yearMonth);
    data.push({
      month: MONTH_LABELS[d.getUTCMonth()],
      yearMonth,
      gross: hit?.gross ?? 0,
      taxes: hit?.taxes ?? 0,
      net: hit?.net ?? 0,
    });
  }

  return NextResponse.json({ months, data });
}
