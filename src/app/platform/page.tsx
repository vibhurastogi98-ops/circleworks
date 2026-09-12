import { requirePlatformSession } from "@/lib/platform-session-server";
import { db } from "@/db";
import { companies, platformAdmins, platformAuditLogs, impersonationSessions } from "@/db/schema";
import { count, desc, eq, isNull, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function PlatformDashboardPage() {
  const session = await requirePlatformSession();

  const [tenantCounts] = await db
    .select({
      total: count(),
      suspended: sql<number>`SUM(CASE WHEN ${companies.suspendedAt} IS NOT NULL THEN 1 ELSE 0 END)`.as("suspended"),
      softDeleted: sql<number>`SUM(CASE WHEN ${companies.softDeletedAt} IS NOT NULL THEN 1 ELSE 0 END)`.as("soft_deleted"),
    })
    .from(companies);

  const [adminCount] = await db
    .select({ total: count() })
    .from(platformAdmins)
    .where(eq(platformAdmins.status, "active"));

  const [openImpersonations] = await db
    .select({ total: count() })
    .from(impersonationSessions)
    .where(isNull(impersonationSessions.endedAt));

  const recentActions = await db
    .select({
      id: platformAuditLogs.id,
      action: platformAuditLogs.action,
      targetType: platformAuditLogs.targetType,
      targetId: platformAuditLogs.targetId,
      actorAdminId: platformAuditLogs.actorAdminId,
      createdAt: platformAuditLogs.createdAt,
    })
    .from(platformAuditLogs)
    .orderBy(desc(platformAuditLogs.createdAt))
    .limit(10);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black">Platform overview</h1>
      <p className="mt-1 text-sm text-slate-400">Signed in as {session.role}. Session expires {session.expiresAt.toISOString()}.</p>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Tenants" value={tenantCounts?.total ?? 0} />
        <StatCard label="Suspended tenants" value={Number(tenantCounts?.suspended ?? 0)} />
        <StatCard label="Active admins" value={adminCount?.total ?? 0} />
        <StatCard label="Open impersonations" value={openImpersonations?.total ?? 0} tone={Number(openImpersonations?.total ?? 0) > 0 ? "warn" : "ok"} />
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-bold">Recent platform actions</h2>
        <div className="overflow-hidden rounded border border-slate-800 bg-slate-950/60 text-sm">
          <table className="w-full">
            <thead className="bg-slate-900/70 text-xs text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">When</th>
                <th className="px-3 py-2 text-left">Action</th>
                <th className="px-3 py-2 text-left">Target</th>
                <th className="px-3 py-2 text-left">Actor</th>
              </tr>
            </thead>
            <tbody>
              {recentActions.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-500">No actions yet.</td></tr>
              )}
              {recentActions.map((a) => (
                <tr key={a.id} className="border-t border-slate-800">
                  <td className="px-3 py-2 text-slate-400">{a.createdAt?.toISOString()}</td>
                  <td className="px-3 py-2 font-mono">{a.action}</td>
                  <td className="px-3 py-2">{a.targetType}:{a.targetId}</td>
                  <td className="px-3 py-2">{a.actorAdminId ?? "system"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "ok" | "warn" }) {
  return (
    <div className={`rounded border p-4 ${tone === "warn" ? "border-orange-500/60 bg-orange-500/10" : "border-slate-800 bg-slate-950/60"}`}>
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-black">{value}</div>
    </div>
  );
}
