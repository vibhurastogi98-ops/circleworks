"use client";

import { useEffect } from "react";
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
  const { user } = useAuth();
  const {
    sidebarCollapsed,
    setActiveRoute,
    setSidebarOpen,
    setCurrentUser,
    complianceAlerts,
    theme,
  } = usePlatformStore();
  const usePlatformShell = shouldUsePlatformShell(pathname);

  useEffect(() => {
    setActiveRoute(pathname);
    setSidebarOpen(false);
  }, [pathname, setActiveRoute, setSidebarOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

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
    return <>{children}</>;
  }

  const shellOffset = sidebarCollapsed
    ? "lg:pl-[72px]"
    : "lg:pl-[72px] xl:pl-[240px]";

  return (
    <div className="h-[100dvh] overflow-hidden bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AppSidebar />
      <div className={`h-full min-w-0 ${shellOffset}`}>
        <AppTopBar />
        <main
          id="main-content"
          className={`h-full overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-slate-950 ${
            complianceAlerts.critical > 0 ? "pt-[104px]" : "pt-16"
          }`}
        >
          {children}
        </main>
      </div>
      <OnboardingTour />
    </div>
  );
}
