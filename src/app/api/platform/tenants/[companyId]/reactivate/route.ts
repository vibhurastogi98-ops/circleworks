import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { companies } from "@/db/schema";
import { withPlatformAudit } from "@/lib/platform-audit";

export const dynamic = "force-dynamic";

async function extractTargetId(request: NextRequest) {
  const m = new URL(request.url).pathname.match(/\/tenants\/(\d+)\//);
  return m?.[1] ?? "0";
}

export const POST = withPlatformAudit<Record<string, unknown>>(
  { action: "tenant.reactivate", targetType: "tenant", extractTargetId, mutating: true },
  async ({ tx, request }) => {
    const companyId = Number(await extractTargetId(request));
    const [before] = await tx.select().from(companies).where(eq(companies.id, companyId)).limit(1);
    if (!before) throw new Error("tenant_not_found");
    if (!before.suspendedAt) return { body: { ok: true, wasActive: true }, before: null, after: null };
    const [after] = await tx
      .update(companies)
      .set({ suspendedAt: null, suspendedBy: null, suspendedReasonCode: null })
      .where(eq(companies.id, companyId))
      .returning();
    return {
      body: { ok: true },
      before: { suspendedAt: before.suspendedAt, suspendedBy: before.suspendedBy, reason: before.suspendedReasonCode },
      after: { suspendedAt: after?.suspendedAt ?? null },
    };
  },
);
