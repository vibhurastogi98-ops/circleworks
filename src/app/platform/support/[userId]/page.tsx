import Link from "next/link";
import { eq } from "drizzle-orm";

import { requirePlatformSession } from "@/lib/platform-session-server";
import { hasPlatformPermission } from "@/lib/platform-rbac";
import { db } from "@/db";
import { users, employees, companies } from "@/db/schema";
import SupportActions from "./SupportActions";

export const dynamic = "force-dynamic";

export default async function SupportUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const session = await requirePlatformSession();
  if (!hasPlatformPermission(session.role, "supportUser.read")) {
    return <div className="p-8 text-red-400">Forbidden.</div>;
  }
  const { userId } = await params;
  const uid = Number(userId);
  if (!Number.isInteger(uid)) return <div className="p-8">Bad user id.</div>;

  const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (!user) return <div className="p-8 text-slate-400">User not found.</div>;

  const memberships = await db
    .select({
      employeeId: employees.id,
      companyId: employees.companyId,
      companyName: companies.name,
      accountType: companies.accountType,
      status: employees.status,
      firstName: employees.firstName,
      lastName: employees.lastName,
    })
    .from(employees)
    .leftJoin(companies, eq(companies.id, employees.companyId))
    .where(eq(employees.userId, uid));

  const canReset = hasPlatformPermission(session.role, "supportUser.forcePasswordReset");
  const canMfa = hasPlatformPermission(session.role, "supportUser.forceMfaReset");
  const canInvite = hasPlatformPermission(session.role, "supportUser.resendInvite");

  return (
    <div className="p-8">
      <Link href="/platform/support" className="text-xs text-slate-400 hover:underline">← Back to search</Link>
      <h1 className="mt-2 text-2xl font-black">{user.email}</h1>
      <div className="mt-1 text-sm text-slate-400">
        user #{user.id} · role {user.role} · created {user.createdAt?.toISOString().slice(0, 10)}
      </div>
      {user.softDeletedAt && (
        <div className="mt-3 rounded border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-300">
          Soft-deleted {user.softDeletedAt.toISOString()}
        </div>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Tenant memberships</h2>
        <div className="overflow-hidden rounded border border-slate-800 bg-slate-950/60 text-sm">
          <table className="w-full">
            <thead className="bg-slate-900/70 text-xs text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Tenant</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Employee ID</th>
                <th className="px-3 py-2 text-left">Name at tenant</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {memberships.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">User has no tenant memberships.</td></tr>
              )}
              {memberships.map((m) => (
                <tr key={m.employeeId} className="border-t border-slate-800">
                  <td className="px-3 py-2">
                    {m.companyId ? <Link href={`/platform/tenants/${m.companyId}`} className="text-orange-400 hover:underline">{m.companyName}</Link> : "—"}
                  </td>
                  <td className="px-3 py-2">{m.accountType ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-slate-400">{m.employeeId}</td>
                  <td className="px-3 py-2">{[m.firstName, m.lastName].filter(Boolean).join(" ")}</td>
                  <td className="px-3 py-2">{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Actions</h2>
        <SupportActions userId={user.id} email={user.email} canReset={canReset} canMfa={canMfa} canInvite={canInvite} />
      </section>
    </div>
  );
}
