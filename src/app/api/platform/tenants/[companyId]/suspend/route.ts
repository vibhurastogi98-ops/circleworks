import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { companies } from "@/db/schema";
import { withPlatformAudit } from "@/lib/platform-audit";

export const dynamic = "force-dynamic";

async function extractTargetId(request: NextRequest) {
  // Extract from /api/platform/tenants/:companyId/suspend
  const m = new URL(request.url).pathname.match(/\/tenants\/(\d+)\//);
  return m?.[1] ?? "0";
}

export const POST = withPlatformAudit<Record<string, unknown>>(
  {
    action: "tenant.suspend",
    targetType: "tenant",
    extractTargetId,
    mutating: true,
  },
  async ({ session, tx, request, reasonCode, reasonNotes }) => {
    const companyId = Number(await extractTargetId(request));
    if (!Number.isInteger(companyId) || companyId <= 0) {
      throw new Error("invalid_company_id");
    }
    const [before] = await tx.select().from(companies).where(eq(companies.id, companyId)).limit(1);
    if (!before) throw new Error("tenant_not_found");
    if (before.suspendedAt) {
      return { body: { ok: true, alreadySuspended: true }, before: null, after: null };
    }
    const now = new Date();
    const [after] = await tx
      .update(companies)
      .set({ suspendedAt: now, suspendedBy: session.adminId, suspendedReasonCode: reasonCode })
      .where(eq(companies.id, companyId))
      .returning();
    return {
      body: { ok: true, suspendedAt: now.toISOString() },
      before: { suspendedAt: before.suspendedAt, suspendedBy: before.suspendedBy },
      after: { suspendedAt: after?.suspendedAt ?? null, suspendedBy: after?.suspendedBy ?? null, reasonCode },
      metadata: { reasonNotesLength: reasonNotes?.length ?? 0 },
    };
  },
);
