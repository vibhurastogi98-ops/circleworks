import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { platformKillSwitches } from "@/db/schema";
import { withPlatformAudit } from "@/lib/platform-audit";
import { invalidateCapabilitiesCache } from "@/lib/platform-capability-resolver";

export const dynamic = "force-dynamic";

async function extractTargetId(request: NextRequest) {
  const m = new URL(request.url).pathname.match(/\/kill\/([^/]+)/);
  return decodeURIComponent(m?.[1] ?? "unknown");
}

export const PUT = withPlatformAudit<Record<string, unknown>>(
  { action: "flag.setKillSwitch", targetType: "capability", extractTargetId, mutating: true },
  async ({ tx, request, session, reasonCode }) => {
    const capability = await extractTargetId(request);
    const body = (await request.clone().json().catch(() => ({}))) as Record<string, unknown>;
    const enabled = Boolean(body.enabled);

    const [before] = await tx
      .select()
      .from(platformKillSwitches)
      .where(eq(platformKillSwitches.capability, capability))
      .limit(1);

    if (before) {
      await tx
        .update(platformKillSwitches)
        .set({ enabled, updatedAt: new Date(), updatedBy: session.adminId, reasonCode })
        .where(eq(platformKillSwitches.capability, capability));
    } else {
      await tx
        .insert(platformKillSwitches)
        .values({ capability, enabled, updatedBy: session.adminId, reasonCode });
    }

    invalidateCapabilitiesCache();
    return {
      body: { ok: true, capability, enabled },
      before: before ? { enabled: before.enabled, reasonCode: before.reasonCode } : null,
      after: { enabled, reasonCode },
    };
  },
);
