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
 * Clears the user's password hash so their next login forces a reset via
 * /forgot-password. The actual email delivery is handled by the existing
 * password-reset flow — we just gate access here.
 */
export const POST = withPlatformAudit<Record<string, unknown>>(
  { action: "supportUser.forcePasswordReset", targetType: "tenant_user", extractTargetId, mutating: true },
  async ({ tx, request }) => {
    const userId = Number(await extractTargetId(request));
    const [before] = await tx.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    if (!before) throw new Error("user_not_found");
    await tx.update(users).set({ passwordHash: null }).where(eq(users.id, userId));
    return {
      body: { ok: true, next: "user_must_reset_on_next_login" },
      before: { hadPassword: true },
      after: { hadPassword: false },
      metadata: { targetEmail: before.email },
    };
  },
);
