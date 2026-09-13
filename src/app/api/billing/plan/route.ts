import { NextResponse, type NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { employees, plans, tenantPlans } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Tenant-facing view of what the platform admin has provisioned:
 *   - plan (from plans.id via tenant_plans.plan_id)
 *   - seat count (from tenant_plans.seat_count)
 *   - a live activeEmployees count for cross-check
 *   - the estimated next invoice = base + perSeat * seatCount
 * Read-only: tenants change plans by contacting sales, not from this page.
 */
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  const [row] = await db
    .select({
      planId: plans.id,
      planName: plans.name,
      basePriceCents: plans.basePriceCents,
      perSeatPriceCents: plans.perSeatPriceCents,
      seatCount: tenantPlans.seatCount,
      status: tenantPlans.status,
      trialEndsAt: tenantPlans.trialEndsAt,
      effectiveFrom: tenantPlans.effectiveFrom,
    })
    .from(tenantPlans)
    .innerJoin(plans, eq(tenantPlans.planId, plans.id))
    .where(eq(tenantPlans.companyId, ctx.companyId))
    .limit(1);

  const [countRow] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(employees)
    .where(and(eq(employees.companyId, ctx.companyId), eq(employees.employmentType, "full-time")));
  const activeEmployees = countRow?.n ?? 0;

  if (!row) {
    // Company has no tenant_plans row yet (fresh signup pre-provision).
    return NextResponse.json({
      hasPlan: false,
      activeEmployees,
      plan: null,
      estimatedNextInvoiceCents: 0,
    });
  }

  const estimatedNextInvoiceCents = row.basePriceCents + row.perSeatPriceCents * row.seatCount;

  return NextResponse.json({
    hasPlan: true,
    activeEmployees,
    plan: {
      id: row.planId,
      name: row.planName,
      basePriceCents: row.basePriceCents,
      perSeatPriceCents: row.perSeatPriceCents,
      seatCount: row.seatCount,
      status: row.status,
      trialEndsAt: row.trialEndsAt,
      effectiveFrom: row.effectiveFrom,
    },
    estimatedNextInvoiceCents,
  });
}
