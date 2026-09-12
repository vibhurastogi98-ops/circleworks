"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Eye,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type { AccountType } from "@/lib/account-types";
import { normalizeAccountType } from "@/lib/creator-mode";
import { resolveDashboard } from "@/lib/dashboard-resolver";
import { useAuth } from "@/context/AuthContext";
import { usePlatformStore } from "@/store/usePlatformStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ACCOUNT_TYPE_OPTIONS: Array<{
  type: AccountType;
  label: string;
  shortLabel: string;
  description: string;
  modules: string[];
  icon: typeof Building2;
}> = [
  {
    type: "company",
    label: "Company",
    shortLabel: "Company",
    description: "Full employer workspace for payroll, employees, benefits, HR, compliance, and reports.",
    modules: ["Payroll", "Employees", "Benefits", "Compliance"],
    icon: Building2,
  },
  {
    type: "agency",
    label: "Agency",
    shortLabel: "Agency",
    description: "Client operations workspace with clients, contractors, mixed payroll, and margin views.",
    modules: ["Clients", "Contractors", "Payroll", "Reports"],
    icon: Users,
  },
  {
    type: "creator",
    label: "Creator/Solo",
    shortLabel: "Creator",
    description: "Focused solo operator workspace for owner pay, contractors, taxes, expenses, and documents.",
    modules: ["Pay Myself", "Contractors", "Taxes", "Documents"],
    icon: Sparkles,
  },
];

type SwitchResponse = {
  success?: boolean;
  redirectTo?: string;
  accountType?: AccountType;
  error?: string;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function canSwitchAccountType(role?: string | null) {
  const normalizedRole = (role ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return normalizedRole === "owner" || normalizedRole === "super_admin" || normalizedRole === "admin";
}

function accountTypeLabel(type: AccountType) {
  return ACCOUNT_TYPE_OPTIONS.find((option) => option.type === type)?.label ?? "Company";
}

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const {
    currentCompany,
    currentUser,
    accountType,
    dashboardPreviewAccountType,
    setAccountType,
    setDashboardPreviewAccountType,
    clearDashboardPreviewAccountType,
  } = usePlatformStore();
  const [pendingSwitchType, setPendingSwitchType] = useState<AccountType | null>(null);
  const [switching, setSwitching] = useState(false);

  const realAccountType = normalizeAccountType(currentCompany.accountType ?? accountType);
  const previewAccountType = dashboardPreviewAccountType
    ? normalizeAccountType(dashboardPreviewAccountType)
    : null;
  const actorRole = user?.role ?? currentUser.role;
  const canSwitch = canSwitchAccountType(actorRole);
  const pendingOption = pendingSwitchType
    ? ACCOUNT_TYPE_OPTIONS.find((option) => option.type === pendingSwitchType)
    : null;

  const currentOption = useMemo(
    () => ACCOUNT_TYPE_OPTIONS.find((option) => option.type === realAccountType) ?? ACCOUNT_TYPE_OPTIONS[0]!,
    [realAccountType],
  );
  const CurrentIcon = currentOption.icon;

  const openDashboard = (type: AccountType) => {
    if (type === realAccountType) {
      clearDashboardPreviewAccountType();
      router.push(resolveDashboard(type));
      return;
    }

    setDashboardPreviewAccountType(type);
    router.push(resolveDashboard(realAccountType));
  };

  const startPreview = (type: AccountType) => {
    if (type === realAccountType) {
      clearDashboardPreviewAccountType();
    } else {
      setDashboardPreviewAccountType(type);
    }
    router.push(resolveDashboard(realAccountType));
  };

  const confirmSwitch = async () => {
    if (!pendingSwitchType) return;

    setSwitching(true);
    try {
      const response = await fetch("/api/account-type/switch", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accountType: pendingSwitchType }),
      });
      const data = (await response.json().catch(() => ({}))) as SwitchResponse;
      if (!response.ok || !data.accountType || !data.redirectTo) {
        throw new Error(data.error || "Account type could not be switched.");
      }

      clearDashboardPreviewAccountType();
      setAccountType(data.accountType);
      await refreshUser();
      setPendingSwitchType(null);
      toast.success(`Workspace switched to ${accountTypeLabel(data.accountType)}.`, {
        description: "Capabilities and dashboard routing were refreshed.",
      });
      router.push(data.redirectTo);
      router.refresh();
    } catch (error) {
      toast.error("Could not switch workspace type", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="flex max-w-5xl animate-in flex-col gap-6 fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Account type, dashboard access, and workspace capabilities.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Current account type</p>
          <p className="mt-1 flex items-center gap-2 font-bold text-slate-950 dark:text-white">
            <CurrentIcon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            {currentOption.label}
          </p>
        </div>
      </div>

      {previewAccountType && previewAccountType !== realAccountType ? (
        <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 shrink-0" />
            <p className="text-sm font-bold">
              Previewing as {accountTypeLabel(previewAccountType)}
            </p>
          </div>
          <button
            type="button"
            onClick={clearDashboardPreviewAccountType}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-100 dark:hover:bg-blue-500/20"
          >
            <X className="h-4 w-4" />
            Exit preview
          </button>
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Dashboard Type</h2>
          </div>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-3">
          {ACCOUNT_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isCurrent = option.type === realAccountType;
            const isPreviewing = option.type === previewAccountType && option.type !== realAccountType;

            return (
              <div
                key={option.type}
                data-testid={`account-type-card-${option.type}`}
                className={cx(
                  "flex min-h-[320px] flex-col rounded-xl border p-4 transition",
                  isCurrent
                    ? "border-blue-300 bg-blue-50/70 dark:border-blue-400/40 dark:bg-blue-500/10"
                    : isPreviewing
                      ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-400/40 dark:bg-emerald-500/10"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex flex-wrap justify-end gap-2">
                    {isCurrent ? (
                      <span className="inline-flex h-7 items-center gap-1 rounded-full bg-blue-600 px-2.5 text-xs font-black text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Current
                      </span>
                    ) : null}
                    {isPreviewing ? (
                      <span className="inline-flex h-7 items-center gap-1 rounded-full bg-emerald-600 px-2.5 text-xs font-black text-white">
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex-1">
                  <h3 className="text-lg font-black text-slate-950 dark:text-white">{option.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{option.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {option.modules.map((module) => (
                      <span
                        key={module}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {module}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => openDashboard(option.type)}
                    className={cx(
                      "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition",
                      isCurrent
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300",
                    )}
                  >
                    {isCurrent ? "Open dashboard" : "Preview dashboard"}
                  </button>
                  <button
                    type="button"
                    onClick={() => startPreview(option.type)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                  >
                    <Eye className="h-4 w-4" />
                    {isCurrent ? "Exit preview" : "Preview as"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingSwitchType(option.type)}
                    disabled={!canSwitch || isCurrent}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-white hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:bg-slate-900 dark:hover:text-blue-300"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Switch to {option.shortLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {!canSwitch ? (
          <div className="border-t border-slate-200 px-5 py-4 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Switching account type requires an owner or admin role.
          </div>
        ) : null}
      </section>

      <Dialog open={Boolean(pendingSwitchType)} onOpenChange={(open) => !open && !switching && setPendingSwitchType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch workspace type?</DialogTitle>
            <DialogDescription>
              {pendingOption
                ? `This changes ${currentCompany.name} from ${accountTypeLabel(realAccountType)} to ${pendingOption.label}.`
                : "This changes the persisted workspace account type."}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Capabilities, navigation, route guards, and the default dashboard will be recalculated after the switch.
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setPendingSwitchType(null)}
              disabled={switching}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmSwitch}
              disabled={switching}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Confirm switch
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
