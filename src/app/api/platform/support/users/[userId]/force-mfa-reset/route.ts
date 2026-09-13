import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { users } from "@/db/schema";
import { withPlatformAudit } from "@/lib/platform-audit";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import { invalidateUserSessions } from "@/lib/session";

export const dynamic = "force-dynamic";

async function extractTargetId(request: NextRequest) {
  const m = new URL(request.url).pathname.match(/\/users\/(\d+)\//);
  return m?.[1] ?? "0";
}

type FactorSummary = { id: string; type: string; status?: string };

/**
 * Deletes every enrolled MFA factor for the target user's Supabase auth
 * account, then invalidates any active Supabase refresh tokens so the user is
 * forced to re-authenticate from scratch (and re-enroll MFA if their tenant
 * requires it). Also signals the app's own session store to invalidate.
 */
export const POST = withPlatformAudit<Record<string, unknown>>(
  {
    action: "supportUser.forceMfaReset",
    targetType: "tenant_user",
    extractTargetId,
    mutating: true,
  },
  async ({ tx, request }) => {
    const userId = Number(await extractTargetId(request));
    const [row] = await tx
      .select({ id: users.id, email: users.email, clerkUserId: users.clerkUserId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!row) throw new Error("user_not_found");
    if (!row.clerkUserId) {
      throw new Error("user_has_no_supabase_identity");
    }

    const admin = requireSupabaseAdmin();

    // 1. Load the user + their currently-enrolled factors.
    const { data: fetched, error: fetchErr } = await admin.auth.admin.getUserById(row.clerkUserId);
    if (fetchErr) {
      throw new Error(`supabase_get_user_failed: ${fetchErr.message}`);
    }
    const factors: FactorSummary[] =
      (fetched.user?.factors ?? []).map((f) => ({
        id: f.id,
        type: (f as { factor_type?: string }).factor_type ?? "unknown",
        status: (f as { status?: string }).status,
      }));

    // 2. Delete every factor. If any single deletion fails we surface the
    //    error rather than pretending a partial reset succeeded.
    const deleted: FactorSummary[] = [];
    const failed: Array<FactorSummary & { error: string }> = [];
    for (const factor of factors) {
      const { error } = await admin.auth.admin.mfa.deleteFactor({
        userId: row.clerkUserId,
        id: factor.id,
      });
      if (error) failed.push({ ...factor, error: error.message });
      else deleted.push(factor);
    }

    if (failed.length > 0) {
      throw new Error(`mfa_factor_delete_failed: ${failed.map((f) => `${f.id}:${f.error}`).join(", ")}`);
    }

    // 3. Kill every active app session for this user (our JWT-based session
    //    store, not the Supabase refresh token). This is what actually gates
    //    access to protected tenant routes; the Supabase refresh token alone
    //    can't reach protected app data without a valid app session.
    invalidateUserSessions(userId);

    return {
      body: { ok: true, factorsDeleted: deleted.length, sessionsInvalidated: true },
      before: { factors },
      after: { factors: [] },
      metadata: { targetEmail: row.email, clerkUserId: row.clerkUserId },
    };
  },
);
