"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { usePlatformStore, type PlatformUser } from "@/store/usePlatformStore";
import AppSidebar from "@/components/app/AppSidebar";
import AppTopBar from "@/components/app/AppTopBar";
import OnboardingTour from "@/components/OnboardingTour";

const PLATFORM_ROUTE_PREFIXES = [
  "/dashboard",
  "/payroll",
  "/employees",
  "/hiring",
  "/onboarding",
  "/benefits",
  "/time",
  "/expenses",
  "/performance",
  "/compliance",
  "/reports",
  "/settings",
  "/app",
  "/help",
  "/contractors",
  "/agency",
  "/learning",
  "/c/",
];

function shouldUsePlatformShell(pathname: string) {
  return PLATFORM_ROUTE_PREFIXES.some((prefix) =>
    prefix.endsWith("/")
      ? pathname.startsWith(prefix)
      : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function displayNameFromEmail(email: string) {
  const fallback = email.split("@")[0] || "User";
  return fallback
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const {
    sidebarCollapsed,
    setActiveRoute,
    setSidebarOpen,
    setCurrentUser,
    complianceAlerts,
  } = usePlatformStore();
  const usePlatformShell = shouldUsePlatformShell(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActiveRoute(pathname);
    setSidebarOpen(false);
  }, [pathname, setActiveRoute, setSidebarOpen]);

  useEffect(() => {
    if (!user?.email) return;

    const rawRole = user.role?.toLowerCase();
    const role: PlatformUser["role"] =
      rawRole === "admin" ||
      rawRole === "hr" ||
      rawRole === "accountant" ||
      rawRole === "contractor" ||
      rawRole === "employee"
        ? rawRole
        : "employee";

    setCurrentUser({
      id: user.userId,
      name: displayNameFromEmail(user.email),
      email: user.email,
      role,
    });
  }, [setCurrentUser, user]);

  if (!usePlatformShell) {
    return <div className="marketing-surface">{children}</div>;
  }

  const renderedSidebarCollapsed = mounted ? sidebarCollapsed : false;
  const renderedComplianceCritical = mounted ? complianceAlerts.critical : 0;
  const shellOffset = renderedSidebarCollapsed
    ? "lg:pl-[72px]"
    : "lg:pl-[72px] xl:pl-[240px]";

  return (
    <div className="platform-shell h-[100dvh] overflow-hidden bg-[var(--surface-subtle)] text-[var(--text-primary)]">
      {mounted ? <AppSidebar /> : null}
      <div className={`h-full min-w-0 ${shellOffset}`}>
        {mounted ? <AppTopBar /> : null}
        <main
          id="main-content"
          className={`h-full overflow-y-auto overflow-x-hidden bg-[var(--surface-subtle)] ${
            renderedComplianceCritical > 0 ? "pt-[104px]" : "pt-16"
          }`}
        >
          {children}
        </main>
      </div>
      {mounted ? <OnboardingTour /> : null}
    </div>
  );
}
