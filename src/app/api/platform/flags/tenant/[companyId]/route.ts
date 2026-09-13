import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { tenantCapabilityOverrides } from "@/db/schema";
import { withPlatformAudit } from "@/lib/platform-audit";
import { invalidateCapabilitiesCache } from "@/lib/platform-capability-resolver";

export const dynamic = "force-dynamic";

async function extractTargetId(request: NextRequest) {
  const m = new URL(request.url).pathname.match(/\/tenant\/(\d+)/);
  return m?.[1] ?? "0";
}

/**
 * Body: { overrides: Partial<Record<CapabilityKey, boolean>>, reasonCode, reasonNotes }
 * Overrides passed here REPLACE the tenant's override map wholesale.
 */
export const PUT = withPlatformAudit<Record<string, unknown>>(
  { action: "flag.setTenantOverride", targetType: "tenant", extractTargetId, mutating: true },
  async ({ tx, request, session }) => {
    const companyId = Number(await extractTargetId(request));
    if (!Number.isInteger(companyId) || companyId <= 0) throw new Error("invalid_company_id");

    const body = (await request.clone().json().catch(() => ({}))) as Record<string, unknown>;
    const raw = body.overrides;
    if (!raw || typeof raw !== "object") throw new Error("invalid_overrides");

    // Sanitize — only string keys with boolean values.
    const overrides: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v === "boolean") overrides[k] = v;
    }

    const [before] = await tx
      .select()
      .from(tenantCapabilityOverrides)
      .where(eq(tenantCapabilityOverrides.companyId, companyId))
      .limit(1);

    if (before) {
      await tx
        .update(tenantCapabilityOverrides)
        .set({ overrides, updatedAt: new Date(), updatedBy: session.adminId })
        .where(eq(tenantCapabilityOverrides.companyId, companyId));
    } else {
      await tx.insert(tenantCapabilityOverrides).values({ companyId, overrides, updatedBy: session.adminId });
    }

    invalidateCapabilitiesCache(companyId);
    return {
      body: { ok: true, overrides },
      before: before ? { overrides: before.overrides } : null,
      after: { overrides },
    };
  },
);
