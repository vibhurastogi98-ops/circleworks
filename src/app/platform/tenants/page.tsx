import Link from "next/link";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import { requirePlatformSession } from "@/lib/platform-session-server";
import { hasPlatformPermission } from "@/lib/platform-rbac";
import { db } from "@/db";
import { companies } from "@/db/schema";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; type?: string; status?: string };

export default async function TenantDirectoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await requirePlatformSession();
  if (!hasPlatformPermission(session.role, "tenant.read")) {
    return <div className="p-8 text-red-400">Forbidden.</div>;
  }
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const typeFilter = params.type ?? "";
  const statusFilter = params.status ?? "";

  const where = and(
    q ? or(ilike(companies.name, `%${q}%`), sql`${companies.id}::text = ${q}`) : sql`TRUE`,
    typeFilter ? eq(companies.accountType, typeFilter as "company" | "agency" | "creator") : sql`TRUE`,
    statusFilter === "suspended"
      ? sql`${companies.suspendedAt} IS NOT NULL`
      : statusFilter === "active"
        ? sql`${companies.suspendedAt} IS NULL AND ${companies.softDeletedAt} IS NULL`
        : sql`TRUE`,
  );

  const rows = await db
    .select({
      id: companies.id,
      name: companies.name,
      accountType: companies.accountType,
      createdAt: companies.createdAt,
      suspendedAt: companies.suspendedAt,
      softDeletedAt: companies.softDeletedAt,
    })
    .from(companies)
    .where(where)
    .orderBy(desc(companies.createdAt))
    .limit(200);

  return (
    <div className="p-8 text-slate-100">
      <h1 className="text-2xl font-black">Tenants</h1>
      <p className="mt-1 text-sm text-slate-400">Every company, agency, and creator on the platform.</p>

      <form className="mt-4 flex flex-wrap gap-2 text-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or id"
          className="rounded border border-slate-700 bg-slate-950/60 px-3 py-1.5"
        />
        <select name="type" defaultValue={typeFilter} className="rounded border border-slate-700 bg-slate-950/60 px-3 py-1.5">
          <option value="">All types</option>
          <option value="company">Company</option>
          <option value="agency">Agency</option>
          <option value="creator">Creator</option>
        </select>
        <select name="status" defaultValue={statusFilter} className="rounded border border-slate-700 bg-slate-950/60 px-3 py-1.5">
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <button type="submit" className="rounded bg-orange-500 px-3 py-1.5 font-bold text-slate-950">Filter</button>
      </form>

      <div className="mt-6 overflow-hidden rounded border border-slate-800 bg-slate-950/60 text-sm">
        <table className="w-full">
          <thead className="bg-slate-900/70 text-xs text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">No tenants match.</td></tr>
            )}
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-slate-800">
                <td className="px-3 py-2 font-mono text-slate-400">{c.id}</td>
                <td className="px-3 py-2 font-bold">{c.name}</td>
                <td className="px-3 py-2 text-slate-300">{c.accountType}</td>
                <td className="px-3 py-2 text-slate-400">{c.createdAt?.toISOString().slice(0, 10)}</td>
                <td className="px-3 py-2">
                  {c.softDeletedAt ? (
                    <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs text-red-300">Soft-deleted</span>
                  ) : c.suspendedAt ? (
                    <span className="rounded bg-orange-500/20 px-2 py-0.5 text-xs text-orange-300">Suspended</span>
                  ) : (
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">Active</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <Link href={`/platform/tenants/${c.id}`} className="text-orange-400 hover:underline">Open →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
