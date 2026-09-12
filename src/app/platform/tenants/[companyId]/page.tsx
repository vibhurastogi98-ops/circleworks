import Link from "next/link";
import { eq } from "drizzle-orm";

import { requirePlatformSession } from "@/lib/platform-session-server";
import { hasPlatformPermission } from "@/lib/platform-rbac";
import { db } from "@/db";
import { companies, employees, users } from "@/db/schema";
import TenantActions from "./TenantActions";

export const dynamic = "force-dynamic";

export default async function TenantDetailPage({ params }: { params: Promise<{ companyId: string }> }) {
  const session = await requirePlatformSession();
  if (!hasPlatformPermission(session.role, "tenant.read")) {
    return <div className="p-8 text-red-400">Forbidden.</div>;
  }
  const { companyId } = await params;
  const cid = Number(companyId);
  if (!Number.isInteger(cid)) return <div className="p-8">Bad company id.</div>;

  const [company] = await db.select().from(companies).where(eq(companies.id, cid)).limit(1);
  if (!company) return <div className="p-8 text-slate-400">Tenant not found.</div>;

  const team = await db
    .select({
      id: employees.id,
      firstName: employees.firstName,
      lastName: employees.lastName,
      email: employees.email,
      personalEmail: employees.personalEmail,
      jobTitle: employees.jobTitle,
      status: employees.status,
      userId: employees.userId,
      userRole: users.role,
    })
    .from(employees)
    .leftJoin(users, eq(users.id, employees.userId))
    .where(eq(employees.companyId, cid))
    .limit(50);

  const canSuspend = hasPlatformPermission(session.role, "tenant.suspend");
  const canImpersonate = hasPlatformPermission(session.role, "impersonation.start");

  return (
    <div className="p-8 text-slate-100">
      <Link href="/platform/tenants" className="text-xs text-slate-400 hover:underline">← All tenants</Link>
      <h1 className="mt-2 text-2xl font-black">{company.name}</h1>
      <div className="mt-1 text-sm text-slate-400">
        #{company.id} · {company.accountType} · created {company.createdAt?.toISOString().slice(0, 10)}
      </div>
      {company.suspendedAt && (
        <div className="mt-3 rounded border border-orange-500/60 bg-orange-500/10 p-3 text-sm text-orange-300">
          Suspended {company.suspendedAt.toISOString()} — reason: {company.suspendedReasonCode ?? "unspecified"}
        </div>
      )}

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Basics</h2>
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-slate-400">Account type</dt><dd>{company.accountType}</dd>
            <dt className="text-slate-400">Entity type</dt><dd>{company.entityType ?? "—"}</dd>
            <dt className="text-slate-400">Pay self as owner</dt><dd>{company.paySelfAsOwner ? "yes" : "no"}</dd>
            <dt className="text-slate-400">Contractor count</dt><dd>{company.contractorCount ?? 0}</dd>
          </dl>
        </div>
        <div className="rounded border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Actions</h2>
          <TenantActions companyId={company.id} suspended={!!company.suspendedAt} canSuspend={canSuspend} canImpersonate={canImpersonate} />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Team ({team.length})</h2>
        <div className="overflow-hidden rounded border border-slate-800 bg-slate-950/60 text-sm">
          <table className="w-full">
            <thead className="bg-slate-900/70 text-xs text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Impersonate</th>
              </tr>
            </thead>
            <tbody>
              {team.map((t) => (
                <tr key={t.id} className="border-t border-slate-800">
                  <td className="px-3 py-2">{[t.firstName, t.lastName].filter(Boolean).join(" ")}</td>
                  <td className="px-3 py-2">{t.email ?? t.personalEmail}</td>
                  <td className="px-3 py-2">{t.jobTitle ?? "—"}</td>
                  <td className="px-3 py-2">{t.status}</td>
                  <td className="px-3 py-2">{t.userRole ?? "—"}</td>
                  <td className="px-3 py-2">
                    {canImpersonate && t.userId ? (
                      <TenantActions.ImpersonateLink companyId={company.id} userId={t.userId} email={t.email ?? t.personalEmail ?? ""} />
                    ) : (
                      <span className="text-xs text-slate-500">n/a</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
