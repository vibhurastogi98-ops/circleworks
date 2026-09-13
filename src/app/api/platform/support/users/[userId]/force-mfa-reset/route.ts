import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { users } from "@/db/schema";
import { withPlatformAudit } from "@/lib/platform-audit";

export const dynamic = "force-dynamic";

async function extractTargetId(request: NextRequest) {
  const m = new URL(request.url).pathname.match(/\/users\/(\d+)\//);
  return m?.[1] ?? "0";
}

/**
 * MFA on tenant users is currently supplied by Supabase (not by our own
 * tables). We audit the request; the real reset happens in Supabase Admin
 * via a follow-up integration. This is deliberately a stub so we don't
 * silently pretend to have done a security action we haven't.
 *
 * TODO: wire supabaseAdmin.auth.admin.updateUserById(clerkUserId, { user_metadata: { mfa_reset_at: now } })
 * plus a call to the appropriate factor-unenroll endpoint.
 */
export const POST = withPlatformAudit<Record<string, unknown>>(
  { action: "supportUser.forceMfaReset", targetType: "tenant_user", extractTargetId, mutating: true },
  async ({ tx, request }) => {
    const userId = Number(await extractTargetId(request));
    const [row] = await tx.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    if (!row) throw new Error("user_not_found");
    return {
      body: { ok: true, note: "stub_pending_supabase_admin_wire" },
      before: null,
      after: { mfaResetRequestedAt: new Date().toISOString() },
      metadata: { targetEmail: row.email, stub: true },
    };
  },
);
