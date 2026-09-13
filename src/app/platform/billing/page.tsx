import Link from "next/link";
import { count, desc, eq, sql } from "drizzle-orm";

import { requirePlatformSession } from "@/lib/platform-session-server";
import { hasPlatformPermission } from "@/lib/platform-rbac";
import { db } from "@/db";
import { companies, plans, tenantPlans } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function BillingOverviewPage() {
  const session = await requirePlatformSession();
  if (!hasPlatformPermission(session.role, "billing.viewInvoices")) {
    return <div className="p-8 text-red-400">Forbidden.</div>;
  }

  const planCatalog = await db.select().from(plans).orderBy(plans.name);

  const byPlan = await db
    .select({
      planId: tenantPlans.planId,
      tenants: count(),
      totalSeats: sql<number>`SUM(${tenantPlans.seatCount})`.as("total_seats"),
    })
    .from(tenantPlans)
    .groupBy(tenantPlans.planId);

  const [{ totalTenants }] = await db.select({ totalTenants: count() }).from(companies);

  // MRR estimate: sum of (base + seats * per_seat) per active tenant_plan
  const [mrr] = await db
    .select({
      cents: sql<number>`
        COALESCE(SUM(${plans.basePriceCents} + ${plans.perSeatPriceCents} * ${tenantPlans.seatCount}), 0)
      `.as("cents"),
    })
    .from(tenantPlans)
    .innerJoin(plans, eq(plans.id, tenantPlans.planId))
    .where(eq(tenantPlans.status, "active"));

  const monthlyRecurringDollars = ((mrr?.cents ?? 0) / 100).toFixed(2);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black">Billing & plans</h1>
      <p className="mt-1 text-sm text-slate-400">Platform-wide plan assignments and monthly recurring revenue.</p>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Monthly recurring (est.)" value={`$${monthlyRecurringDollars}`} />
        <StatCard label="Tenants on a plan" value={byPlan.reduce((n, r) => n + Number(r.tenants), 0).toString()} />
        <StatCard label="Total tenants" value={String(totalTenants)} />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">By plan</h2>
          <div className="overflow-hidden rounded border border-slate-800 bg-slate-950/60 text-sm">
            <table className="w-full">
              <thead className="bg-slate-900/70 text-xs text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">Plan</th>
                  <th className="px-3 py-2 text-right">Tenants</th>
                  <th className="px-3 py-2 text-right">Seats</th>
                </tr>
              </thead>
              <tbody>
                {byPlan.map((r) => (
                  <tr key={r.planId} className="border-t border-slate-800">
                    <td className="px-3 py-2 font-mono">{r.planId}</td>
                    <td className="px-3 py-2 text-right">{Number(r.tenants)}</td>
                    <td className="px-3 py-2 text-right">{Number(r.totalSeats ?? 0)}</td>
                  </tr>
                ))}
                {byPlan.length === 0 && (
                  <tr><td colSpan={3} className="px-3 py-6 text-center text-slate-500">No tenants have a plan assigned.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Plan catalog</h2>
          <div className="overflow-hidden rounded border border-slate-800 bg-slate-950/60 text-sm">
            <table className="w-full">
              <thead className="bg-slate-900/70 text-xs text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-right">Base</th>
                  <th className="px-3 py-2 text-right">Per seat</th>
                  <th className="px-3 py-2 text-left">Active</th>
                </tr>
              </thead>
              <tbody>
                {planCatalog.map((p) => (
                  <tr key={p.id} className="border-t border-slate-800">
                    <td className="px-3 py-2 font-mono">{p.id}</td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2 text-right">${(p.basePriceCents / 100).toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">${(p.perSeatPriceCents / 100).toFixed(2)}</td>
                    <td className="px-3 py-2">{p.isActive ? "yes" : "no"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs text-slate-500">
        To change a tenant's plan, open the tenant from <Link href="/platform/tenants" className="text-orange-400 hover:underline">Tenants</Link>.
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-800 bg-slate-950/60 p-4">
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-black">{value}</div>
    </div>
  );
}
