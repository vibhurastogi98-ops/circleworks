import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";

import { getPlatformSessionServer } from "@/lib/platform-session-server";
import { hasPlatformPermission } from "@/lib/platform-rbac";

const NAV: { href: string; label: string; permission?: string }[] = [
  { href: "/platform", label: "Overview" },
  { href: "/platform/tenants", label: "Tenants", permission: "tenant.read" },
  { href: "/platform/audit", label: "Audit log", permission: "audit.read" },
  { href: "/platform/admins", label: "Admins", permission: "admin.read" },
];

export const dynamic = "force-dynamic";

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const h = await headers();
  const pathname = h.get("x-invoke-path") ?? h.get("next-url") ?? "";
  const isPublic =
    pathname === "/platform/login" ||
    pathname === "/platform/logout" ||
    pathname === "/platform/bootstrap";

  const session = isPublic ? null : await getPlatformSessionServer();

  if (isPublic || !session) {
    return <div style={{ background: "#0A1628", minHeight: "100vh" }}>{children}</div>;
  }

  return (
    <div className="flex min-h-screen text-slate-100" style={{ background: "#0A1628" }}>
      <aside className="w-56 shrink-0 border-r border-slate-800 bg-slate-950/50 p-4">
        <div className="mb-6 flex items-center gap-2">
          <span className="rounded bg-orange-500 px-2 py-1 text-xs font-black text-slate-950">PLATFORM</span>
        </div>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV.filter((n) => !n.permission || hasPlatformPermission(session.role, n.permission as never)).map((n) => (
            <Link key={n.href} href={n.href} className="rounded px-2 py-1.5 text-slate-300 hover:bg-slate-800/60">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 text-xs text-slate-500">
          Signed in as
          <div className="mt-1 truncate text-slate-300">admin #{session.adminId}</div>
          <div className="text-slate-500">{session.role}</div>
          <form action="/api/platform/auth/logout" method="post" className="mt-3">
            <button type="submit" className="text-xs text-orange-400 hover:underline">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto">{children}</main>
    </div>
  );
}
