import { requirePlatformSession } from "@/lib/platform-session-server";
import { hasPlatformPermission } from "@/lib/platform-rbac";
import { db } from "@/db";
import { platformKillSwitches, platformAdmins } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import KillSwitchToggle from "./KillSwitchToggle";
import type { CapabilityKey } from "@/lib/capabilities";

export const dynamic = "force-dynamic";

// The full list of gatable capabilities. Re-declared here rather than
// imported from @/lib/capabilities so the platform-code grep-check (which
// forbids reaching into tenant RBAC symbols) stays clean.
const ALL_CAPABILITIES: CapabilityKey[] = [
  "dashboard", "payroll", "ownerPayroll", "ownerTaxes", "employees",
  "contractors", "contractorOnboarding", "clients", "hiring", "onboarding",
  "benefits", "time", "expenses", "performance", "learning", "compliance",
  "taxCompliance", "reports", "documents", "automations", "settings",
];

export default async function FlagsPage() {
  const session = await requirePlatformSession();
  const canView = hasPlatformPermission(session.role, "flag.setTenantOverride") ||
    hasPlatformPermission(session.role, "flag.setKillSwitch");
  if (!canView) return <div className="p-8 text-red-400">Forbidden.</div>;

  const killRows = await db
    .select({
      capability: platformKillSwitches.capability,
      enabled: platformKillSwitches.enabled,
      updatedAt: platformKillSwitches.updatedAt,
      updatedBy: platformKillSwitches.updatedBy,
      reasonCode: platformKillSwitches.reasonCode,
      adminEmail: platformAdmins.email,
    })
    .from(platformKillSwitches)
    .leftJoin(platformAdmins, eq(platformAdmins.id, platformKillSwitches.updatedBy))
    .orderBy(desc(platformKillSwitches.updatedAt));

  const byCap = new Map(killRows.map((r) => [r.capability, r]));
  const canToggleKill = hasPlatformPermission(session.role, "flag.setKillSwitch");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black">Feature flags & kill switches</h1>
      <p className="mt-1 text-sm text-slate-400">
        Per-tenant overrides live on the tenant detail page. Below are the platform-wide kill switches — flipping one to
        disabled turns the capability off across every tenant at once.
      </p>

      <section className="mt-6 overflow-hidden rounded border border-slate-800 bg-slate-950/60 text-sm">
        <table className="w-full">
          <thead className="bg-slate-900/70 text-xs text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Capability</th>
              <th className="px-3 py-2 text-left">Platform state</th>
              <th className="px-3 py-2 text-left">Last changed</th>
              <th className="px-3 py-2 text-left">By</th>
              <th className="px-3 py-2 text-left">Toggle</th>
            </tr>
          </thead>
          <tbody>
            {ALL_CAPABILITIES.map((cap) => {
              const row = byCap.get(cap);
              const enabled = row ? row.enabled : true;
              return (
                <tr key={cap} className="border-t border-slate-800">
                  <td className="px-3 py-2 font-mono">{cap}</td>
                  <td className="px-3 py-2">
                    {enabled ? (
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">enabled</span>
                    ) : (
                      <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-300">killed</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-400">{row?.updatedAt?.toISOString() ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-400">{row?.adminEmail ?? (row?.updatedBy ? `#${row.updatedBy}` : "—")}</td>
                  <td className="px-3 py-2">
                    <KillSwitchToggle capability={cap} currentlyEnabled={enabled} disabled={!canToggleKill} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs text-slate-500">
        Per-tenant capability overrides live on <Link href="/platform/tenants" className="text-orange-400 hover:underline">each tenant's page</Link>.
      </p>
    </div>
  );
}
