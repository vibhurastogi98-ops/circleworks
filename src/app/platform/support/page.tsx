import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import Link from "next/link";

import { requirePlatformSession } from "@/lib/platform-session-server";
import { hasPlatformPermission } from "@/lib/platform-rbac";
import { db } from "@/db";
import { users, employees, companies } from "@/db/schema";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string };

export default async function SupportUserSearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await requirePlatformSession();
  if (!hasPlatformPermission(session.role, "supportUser.read")) {
    return <div className="p-8 text-red-400">Forbidden.</div>;
  }
  const params = await searchParams;
  const q = (params.q ?? "").trim();

  const rows = q
    ? await db
        .select({
          userId: users.id,
          email: users.email,
          userRole: users.role,
          softDeletedAt: users.softDeletedAt,
          companyId: employees.companyId,
          companyName: companies.name,
          employeeStatus: employees.status,
          firstName: employees.firstName,
          lastName: employees.lastName,
        })
        .from(users)
        .leftJoin(employees, eq(employees.userId, users.id))
        .leftJoin(companies, eq(companies.id, employees.companyId))
        .where(
          and(
            isNull(users.softDeletedAt),
            or(
              ilike(users.email, `%${q}%`),
              sql`${users.id}::text = ${q}`,
              ilike(employees.firstName, `%${q}%`),
              ilike(employees.lastName, `%${q}%`),
            ),
          ),
        )
        .orderBy(desc(users.createdAt))
        .limit(100)
    : [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black">Cross-tenant support</h1>
      <p className="mt-1 text-sm text-slate-400">Find any user across any tenant.</p>

      <form className="mt-4 flex gap-2 text-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email, user id, or first/last name"
          className="w-full rounded border border-slate-700 bg-slate-950/60 px-3 py-1.5"
        />
        <button className="rounded bg-orange-500 px-3 py-1.5 font-bold text-slate-950">Search</button>
      </form>

      <div className="mt-6 overflow-hidden rounded border border-slate-800 bg-slate-950/60 text-sm">
        <table className="w-full">
          <thead className="bg-slate-900/70 text-xs text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">User ID</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Tenant</th>
              <th className="px-3 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">{q ? "No users match." : "Enter a search term above."}</td></tr>
            )}
            {rows.map((r) => (
              <tr key={`${r.userId}-${r.companyId ?? "none"}`} className="border-t border-slate-800">
                <td className="px-3 py-2 font-mono text-slate-400">{r.userId}</td>
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2">{[r.firstName, r.lastName].filter(Boolean).join(" ") || "—"}</td>
                <td className="px-3 py-2">{r.userRole ?? "—"}</td>
                <td className="px-3 py-2">
                  {r.companyId ? (
                    <Link href={`/platform/tenants/${r.companyId}`} className="text-orange-400 hover:underline">{r.companyName}</Link>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <Link href={`/platform/support/${r.userId}`} className="text-orange-400 hover:underline">Manage →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
