import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { users, employees } from "@/db/schema";
import { withPlatformAudit } from "@/lib/platform-audit";

export const dynamic = "force-dynamic";

async function extractTargetId(request: NextRequest) {
  const m = new URL(request.url).pathname.match(/\/users\/(\d+)\//);
  return m?.[1] ?? "0";
}

/**
 * Stub for MVP — records the request in the audit log so ops has evidence
 * of the action. Actual email dispatch is the existing invite-email
 * pipeline; wiring it here is a follow-up.
 */
export const POST = withPlatformAudit<Record<string, unknown>>(
  { action: "supportUser.resendInvite", targetType: "tenant_user", extractTargetId, mutating: true },
  async ({ tx, request }) => {
    const userId = Number(await extractTargetId(request));
    const [user] = await tx.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new Error("user_not_found");
    const memberships = await tx
      .select({ employeeId: employees.id, companyId: employees.companyId, status: employees.status })
      .from(employees)
      .where(eq(employees.userId, userId));
    return {
      body: { ok: true, memberships: memberships.length, note: "stub_pending_invite_email_wire" },
      before: null,
      after: { invitesQueued: memberships.length },
      metadata: { targetEmail: user.email, stub: true },
    };
  },
);
