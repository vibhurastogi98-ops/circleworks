import Link from "next/link";
import { desc } from "drizzle-orm";

import { requirePlatformSession } from "@/lib/platform-session-server";
import { hasPlatformPermission, PLATFORM_ADMIN_ROLES } from "@/lib/platform-rbac";
import { db } from "@/db";
import { platformAdmins } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminsListPage() {
  const session = await requirePlatformSession();
  if (!hasPlatformPermission(session.role, "admin.read")) {
    return <div className="p-8 text-red-400">Forbidden.</div>;
  }
  const rows = await db
    .select({
      id: platformAdmins.id,
      email: platformAdmins.email,
      role: platformAdmins.role,
      status: platformAdmins.status,
      failedAttempts: platformAdmins.failedAttempts,
      lockedUntil: platformAdmins.lockedUntil,
      lastLoginAt: platformAdmins.lastLoginAt,
      createdAt: platformAdmins.createdAt,
    })
    .from(platformAdmins)
    .orderBy(desc(platformAdmins.createdAt))
    .limit(200);

  const canInvite = hasPlatformPermission(session.role, "admin.invite");

  return (
    <div className="p-8 text-slate-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Platform admins</h1>
        {canInvite && (
          <Link href="/platform/admins/invite" className="rounded bg-orange-500 px-3 py-1.5 text-sm font-bold text-slate-950">
            Invite admin
          </Link>
        )}
      </div>
      <p className="mt-1 text-sm text-slate-400">
        Roles: {PLATFORM_ADMIN_ROLES.join(", ")}. See docs/platform-admin-spec.md §6.2.
      </p>

      <div className="mt-6 overflow-hidden rounded border border-slate-800 bg-slate-950/60 text-sm">
        <table className="w-full">
          <thead className="bg-slate-900/70 text-xs text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Last login</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t border-slate-800">
                <td className="px-3 py-2 font-mono text-slate-400">{a.id}</td>
                <td className="px-3 py-2">{a.email}</td>
                <td className="px-3 py-2">{a.role}</td>
                <td className="px-3 py-2">
                  {a.status}{a.lockedUntil && a.lockedUntil.getTime() > Date.now() && " (locked)"}
                </td>
                <td className="px-3 py-2 text-slate-400">{a.lastLoginAt?.toISOString() ?? "—"}</td>
                <td className="px-3 py-2 text-slate-400">{a.createdAt?.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
