import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { plans, tenantPlans } from "@/db/schema";
import { withPlatformAudit } from "@/lib/platform-audit";
import { invalidateCapabilitiesCache } from "@/lib/platform-capability-resolver";

export const dynamic = "force-dynamic";

async function extractTargetId(request: NextRequest) {
  const m = new URL(request.url).pathname.match(/\/tenants\/(\d+)\//);
  return m?.[1] ?? "0";
}

export const PUT = withPlatformAudit<Record<string, unknown>>(
  { action: "billing.changePlan", targetType: "tenant", extractTargetId, mutating: true },
  async ({ tx, request, session }) => {
    const companyId = Number(await extractTargetId(request));
    if (!Number.isInteger(companyId) || companyId <= 0) throw new Error("invalid_company_id");
    const body = (await request.clone().json().catch(() => ({}))) as Record<string, unknown>;
    const planId = typeof body.planId === "string" ? body.planId.trim() : "";
    const seatCount = Number(body.seatCount ?? 0);
    if (!planId || !Number.isInteger(seatCount) || seatCount < 0) throw new Error("invalid_plan_or_seats");

    const [planRow] = await tx.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!planRow) throw new Error("plan_not_found");
    if (!planRow.isActive) throw new Error("plan_inactive");

    const [before] = await tx.select().from(tenantPlans).where(eq(tenantPlans.companyId, companyId)).limit(1);

    const now = new Date();
    if (before) {
      await tx
        .update(tenantPlans)
        .set({ planId, seatCount, updatedAt: now, updatedBy: session.adminId, status: "active" })
        .where(eq(tenantPlans.companyId, companyId));
    } else {
      await tx
        .insert(tenantPlans)
        .values({ companyId, planId, seatCount, updatedBy: session.adminId, status: "active" });
    }

    invalidateCapabilitiesCache(companyId);
    return {
      body: { ok: true },
      before: before ? { planId: before.planId, seatCount: before.seatCount, status: before.status } : null,
      after: { planId, seatCount, status: "active" },
    };
  },
);
