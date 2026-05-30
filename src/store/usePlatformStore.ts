import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlatformTheme = "light" | "dark" | "system";
export type ResolvedPlatformTheme = "light" | "dark";

export interface PlatformCompany {
  id: string;
  name: string;
  logo?: string;
  domain?: string;
  role?: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "hr" | "accountant" | "employee" | "contractor";
  avatarUrl?: string;
}

export interface PlatformNotification {
  id: string;
  title: string;
  unread: boolean;
}

export interface ComplianceAlertSummary {
  critical: number;
  warning: number;
}

interface PlatformState {
  currentCompany: PlatformCompany;
  companies: PlatformCompany[];
  currentUser: PlatformUser;
  sidebarOpen: boolean;
  isSidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeRoute: string;
  notifications: PlatformNotification[];
  unreadCount: number;
  theme: PlatformTheme;
  isDarkMode: boolean;
  complianceAlerts: ComplianceAlertSummary;
  hasComplianceAlert: boolean;
  payrollRunInProgress: boolean;
  isPayrollRunning: boolean;
  isAdmin: boolean;
  notificationCount: number;
  isCommandPaletteOpen: boolean;
  isCirceOpen: boolean;
  setCurrentCompany: (company: PlatformCompany) => void;
  setCurrentUser: (user: PlatformUser) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveRoute: (route: string) => void;
  setTheme: (theme: PlatformTheme) => void;
  toggleDarkMode: () => void;
  dismissComplianceAlert: () => void;
  setComplianceAlerts: (alerts: ComplianceAlertSummary) => void;
  setPayrollRunInProgress: (val: boolean) => void;
  setPayrollRunning: (val: boolean) => void;
  incrementNotificationCount: () => void;
  clearNotifications: () => void;
  setCommandPaletteOpen: (val: boolean) => void;
  setIsCirceOpen: (val: boolean) => void;
  toggleCirce: () => void;
  closeTransientUi: () => void;
}

export function isPlatformTheme(value: unknown): value is PlatformTheme {
  return value === "light" || value === "dark" || value === "system";
}

export function getSystemTheme(): ResolvedPlatformTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolvePlatformTheme(theme: PlatformTheme): ResolvedPlatformTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

export function applyPlatformTheme(theme: PlatformTheme) {
  if (typeof document === "undefined") return;

  const resolvedTheme = resolvePlatformTheme(theme);
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = resolvedTheme;

  try {
    window.localStorage.setItem("theme", theme);
  } catch {
    // Storage can be unavailable in restricted browser modes.
  }
}

const DEFAULT_COMPANIES: PlatformCompany[] = [
  {
    id: "circleworks-demo",
    name: "CircleWorks Demo",
    domain: "circleworks.com",
    role: "Owner",
  },
  {
    id: "northstar-studios",
    name: "Northstar Studios",
    domain: "northstar.example",
    role: "Accountant",
  },
  {
    id: "bluebird-agency",
    name: "Bluebird Agency",
    domain: "bluebird.example",
    role: "Accountant",
  },
];

const DEFAULT_USER: PlatformUser = {
  id: "user-demo",
  name: "Vibhu Rastogi",
  email: "admin@circleworks.com",
  role: "admin",
};

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set) => ({
      currentCompany: DEFAULT_COMPANIES[0],
      companies: DEFAULT_COMPANIES,
      currentUser: DEFAULT_USER,
      sidebarOpen: false,
      isSidebarOpen: false,
      sidebarCollapsed: false,
      activeRoute: "/dashboard",
      notifications: [],
      unreadCount: 0,
      theme: "system",
      isDarkMode: false,
      complianceAlerts: { critical: 2, warning: 4 },
      hasComplianceAlert: true,
      payrollRunInProgress: false,
      isPayrollRunning: false,
      isAdmin: true,
      notificationCount: 0,
      isCommandPaletteOpen: false,
      isCirceOpen: false,
      setCurrentCompany: (company) => set({ currentCompany: company }),
      setCurrentUser: (user) =>
        set({
          currentUser: user,
          isAdmin: ["admin", "hr"].includes(user.role),
        }),
      toggleSidebar: () =>
        set((state) => {
          const next = !state.sidebarOpen;
          return { sidebarOpen: next, isSidebarOpen: next };
        }),
      setSidebarOpen: (open) => set({ sidebarOpen: open, isSidebarOpen: open }),
      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActiveRoute: (route) => set({ activeRoute: route }),
      setTheme: (theme) => {
        applyPlatformTheme(theme);
        set({ theme, isDarkMode: resolvePlatformTheme(theme) === "dark" });
      },
      toggleDarkMode: () =>
        set((state) => {
          const nextTheme = state.isDarkMode ? "light" : "dark";
          applyPlatformTheme(nextTheme);
          return { theme: nextTheme, isDarkMode: nextTheme === "dark" };
        }),
      dismissComplianceAlert: () =>
        set({
          complianceAlerts: { critical: 0, warning: 0 },
          hasComplianceAlert: false,
        }),
      setComplianceAlerts: (alerts) =>
        set({
          complianceAlerts: alerts,
          hasComplianceAlert: alerts.critical > 0,
        }),
      setPayrollRunInProgress: (val) =>
        set({ payrollRunInProgress: val, isPayrollRunning: val }),
      setPayrollRunning: (val) =>
        set({ payrollRunInProgress: val, isPayrollRunning: val }),
      incrementNotificationCount: () =>
        set((state) => ({ notificationCount: state.notificationCount + 1 })),
      clearNotifications: () => set({ notificationCount: 0 }),
      setCommandPaletteOpen: (val) => set({ isCommandPaletteOpen: val }),
      setIsCirceOpen: (val) => set({ isCirceOpen: val }),
      toggleCirce: () => set((state) => ({ isCirceOpen: !state.isCirceOpen })),
      closeTransientUi: () =>
        set({
          sidebarOpen: false,
          isSidebarOpen: false,
          isCommandPaletteOpen: false,
        }),
    }),
    {
      name: "platform-storage",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        let preferredTheme: PlatformTheme = "system";
        try {
          const storedTheme = window.localStorage.getItem("theme");
          if (isPlatformTheme(storedTheme)) preferredTheme = storedTheme;
        } catch {
          // Fall back to the system preference when storage is unavailable.
        }

        applyPlatformTheme(preferredTheme);
        state.theme = preferredTheme;
        state.isDarkMode = resolvePlatformTheme(preferredTheme) === "dark";
      },
    },
  ),
);
