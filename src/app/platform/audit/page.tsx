import Link from "next/link";
import { and, desc, eq, ilike, sql } from "drizzle-orm";

import { requirePlatformSession } from "@/lib/platform-session-server";
import { hasPlatformPermission } from "@/lib/platform-rbac";
import { db } from "@/db";
import { platformAuditLogs, platformAdmins } from "@/db/schema";

export const dynamic = "force-dynamic";

type SearchParams = { actor?: string; action?: string; targetType?: string; targetId?: string; limit?: string };

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await requirePlatformSession();
  if (!hasPlatformPermission(session.role, "audit.read")) {
    return <div className="p-8 text-red-400">Forbidden.</div>;
  }
  const params = await searchParams;
  const limit = Math.min(500, Math.max(10, Number(params.limit) || 100));

  const filter = and(
    params.actor ? eq(platformAuditLogs.actorAdminId, Number(params.actor)) : sql`TRUE`,
    params.action ? ilike(platformAuditLogs.action, `%${params.action}%`) : sql`TRUE`,
    params.targetType ? eq(platformAuditLogs.targetType, params.targetType) : sql`TRUE`,
    params.targetId ? eq(platformAuditLogs.targetId, params.targetId) : sql`TRUE`,
  );

  const rows = await db
    .select({
      id: platformAuditLogs.id,
      createdAt: platformAuditLogs.createdAt,
      actorAdminId: platformAuditLogs.actorAdminId,
      actorEmail: platformAdmins.email,
      actorRole: platformAuditLogs.actorRole,
      action: platformAuditLogs.action,
      targetType: platformAuditLogs.targetType,
      targetId: platformAuditLogs.targetId,
      reasonCode: platformAuditLogs.reasonCode,
      reasonNotes: platformAuditLogs.reasonNotes,
      ipAddress: platformAuditLogs.ipAddress,
    })
    .from(platformAuditLogs)
    .leftJoin(platformAdmins, eq(platformAuditLogs.actorAdminId, platformAdmins.id))
    .where(filter)
    .orderBy(desc(platformAuditLogs.createdAt))
    .limit(limit);

  const canExport = hasPlatformPermission(session.role, "audit.export");
  const exportHref = `/api/platform/audit/export?${new URLSearchParams(params as Record<string, string>).toString()}`;

  return (
    <div className="p-8 text-slate-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Audit log</h1>
        {canExport && (
          <Link href={exportHref} className="rounded bg-orange-500 px-3 py-1.5 text-sm font-bold text-slate-950">
            Export CSV
          </Link>
        )}
      </div>

      <form className="mt-4 flex flex-wrap gap-2 text-sm">
        <input name="actor" defaultValue={params.actor ?? ""} placeholder="Actor admin id" className="rounded border border-slate-700 bg-slate-950/60 px-3 py-1.5 font-mono" />
        <input name="action" defaultValue={params.action ?? ""} placeholder="Action substring" className="rounded border border-slate-700 bg-slate-950/60 px-3 py-1.5" />
        <input name="targetType" defaultValue={params.targetType ?? ""} placeholder="Target type" className="rounded border border-slate-700 bg-slate-950/60 px-3 py-1.5" />
        <input name="targetId" defaultValue={params.targetId ?? ""} placeholder="Target id" className="rounded border border-slate-700 bg-slate-950/60 px-3 py-1.5" />
        <input name="limit" defaultValue={String(limit)} placeholder="Limit" className="w-20 rounded border border-slate-700 bg-slate-950/60 px-3 py-1.5" />
        <button type="submit" className="rounded bg-orange-500 px-3 py-1.5 font-bold text-slate-950">Filter</button>
      </form>

      <div className="mt-6 overflow-x-auto rounded border border-slate-800 bg-slate-950/60 text-xs">
        <table className="w-full">
          <thead className="bg-slate-900/70 text-slate-400">
            <tr>
              <th className="px-2 py-2 text-left">When (UTC)</th>
              <th className="px-2 py-2 text-left">Actor</th>
              <th className="px-2 py-2 text-left">Role</th>
              <th className="px-2 py-2 text-left">Action</th>
              <th className="px-2 py-2 text-left">Target</th>
              <th className="px-2 py-2 text-left">Reason</th>
              <th className="px-2 py-2 text-left">IP</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7} className="px-2 py-6 text-center text-slate-500">No matching rows.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-800">
                <td className="px-2 py-1 font-mono">{r.createdAt?.toISOString()}</td>
                <td className="px-2 py-1">{r.actorEmail ?? (r.actorAdminId ? `#${r.actorAdminId}` : "system")}</td>
                <td className="px-2 py-1">{r.actorRole ?? "—"}</td>
                <td className="px-2 py-1 font-mono">{r.action}</td>
                <td className="px-2 py-1">{r.targetType}:{r.targetId}</td>
                <td className="px-2 py-1">
                  {r.reasonCode ?? "—"}{r.reasonNotes ? ` · ${r.reasonNotes.slice(0, 60)}` : ""}
                </td>
                <td className="px-2 py-1 font-mono">{r.ipAddress ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
