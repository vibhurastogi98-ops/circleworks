"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { usePlatformStore, type PlatformUser } from "@/store/usePlatformStore";
import {
  getAccountTypeRouteRedirect,
  isCreatorAccountType,
  normalizeAccountType,
} from "@/lib/creator-mode";
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
  "/documents",
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
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [companyContextHydrated, setCompanyContextHydrated] = useState(false);
  const { user } = useAuth();
  const {
    accountType,
    isCreatorMode,
    sidebarCollapsed,
    setActiveRoute,
    setSidebarOpen,
    setCurrentUser,
    setCurrentCompany,
    setAccountType,
    complianceAlerts,
  } = usePlatformStore();
  const usePlatformShell = shouldUsePlatformShell(pathname);
  const normalizedAccountType = normalizeAccountType(accountType);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActiveRoute(pathname);
    setSidebarOpen(false);
  }, [pathname, setActiveRoute, setSidebarOpen]);

  useEffect(() => {
    if (!mounted || !usePlatformShell || !companyContextHydrated) return;
    const redirectTo = getAccountTypeRouteRedirect(normalizedAccountType, pathname);
    if (redirectTo && redirectTo !== pathname) router.replace(redirectTo);
  }, [companyContextHydrated, mounted, normalizedAccountType, pathname, router, usePlatformShell]);

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

  useEffect(() => {
    if (!mounted || !usePlatformShell) return;

    let cancelled = false;

    const hydrateCompanyContext = async () => {
      try {
        const response = await fetch("/api/users/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as {
          company?: {
            id?: string | number | null;
            name?: string | null;
            accountType?: string | null;
            creatorEntityType?: string | null;
            paySelfAsOwner?: boolean | null;
            contractorCount?: number | null;
            logoUrl?: string | null;
          };
          user?: { accountType?: string | null };
        };
        if (cancelled) return;

        const resolvedAccountType = normalizeAccountType(data.company?.accountType ?? data.user?.accountType ?? accountType);
        setAccountType(resolvedAccountType);

        if (data.company?.id || data.company?.name) {
          setCurrentCompany({
            id: String(data.company.id ?? "creator-company"),
            name: data.company.name || "Creator Studio",
            logo: data.company.logoUrl || undefined,
            domain: isCreatorAccountType(resolvedAccountType)
              ? "Creator workspace"
              : resolvedAccountType === "agency"
                ? "Agency workspace"
                : "Workspace",
            role: "Owner",
            accountType: resolvedAccountType,
            creatorEntityType: data.company.creatorEntityType ?? null,
            paySelfAsOwner: Boolean(data.company.paySelfAsOwner),
            contractorCount: data.company.contractorCount ?? 0,
          });
          setAccountType(resolvedAccountType);
        }
      } catch (error) {
        console.error("[AppShell company hydrate]", error);
      } finally {
        if (!cancelled) setCompanyContextHydrated(true);
      }
    };

    void hydrateCompanyContext();

    return () => {
      cancelled = true;
    };
  }, [accountType, isCreatorMode, mounted, setAccountType, setCurrentCompany, usePlatformShell]);

  if (!usePlatformShell) {
    return <div className="marketing-surface">{children}</div>;
  }

  const renderedSidebarCollapsed = mounted ? sidebarCollapsed : false;
  const renderedComplianceCritical = mounted && !isCreatorMode ? complianceAlerts.critical : 0;
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
