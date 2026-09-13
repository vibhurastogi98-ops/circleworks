import { NextResponse, type NextRequest } from "next/server";
import { and, count, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { employees } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

type Point = { name: string; value: number };

function mapEmploymentType(v: string | null): string {
  const s = (v ?? "").toLowerCase();
  if (s === "part-time") return "Part-time";
  if (s === "contractor") return "Contractor";
  return "Full-time";
}

function mapStatus(v: string | null): string {
  const s = (v ?? "").toLowerCase();
  if (s === "onboarding" || s === "pre_boarding") return "Onboarding";
  if (s === "terminated") return "Terminated";
  if (s === "on_leave" || s === "on leave") return "On Leave";
  if (s === "inactive") return "Inactive";
  return "Active";
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });
  const companyId = ctx.companyId;

  // Grand total (excluding soft-terminated).
  const [totalRow] = await db
    .select({ n: count() })
    .from(employees)
    .where(and(eq(employees.companyId, companyId), ne(employees.status, "terminated")));

  // Employment-type breakdown — kept in the `data` field so the dashboard
  // consumer (which expects HeadcountBreakdownPoint[] with a strict name enum)
  // keeps working unchanged.
  const empTypeRows = await db
    .select({ label: employees.employmentType, n: count() })
    .from(employees)
    .where(eq(employees.companyId, companyId))
    .groupBy(employees.employmentType);
  const byEmploymentType: Point[] = ["Full-time", "Part-time", "Contractor"].map((bucket) => ({
    name: bucket,
    value: empTypeRows
      .filter((r) => mapEmploymentType(r.label) === bucket)
      .reduce((sum, r) => sum + r.n, 0),
  }));

  // Department, location, status breakdowns — the richer view a reports page
  // will eventually render.
  const deptRows = await db
    .select({ label: employees.department, n: count() })
    .from(employees)
    .where(eq(employees.companyId, companyId))
    .groupBy(employees.department);
  const byDepartment: Point[] = deptRows
    .filter((r) => r.label && r.label.trim().length > 0)
    .map((r) => ({ name: r.label!, value: r.n }));

  const locRows = await db
    .select({ label: employees.location, n: count() })
    .from(employees)
    .where(eq(employees.companyId, companyId))
    .groupBy(employees.location);
  const byLocation: Point[] = locRows
    .filter((r) => r.label && r.label.trim().length > 0)
    .map((r) => ({ name: r.label!, value: r.n }));

  const statusRows = await db
    .select({ label: employees.status, n: count() })
    .from(employees)
    .where(eq(employees.companyId, companyId))
    .groupBy(employees.status);
  const byStatusMap = new Map<string, number>();
  for (const r of statusRows) {
    const bucket = mapStatus(r.label);
    byStatusMap.set(bucket, (byStatusMap.get(bucket) ?? 0) + r.n);
  }
  const byStatus: Point[] = [...byStatusMap.entries()].map(([name, value]) => ({ name, value }));

  return NextResponse.json({
    data: byEmploymentType,
    byEmploymentType,
    byDepartment,
    byLocation,
    byStatus,
    total: totalRow?.n ?? 0,
  });
}
