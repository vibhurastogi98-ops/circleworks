import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { companies } from "@/db/schema";
import { withPlatformAudit } from "@/lib/platform-audit";
import { invalidateCapabilitiesCache } from "@/lib/platform-capability-resolver";

export const dynamic = "force-dynamic";

async function extractTargetId(request: NextRequest) {
  const m = new URL(request.url).pathname.match(/\/tenants\/(\d+)\//);
  return m?.[1] ?? "0";
}

/**
 * Soft-delete a tenant. Row stays, all tenant traffic gated at middleware,
 * recoverable from the panel (undo lands as a follow-up route).
 */
export const POST = withPlatformAudit<Record<string, unknown>>(
  { action: "tenant.softDelete", targetType: "tenant", extractTargetId, mutating: true },
  async ({ tx, request }) => {
    const companyId = Number(await extractTargetId(request));
    if (!Number.isInteger(companyId) || companyId <= 0) throw new Error("invalid_company_id");
    const [before] = await tx.select().from(companies).where(eq(companies.id, companyId)).limit(1);
    if (!before) throw new Error("tenant_not_found");
    if (before.softDeletedAt) return { body: { ok: true, alreadyDeleted: true }, before: null, after: null };
    const now = new Date();
    await tx.update(companies).set({ softDeletedAt: now }).where(eq(companies.id, companyId));
    invalidateCapabilitiesCache(companyId);
    return {
      body: { ok: true, softDeletedAt: now.toISOString() },
      before: { softDeletedAt: before.softDeletedAt },
      after: { softDeletedAt: now.toISOString() },
    };
  },
);
