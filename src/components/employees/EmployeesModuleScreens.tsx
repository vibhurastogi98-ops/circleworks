"use client";

import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Briefcase,
  CalendarDays,
  Check,
  ChevronLeft,
  Download,
  Edit3,
  Eye,
  FileArchive,
  FileText,
  Filter,
  Grid2X2,
  Landmark,
  List,
  Loader2,
  Mail,
  MoreHorizontal,
  Network,
  Plus,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserRound,
  UserX,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmptyState from "@/components/EmptyState";
import QueryErrorState from "@/components/ErrorState";
import { EmployeesEmptyIllustration } from "@/components/StateIllustrations";
import { EmployeeTableSkeleton, ProfileSkeleton } from "@/components/skeletons";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type {
  ActivityData,
  BenefitsTabData,
  BulkImportData,
  CompensationData,
  DirectoryData,
  DocumentData,
  EmployeeRecord,
  EmployeeStatus,
  HrisModuleData,
  HrisModuleScreen,
  NewEmployeeData,
  OrgChartData,
  PayrollTabData,
  PerformanceTabData,
  ProfileData,
  TimeTabData,
} from "@/lib/hris-module-data";

type ApiResponse<T extends HrisModuleData> = {
  screen: HrisModuleScreen;
  data: T;
};

type HrisActionPayload = {
  action: string;
  screen: HrisModuleScreen;
  payload?: Record<string, unknown>;
};

type DirectoryView = "list" | "grid" | "org";

const statusStyles: Record<string, string> = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  Inactive: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "On Leave": "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
  Onboarding: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300",
  Terminated: "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300",
  Valid: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  "Expiring Soon": "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
  Expired: "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300",
  Error: "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300",
  Warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
};

const tabConfig = [
  { label: "Overview", segment: "" },
  { label: "Compensation", segment: "compensation" },
  { label: "Benefits", segment: "benefits" },
  { label: "Time & PTO", segment: "time" },
  { label: "Documents", segment: "documents" },
  { label: "Payroll", segment: "payroll" },
  { label: "Performance", segment: "performance" },
  { label: "Activity", segment: "activity" },
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function employeeName(employee: EmployeeRecord) {
  return `${employee.firstName} ${employee.lastName}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function shortDate(value: string) {
  if (!value.includes("-")) return value;
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function fetchHrisModule<T extends HrisModuleData>(
  screen: HrisModuleScreen,
  employeeId?: string,
) {
  const params = new URLSearchParams({ screen });
  if (employeeId) params.set("employeeId", employeeId);
  const response = await fetch(`/api/employees/module?${params.toString()}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Unable to load employee data");
  return (await response.json()) as ApiResponse<T>;
}

async function mutateHrisModule(payload: HrisActionPayload) {
  const response = await fetch("/api/employees/module", {
    method: payload.action.includes("update") ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Unable to save employee changes");
  return response.json() as Promise<{ ok: boolean; updatedAt: string }>;
}

function useHrisModule<T extends HrisModuleData>(
  screen: HrisModuleScreen,
  employeeId?: string,
) {
  return useQuery({
    queryKey: ["employees", "module", screen, employeeId || "all"],
    queryFn: () => fetchHrisModule<T>(screen, employeeId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

function useHrisAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mutateHrisModule,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["employees"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ]);
    },
  });
}

function LoadingState({ title = "Loading employee data" }: { title?: string }) {
  if (title.toLowerCase().includes("profile") || title.toLowerCase().includes("editor") || title.toLowerCase().includes("termination")) {
    return <ProfileSkeleton />;
  }
  return <EmployeeTableSkeleton />;
}

function ErrorState({ retry, error }: { retry: () => void; error?: unknown }) {
  return (
    <QueryErrorState
      title="Something went wrong"
      description={error instanceof Error ? error.message : "Employee data could not load. Check your connection and retry."}
      retry={retry}
    />
  );
}

function PageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900", className)}>
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold",
        statusStyles[status] || statusStyles.Inactive,
      )}
    >
      {status}
    </span>
  );
}

function Avatar({ employee, size = "md" }: { employee: EmployeeRecord; size?: "sm" | "md" | "lg" }) {
  const classes = size === "lg" ? "h-24 w-24 text-2xl" : size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";
  return (
    <span
      className={cx(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 font-bold text-slate-800 ring-1 ring-slate-200 dark:from-blue-500/20 dark:to-emerald-500/20 dark:text-slate-100 dark:ring-slate-700",
        classes,
      )}
    >
      {initials(employeeName(employee))}
    </span>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{children}</span>;
}

function SelectControl({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function getQueryParam(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get(name) || fallback;
}

export function EmployeesDirectoryScreen() {
  const router = useRouter();
  const query = useHrisModule<DirectoryData>("directory");
  const [urlReady, setUrlReady] = useState(false);
  const [view, setView] = useState<DirectoryView>("list");
  const [statusPill, setStatusPill] = useState("Active");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [payType, setPayType] = useState("All");
  const [location, setLocation] = useState("All");
  const [manager, setManager] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setView(getQueryParam("view", "list") as DirectoryView);
    setStatusPill(getQueryParam("statusPill", "Active"));
    setSearch(getQueryParam("q", ""));
    setDepartment(getQueryParam("department", "All"));
    setStatus(getQueryParam("status", "All"));
    setPayType(getQueryParam("payType", "All"));
    setLocation(getQueryParam("location", "All"));
    setManager(getQueryParam("manager", "All"));
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const params = new URLSearchParams();
    params.set("view", view);
    if (statusPill !== "Active") params.set("statusPill", statusPill);
    if (search) params.set("q", search);
    if (department !== "All") params.set("department", department);
    if (status !== "All") params.set("status", status);
    if (payType !== "All") params.set("payType", payType);
    if (location !== "All") params.set("location", location);
    if (manager !== "All") params.set("manager", manager);
    router.replace(`/employees?${params.toString()}`, { scroll: false });
  }, [department, location, manager, payType, router, search, status, statusPill, urlReady, view]);

  if (query.isLoading && !query.data) return <EmployeeTableSkeleton />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;

  const data = query.data.data;
  if (data.employees.length === 0) {
    return (
      <PageShell
        title="Employees"
        description="Manage employee records, reporting lines, payroll attributes, documents, and lifecycle status."
        actions={
          <>
            <Link href="/employees/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add Employee
            </Link>
            <Link href="/employees/bulk" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <Upload className="h-4 w-4" /> Import CSV
            </Link>
          </>
        }
      >
        <EmptyState
          illustration={<EmployeesEmptyIllustration />}
          title="No employees yet"
          description="Your team will appear here"
          cta={{ label: "Add Your First Employee", href: "/employees/new" }}
        />
      </PageShell>
    );
  }
  const employees = data.employees.filter((employee) => {
    const haystack = `${employeeName(employee)} ${employee.email} ${employee.title}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesPill =
      statusPill === "All" ||
      (statusPill === "Active" && (employee.status === "Active" || employee.status === "Onboarding")) ||
      (statusPill === "Inactive" && (employee.status === "Inactive" || employee.status === "Terminated"));
    return (
      matchesSearch &&
      matchesPill &&
      (department === "All" || employee.department === department) &&
      (status === "All" || employee.status === status) &&
      (payType === "All" || employee.payType === payType) &&
      (location === "All" || employee.location === location) &&
      (manager === "All" || employee.manager === manager)
    );
  });

  const toggleSelected = (employeeId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setDepartment("All");
    setStatus("All");
    setPayType("All");
    setLocation("All");
    setManager("All");
    setStatusPill("All");
  };

  return (
    <PageShell
      title="Employees"
      description="Manage employee records, reporting lines, payroll attributes, documents, and lifecycle status."
      actions={
        <>
          <Link href="/employees/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add Employee
          </Link>
          <Link href="/employees/bulk" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <Upload className="h-4 w-4" /> Import CSV
          </Link>
        </>
      }
    >
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {data.counts.all} employees
          </span>
          {[
            ["Active", data.counts.active],
            ["Inactive", data.counts.inactive],
            ["All", data.counts.all],
          ].map(([label, count]) => (
            <button
              key={label}
              type="button"
              onClick={() => setStatusPill(String(label))}
              className={cx(
                "rounded-full px-3 py-1 text-sm font-bold transition",
                statusPill === label
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              {label} {count}
            </button>
          ))}
          <div className="ml-auto inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            {[
              { label: "List", value: "list", icon: List },
              { label: "Grid", value: "grid", icon: Grid2X2 },
              { label: "Org", value: "org", icon: Network },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setView(item.value as DirectoryView)}
                className={cx(
                  "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-bold",
                  view === item.value ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" : "text-slate-500",
                )}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(220px,1.3fr)_repeat(3,minmax(140px,1fr))]">
          <label className="relative md:col-span-2 xl:col-span-3 2xl:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, or title..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <SelectControl label="Department" value={department} onChange={setDepartment} options={["All", ...data.filters.departments]} />
          <SelectControl label="Status" value={status} onChange={setStatus} options={["All", ...data.filters.statuses]} />
          <SelectControl label="Pay type" value={payType} onChange={setPayType} options={["All", ...data.filters.payTypes]} />
          <SelectControl label="Location" value={location} onChange={setLocation} options={["All", ...data.filters.locations]} />
          <SelectControl label="Manager" value={manager} onChange={setManager} options={["All", ...data.filters.managers]} />
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-10 w-full items-center justify-center gap-2 self-end rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-500/10"
          >
            <X className="h-4 w-4" /> Clear filters
          </button>
        </div>
      </Card>

      {selected.size > 0 ? (
        <Card className="sticky top-20 z-20 flex flex-wrap items-center gap-3 p-4">
          <span className="text-sm font-bold">{selected.size} selected</span>
          <SecondaryButton onClick={() => downloadCsv("employees-selected.csv", [["Employee ID"], ...Array.from(selected).map((id) => [id])])}><Download className="h-4 w-4" /> Export CSV</SecondaryButton>
          <SecondaryButton><Send className="h-4 w-4" /> Send message</SecondaryButton>
          <SecondaryButton><SlidersHorizontal className="h-4 w-4" /> Update department</SecondaryButton>
          <SecondaryButton><UserX className="h-4 w-4" /> Terminate</SecondaryButton>
        </Card>
      ) : null}

      {view === "list" ? <EmployeesTable employees={employees} selected={selected} onToggle={toggleSelected} /> : null}
      {view === "grid" ? <EmployeesGrid employees={employees} /> : null}
      {view === "org" ? <DirectoryOrgView employees={employees} /> : null}
    </PageShell>
  );
}

function EmployeesTable({
  employees,
  selected,
  onToggle,
}: {
  employees: EmployeeRecord[];
  selected: Set<string>;
  onToggle: (employeeId: string) => void;
}) {
  const [actionMenu, setActionMenu] = useState<{
    employee: EmployeeRecord;
    left: number;
    top: number;
  } | null>(null);

  useEffect(() => {
    if (!actionMenu) return;

    const closeOnOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-employee-row-menu]")) return;
      setActionMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActionMenu(null);
    };
    const closeOnViewportChange = () => {
      setActionMenu(null);
    };

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("scroll", closeOnViewportChange, true);
    window.addEventListener("resize", closeOnViewportChange);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("scroll", closeOnViewportChange, true);
      window.removeEventListener("resize", closeOnViewportChange);
    };
  }, [actionMenu]);

  const openActionMenu = (employee: EmployeeRecord, event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 224;
    const menuHeight = 220;
    const viewportPadding = 12;
    const preferredTop = rect.bottom + 8;
    const fallbackTop = rect.top - menuHeight - 8;
    const top =
      preferredTop + menuHeight <= window.innerHeight - viewportPadding
        ? preferredTop
        : Math.max(viewportPadding, fallbackTop);

    setActionMenu({
      employee,
      left: Math.max(viewportPadding, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - viewportPadding)),
      top,
    });
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800/70">
              <tr>
                <th className="px-5 py-3"><span className="sr-only">Select</span></th>
                {["Name", "Title", "Department", "Location", "Status", "Start Date", "Manager", "Actions"].map((heading) => (
                  <th key={heading} className="px-5 py-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4">
                    <input type="checkbox" checked={selected.has(employee.id)} onChange={() => onToggle(employee.id)} />
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/employees/${employee.id}`} className="flex items-center gap-3">
                      <Avatar employee={employee} size="sm" />
                      <span>
                        <span className="block font-bold text-slate-950 dark:text-white">{employeeName(employee)}</span>
                        <span className="text-xs text-slate-500">{employee.email}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-4">{employee.title}</td>
                  <td className="px-5 py-4">{employee.department}</td>
                  <td className="px-5 py-4">{employee.location}</td>
                  <td className="px-5 py-4"><StatusBadge status={employee.status} /></td>
                  <td className="px-5 py-4">{shortDate(employee.startDate)}</td>
                  <td className="px-5 py-4">{employee.manager}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/employees/${employee.id}/compensation`} className="font-bold text-blue-700 hover:underline dark:text-blue-300">Open</Link>
                      <button
                        type="button"
                        aria-expanded={actionMenu?.employee.id === employee.id}
                        aria-label={`Actions for ${employeeName(employee)}`}
                        onClick={(event) => openActionMenu(employee, event)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {actionMenu ? (
        <div
          data-employee-row-menu
          role="menu"
          className="fixed z-[80] max-h-[min(320px,calc(100dvh-24px))] w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-xl dark:border-slate-800 dark:bg-slate-900"
          style={{ left: actionMenu.left, top: actionMenu.top }}
        >
          {[
            { label: "Open profile", href: `/employees/${actionMenu.employee.id}`, icon: UserRound },
            { label: "Edit employee", href: `/employees/${actionMenu.employee.id}/edit`, icon: Edit3 },
            { label: "View pay stubs", href: `/employees/${actionMenu.employee.id}/payroll`, icon: WalletCards },
            { label: "Send message", href: `mailto:${actionMenu.employee.email}`, icon: Send },
            { label: "Terminate", href: `/employees/${actionMenu.employee.id}/terminate`, icon: UserX, danger: true },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              role="menuitem"
              className={cx(
                "flex items-center gap-2 rounded-lg px-3 py-2 font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-800",
                item.danger && "text-red-600 dark:text-red-300",
              )}
            >
              <item.icon className={cx("h-4 w-4", item.danger ? "text-red-400" : "text-slate-400")} /> {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );
}

function EmployeesGrid({ employees }: { employees: EmployeeRecord[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {employees.map((employee) => (
        <Link
          key={employee.id}
          href={`/employees/${employee.id}`}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start gap-4">
            <Avatar employee={employee} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="truncate font-bold text-slate-950 dark:text-white">{employeeName(employee)}</h2>
                <StatusBadge status={employee.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">{employee.title}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <span><FieldLabel>Department</FieldLabel><span className="mt-1 block font-semibold">{employee.department}</span></span>
                <span><FieldLabel>Location</FieldLabel><span className="mt-1 block font-semibold">{employee.locationType}</span></span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}

function DirectoryOrgView({ employees }: { employees: EmployeeRecord[] }) {
  const byManager = new Map<string, EmployeeRecord[]>();
  employees.forEach((employee) => {
    const key = employee.managerId || "root";
    byManager.set(key, [...(byManager.get(key) || []), employee]);
  });
  const roots = byManager.get("root") || [];

  return (
    <Card className="overflow-x-auto p-6">
      <div className="flex min-w-[900px] flex-col gap-8">
        {roots.map((root) => (
          <div key={root.id} className="flex flex-col items-center gap-5">
            <OrgMiniNode employee={root} />
            <div className="grid gap-4 md:grid-cols-3">
              {(byManager.get(root.id) || []).map((child) => (
                <div key={child.id} className="flex flex-col items-center gap-4">
                  <OrgMiniNode employee={child} />
                  <div className="grid gap-3">
                    {(byManager.get(child.id) || []).map((leaf) => <OrgMiniNode key={leaf.id} employee={leaf} compact />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function OrgMiniNode({ employee, compact = false }: { employee: EmployeeRecord; compact?: boolean }) {
  return (
    <Link
      href={`/employees/${employee.id}`}
      className={cx(
        "flex items-center gap-3 rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900",
        compact ? "px-3 py-2" : "px-4 py-3",
      )}
    >
      <Avatar employee={employee} size="sm" />
      <span className="text-left">
        <span className="block text-sm font-bold">{employeeName(employee)}</span>
        <span className="text-xs text-slate-500">{employee.title}</span>
      </span>
    </Link>
  );
}

export function AddEmployeeWizardScreen() {
  const query = useHrisModule<NewEmployeeData>("new");
  const action = useHrisAction();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showSsn, setShowSsn] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    preferredName: "",
    pronouns: "",
    personalEmail: "",
    phone: "",
    dateOfBirth: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    title: "",
    department: "Engineering",
    employmentType: "Full-time",
    startDate: "",
    managerId: "1",
    locationType: "Remote",
    officeAddress: "",
    workEmail: "",
    payType: "Salary",
    basePay: "",
    frequency: "per year",
    paySchedule: "Biweekly Salaried",
    effectiveDate: "",
    shares: "",
    vesting: "4-year vest, 1-year cliff",
    ssn: "",
    filingStatus: "Single",
    allowances: "0",
    stateTaxId: "",
    routingNumber: "",
    accountNumber: "",
  });

  if (query.isLoading && !query.data) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const data = query.data.data;

  const setField = (field: keyof typeof form, value: string) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if ((field === "firstName" || field === "lastName") && next.firstName && next.lastName) {
        next.workEmail = `${next.firstName}.${next.lastName}@${data.companyDomain}`.toLowerCase();
      }
      return next;
    });
  };

  const submit = async () => {
    await action.mutateAsync({ action: "employee.invite.create", screen: "new", payload: form });
    setCompleted(true);
  };

  if (completed) {
    return (
      <PageShell title="Employee Invited" description="The employee invite email has been queued. They can set a password and complete self-onboarding.">
        <Card className="p-8 text-center">
          <BadgeCheck className="mx-auto h-12 w-12 text-emerald-500" />
          <h2 className="mt-4 text-xl font-bold">Invite sent to {form.personalEmail}</h2>
          <p className="mt-2 text-sm text-slate-500">Self-onboarding tasks include tax forms, direct deposit, profile setup, and document acknowledgements.</p>
          <div className="mt-6 flex justify-center gap-3">
            <PrimaryButton onClick={() => router.push("/employees")}>Back to directory</PrimaryButton>
            <SecondaryButton onClick={() => { setCompleted(false); setStep(1); }}>Add another</SecondaryButton>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="Add Employee" description="Create an employee profile, configure employment and compensation, then send the self-onboarding invite.">
      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-4">
          {["Personal Info", "Employment Details", "Compensation", "Tax & Banking"].map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index + 1)}
              className={cx(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition",
                step === index + 1 ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10" : "border-slate-200 dark:border-slate-800",
              )}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold dark:bg-slate-900">{index + 1}</span>
              <span className="text-sm font-bold">{label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        {step === 1 ? (
          <FormGrid>
            <InputField label="First name" value={form.firstName} onChange={(value) => setField("firstName", value)} />
            <InputField label="Last name" value={form.lastName} onChange={(value) => setField("lastName", value)} />
            <InputField label="Preferred name" value={form.preferredName} onChange={(value) => setField("preferredName", value)} />
            <InputField label="Pronouns" value={form.pronouns} onChange={(value) => setField("pronouns", value)} />
            <InputField label="Personal email" value={form.personalEmail} onChange={(value) => setField("personalEmail", value)} />
            <InputField label="Phone" value={form.phone} onChange={(value) => setField("phone", value)} />
            <InputField label="Date of birth" type="date" value={form.dateOfBirth} onChange={(value) => setField("dateOfBirth", value)} />
            <InputField label="Street" value={form.street} onChange={(value) => setField("street", value)} />
            <InputField label="City" value={form.city} onChange={(value) => setField("city", value)} />
            <InputField label="State" value={form.state} onChange={(value) => setField("state", value)} />
            <InputField label="Zip" value={form.zip} onChange={(value) => setField("zip", value)} />
          </FormGrid>
        ) : null}

        {step === 2 ? (
          <FormGrid>
            <InputField label="Job title" value={form.title} onChange={(value) => setField("title", value)} />
            <SelectField label="Department" value={form.department} onChange={(value) => setField("department", value)} options={data.departments} />
            <SelectField label="Employment type" value={form.employmentType} onChange={(value) => setField("employmentType", value)} options={["Full-time", "Part-time", "Contractor"]} />
            <InputField label="Start date" type="date" value={form.startDate} onChange={(value) => setField("startDate", value)} />
            <SelectField label="Manager" value={form.managerId} onChange={(value) => setField("managerId", value)} options={data.managers.map((manager) => manager.id)} renderOption={(id) => data.managers.find((manager) => manager.id === id)?.name || id} />
            <SelectField label="Location type" value={form.locationType} onChange={(value) => setField("locationType", value)} options={["Remote", "Hybrid", "Office"]} />
            <SelectField label="Office address" value={form.officeAddress} onChange={(value) => setField("officeAddress", value)} options={["", ...data.locations.map((item) => item.address)]} renderOption={(value) => value || "Remote - no office address"} />
            <InputField label="Work email" value={form.workEmail} onChange={(value) => setField("workEmail", value)} />
          </FormGrid>
        ) : null}

        {step === 3 ? (
          <FormGrid>
            <SelectField label="Pay type" value={form.payType} onChange={(value) => setField("payType", value)} options={["Salary", "Hourly"]} />
            <InputField label="Base pay rate" value={form.basePay} onChange={(value) => setField("basePay", value)} />
            <SelectField label="Frequency" value={form.frequency} onChange={(value) => setField("frequency", value)} options={["per year", "per hour"]} />
            <SelectField label="Pay schedule" value={form.paySchedule} onChange={(value) => setField("paySchedule", value)} options={data.paySchedules} />
            <InputField label="Effective date" type="date" value={form.effectiveDate} onChange={(value) => setField("effectiveDate", value)} />
            <InputField label="Stock option shares" value={form.shares} onChange={(value) => setField("shares", value)} />
            <InputField label="Vesting schedule" value={form.vesting} onChange={(value) => setField("vesting", value)} />
          </FormGrid>
        ) : null}

        {step === 4 ? (
          <FormGrid>
            <label className="grid gap-1">
              <FieldLabel>SSN</FieldLabel>
              <div className="flex h-10 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                  type={showSsn ? "text" : "password"}
                  value={form.ssn}
                  onChange={(event) => setField("ssn", event.target.value)}
                  className="min-w-0 flex-1 bg-white px-3 text-sm dark:bg-slate-900"
                  placeholder="123-45-6789"
                />
                <button type="button" onClick={() => setShowSsn((value) => !value)} className="px-3 text-slate-500"><Eye className="h-4 w-4" /></button>
              </div>
            </label>
            <SelectField label="W-4 filing status" value={form.filingStatus} onChange={(value) => setField("filingStatus", value)} options={["Single", "Married filing jointly", "Married filing separately", "Head of household"]} />
            <InputField label="Allowances" value={form.allowances} onChange={(value) => setField("allowances", value)} />
            <InputField label="State tax ID" value={form.stateTaxId} onChange={(value) => setField("stateTaxId", value)} />
            <InputField label="Routing number" value={form.routingNumber} onChange={(value) => setField("routingNumber", value)} />
            <InputField label="Account number" value={form.accountNumber} onChange={(value) => setField("accountNumber", value)} />
            <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50 p-4 dark:border-blue-400/30 dark:bg-blue-500/10">
              <Landmark className="h-5 w-5 text-blue-600" />
              <p className="mt-2 text-sm font-bold">Plaid Connect</p>
              <p className="text-xs text-slate-500">Connect instantly or enter routing and account details manually.</p>
            </div>
          </FormGrid>
        ) : null}
      </Card>

      <div className="flex justify-between">
        <SecondaryButton onClick={() => setStep((current) => Math.max(1, current - 1))}><ChevronLeft className="h-4 w-4" /> Back</SecondaryButton>
        {step < 4 ? (
          <PrimaryButton onClick={() => setStep((current) => Math.min(4, current + 1))}>Continue <ArrowRight className="h-4 w-4" /></PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => void submit()} disabled={action.isPending}><Mail className="h-4 w-4" /> Send invite email</PrimaryButton>
        )}
      </div>
    </PageShell>
  );
}

function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-1">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  renderOption,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  renderOption?: (value: string) => string;
}) {
  return (
    <label className="grid gap-1">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
      >
        {options.map((option) => (
          <option key={option} value={option}>{renderOption ? renderOption(option) : option}</option>
        ))}
      </select>
    </label>
  );
}

export function EmployeeProfileShell({
  employeeId,
  children,
}: {
  employeeId: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const query = useHrisModule<ProfileData>("profile", employeeId);
  const [actionsOpen, setActionsOpen] = useState(false);

  if (query.isLoading && !query.data) return <LoadingState title="Loading employee profile" />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;

  const employee = query.data.data.employee;
  const base = `/employees/${employee.id}`;

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-6">
      <Link href="/employees" className="inline-flex w-fit items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-950 dark:hover:text-white">
        <ChevronLeft className="h-4 w-4" /> Back to directory
      </Link>
      <Card className="overflow-visible">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-blue-50 to-emerald-50 px-6 py-6 dark:border-slate-800 dark:from-slate-900 dark:via-blue-950/30 dark:to-emerald-950/20">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar employee={employee} size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{employeeName(employee)}</h1>
                  <StatusBadge status={employee.status} />
                </div>
                <p className="mt-1 text-base font-semibold text-slate-600 dark:text-slate-300">{employee.title}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white px-3 py-1 text-blue-700 ring-1 ring-blue-100 dark:bg-slate-900 dark:ring-slate-700">{employee.department}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">{employee.location}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">{employee.employmentType}</span>
                </div>
              </div>
            </div>
            <div className="relative flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActionsOpen((value) => !value)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
              >
                Actions <MoreHorizontal className="h-4 w-4" />
              </button>
              {actionsOpen ? (
                <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  {[
                    { label: "Edit", href: `/employees/${employee.id}/edit`, icon: Edit3 },
                    { label: "Terminate", href: `/employees/${employee.id}/terminate`, icon: UserX },
                    { label: "View Pay Stubs", href: `/employees/${employee.id}/payroll`, icon: WalletCards },
                    { label: "Send Message", href: `mailto:${employee.email}`, icon: Send },
                  ].map((item) => (
                    <Link key={item.label} href={item.href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                      <item.icon className="h-4 w-4 text-slate-400" /> {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto border-b border-slate-200 px-4 dark:border-slate-800">
          <div className="flex gap-2">
            {tabConfig.map((tab) => {
              const href = tab.segment ? `${base}/${tab.segment}` : base;
              const active = pathname === href;
              return (
                <Link
                  key={tab.label}
                  href={href}
                  className={cx(
                    "whitespace-nowrap border-b-2 px-3 py-4 text-sm font-bold transition",
                    active ? "border-blue-600 text-blue-700 dark:text-blue-300" : "border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-white",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </Card>
      {children}
    </div>
  );
}

export function EmployeeOverviewScreen({ employeeId }: { employeeId: string }) {
  const query = useHrisModule<ProfileData>("profile", employeeId);
  const action = useHrisAction();
  const [editing, setEditing] = useState<string | null>(null);

  if (query.isLoading && !query.data) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const { employee, manager, directReports, keyDates } = query.data.data;

  const fields = [
    ["Preferred name", employee.preferredName],
    ["Pronouns", employee.pronouns || "Not set"],
    ["Personal email", employee.personalEmail],
    ["Phone", employee.phone],
    ["Address", `${employee.address.street}, ${employee.address.city}, ${employee.address.state} ${employee.address.zip}`],
    ["Title", employee.title],
    ["Department", employee.department],
    ["Employment type", employee.employmentType],
    ["Start date", shortDate(employee.startDate)],
    ["Manager", employee.manager],
    ["Location", employee.location],
    ["Work email", employee.email],
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="p-5">
        <h2 className="font-bold text-slate-950 dark:text-white">Personal and employment information</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {fields.map(([label, value]) => (
            <button
              key={label}
              type="button"
              onClick={() => setEditing(label)}
              className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-blue-300 dark:border-slate-800"
            >
              <FieldLabel>{label}</FieldLabel>
              {editing === label ? (
                <input
                  autoFocus
                  defaultValue={value}
                  onBlur={(event) => {
                    setEditing(null);
                    action.mutate({ action: "employee.field.update", screen: "profile", payload: { employeeId, label, value: event.target.value } });
                  }}
                  className="mt-2 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              ) : (
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
              )}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="p-5">
          <h2 className="font-bold">Org mini-chart</h2>
          <div className="mt-4 space-y-3">
            {manager ? <OrgMiniNode employee={manager} compact /> : <p className="text-sm text-slate-500">No manager assigned.</p>}
            <div className="pl-5">
              <OrgMiniNode employee={employee} compact />
            </div>
            <div className="space-y-2 pl-10">
              <p className="text-xs font-bold text-slate-500">Direct Reports</p>
              {directReports.map((report) => <OrgMiniNode key={report.id} employee={report} compact />)}
              {directReports.length === 0 ? <p className="text-sm text-slate-500">No direct reports.</p> : null}
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Key dates</h2>
          <div className="mt-4 space-y-3">
            {keyDates.map((date) => (
              <div key={date.label} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{date.label}</p>
                <p className="mt-1 font-bold">{shortDate(date.date)}</p>
                <p className="text-xs text-slate-500">{date.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function EmployeeCompensationScreen({ employeeId }: { employeeId: string }) {
  const query = useHrisModule<CompensationData>("compensation", employeeId);
  const action = useHrisAction();
  const [modalOpen, setModalOpen] = useState(false);

  if (query.isLoading && !query.data) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const data = query.data.data;
  const range = data.payBand.max - data.payBand.min;
  const position = Math.min(100, Math.max(0, ((data.payBand.employeeRate - data.payBand.min) / range) * 100));

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="p-5">
          <h2 className="font-bold">Current rate</h2>
          <p className="mt-4 text-3xl font-bold">{data.current.payType === "Hourly" ? `${money(data.current.rate)}/hr` : money(data.current.rate)}</p>
          <div className="mt-4 space-y-2 text-sm">
            <p><span className="text-slate-500">Pay type:</span> <span className="font-semibold">{data.current.payType}</span></p>
            <p><span className="text-slate-500">Effective:</span> <span className="font-semibold">{data.current.effectiveDate}</span></p>
            <p><span className="text-slate-500">Schedule:</span> <span className="font-semibold">{data.current.paySchedule}</span></p>
          </div>
          <PrimaryButton onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Request Change</PrimaryButton>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Pay band indicator</h2>
          <div className="mt-8">
            <div className="relative h-4 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-blue-500" style={{ width: "100%" }} />
              <div className="absolute top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-slate-950 dark:bg-white" style={{ left: `${position}%` }} />
            </div>
            <div className="mt-3 flex justify-between text-xs font-bold text-slate-500">
              <span>{money(data.payBand.min)}</span>
              <span>{money(data.payBand.midpoint)}</span>
              <span>{money(data.payBand.max)}</span>
            </div>
          </div>
        </Card>
      </section>
      <Card className="p-5">
        <h2 className="font-bold">Compensation history</h2>
        <div className="mt-5 space-y-4">
          {data.history.map((event) => (
            <div key={event.id} className="border-l-2 border-blue-200 pl-4">
              <p className="font-bold">{money(event.oldRate)} to {money(event.newRate)}</p>
              <p className="text-sm text-slate-500">{event.effectiveDate} - {event.changedBy} - {event.reason}</p>
            </div>
          ))}
        </div>
      </Card>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request compensation change</DialogTitle><DialogDescription>Requires approver review before payroll sync.</DialogDescription></DialogHeader>
          <div className="grid gap-3 p-6">
            <InputField label="New rate" value="" onChange={() => undefined} />
            <InputField label="Effective date" type="date" value="" onChange={() => undefined} />
            <InputField label="Change reason" value="" onChange={() => undefined} />
          </div>
          <DialogFooter><PrimaryButton onClick={() => { action.mutate({ action: "employee.compensation.request", screen: "compensation" }); setModalOpen(false); }}>Submit request</PrimaryButton></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function EmployeeDocumentsScreen({ employeeId }: { employeeId: string }) {
  const query = useHrisModule<DocumentData>("documents", employeeId);
  const action = useHrisAction();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (query.isLoading && !query.data) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const data = query.data.data;

  return (
    <div className="grid gap-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-bold">I-9 verification</h2><p className="text-sm text-slate-500">Dedicated employment eligibility tracking.</p></div>
          <PrimaryButton onClick={() => action.mutate({ action: "employee.i9.reverify", screen: "documents" })}><ShieldCheck className="h-4 w-4" /> Re-verify</PrimaryButton>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["Section 1", data.i9.section1],
            ["Section 2", data.i9.section2],
            ["Re-verify date", data.i9.reverifyDate],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
              <FieldLabel>{label}</FieldLabel>
              <p className="mt-1 font-bold">{value}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="font-bold">Documents</h2>
          <PrimaryButton onClick={() => setDrawerOpen(true)}><Upload className="h-4 w-4" /> Upload Document</PrimaryButton>
        </div>
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr>{["Type", "Filename", "Uploaded", "Expiry", "Status", "Actions"].map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.documents.map((document) => (
              <tr key={document.id}>
                <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold dark:bg-slate-800">{document.type}</span></td>
                <td className="px-5 py-4 font-semibold">{document.filename}</td>
                <td className="px-5 py-4">{document.uploadedAt}</td>
                <td className="px-5 py-4">{document.expiresAt || "-"}</td>
                <td className="px-5 py-4"><StatusBadge status={document.status} /></td>
                <td className="px-5 py-4"><div className="flex gap-2"><button className="font-bold text-blue-700">Download</button><button className="font-bold text-red-600">Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="flex max-w-[480px] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold">Upload Drawer</h2>
              <p className="mt-1 text-sm text-slate-500">Files are stored in the secure employee document vault.</p>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Close upload drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid flex-1 gap-4 overflow-y-auto p-6">
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <Upload className="mx-auto h-8 w-8 text-blue-600" />
              <p className="mt-3 font-bold">Drag and drop or click to browse</p>
              <p className="text-sm text-slate-500">Upload to S3 with category metadata and optional expiry date.</p>
            </div>
            <SelectField label="Category" value="I-9" onChange={() => undefined} options={["I-9", "W-4", "Offer Letter", "NDA", "Performance Review", "Other"]} />
            <InputField label="Expiry date" type="date" value="" onChange={() => undefined} />
          </div>
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-800">
            <SecondaryButton onClick={() => setDrawerOpen(false)}><X className="h-4 w-4" /> Cancel</SecondaryButton>
            <PrimaryButton onClick={() => { action.mutate({ action: "employee.document.upload", screen: "documents" }); setDrawerOpen(false); }}>
              <Upload className="h-4 w-4" /> Upload document
            </PrimaryButton>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function EmployeeActivityScreen({ employeeId }: { employeeId: string }) {
  const query = useHrisModule<ActivityData>("activity", employeeId);
  const [type, setType] = useState("All");

  if (query.isLoading && !query.data) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const events = query.data.data.events.filter((event) => type === "All" || event.type === type);
  const types = ["All", ...Array.from(new Set(query.data.data.events.map((event) => event.type)))];

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-bold">Audit Log</h2><p className="text-sm text-slate-500">Timeline of profile, payroll, document, and employment changes.</p></div>
        <div className="flex gap-2">
          <SelectControl label="Change type" value={type} onChange={setType} options={types} />
          <SecondaryButton onClick={() => downloadCsv("employee-activity.csv", [["Date", "Actor", "Field", "Old", "New"], ...events.map((event) => [event.date, event.actor, event.field, event.oldValue, event.newValue])])}><Download className="h-4 w-4" /> Export CSV</SecondaryButton>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {events.map((event) => (
          <div key={event.id} className="border-l-2 border-blue-200 pl-4">
            <p className="font-bold">{event.field}: {event.oldValue} to {event.newValue}</p>
            <p className="text-sm text-slate-500">{event.date} - {event.actor} - {event.type}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function BulkImportScreen() {
  const query = useHrisModule<BulkImportData>("bulk");
  const action = useHrisAction();
  const [step, setStep] = useState(1);

  if (query.isLoading && !query.data) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const data = query.data.data;

  return (
    <PageShell title="Bulk CSV Import" description="Download a template, upload employee data, map fields, validate rows, and commit the import with rollback support.">
      <Card className="p-5">
        <div className="grid gap-2 md:grid-cols-5">
          {["Template", "Upload", "Field mapping", "Validation preview", "Commit import"].map((label, index) => (
            <button key={label} onClick={() => setStep(index + 1)} className={cx("rounded-lg px-3 py-2 text-sm font-bold", step === index + 1 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800")}>Step {index + 1}: {label}</button>
          ))}
        </div>
      </Card>
      {step === 1 ? <TemplateStep data={data} /> : null}
      {step === 2 ? <UploadStep /> : null}
      {step === 3 ? <MappingStep data={data} /> : null}
      {step === 4 ? <ValidationStep data={data} /> : null}
      {step === 5 ? (
        <Card className="p-6">
          <h2 className="font-bold">Commit import</h2>
          <p className="mt-2 text-sm text-slate-500">Ready to import {data.lastImport.rows} rows. Errors must be resolved before final commit.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryButton onClick={() => action.mutate({ action: "employee.bulk.commit", screen: "bulk" })}><Check className="h-4 w-4" /> Commit import</PrimaryButton>
            <SecondaryButton onClick={() => action.mutate({ action: "employee.bulk.rollback", screen: "bulk" })}><X className="h-4 w-4" /> Rollback last import</SecondaryButton>
          </div>
        </Card>
      ) : null}
    </PageShell>
  );
}

function TemplateStep({ data }: { data: BulkImportData }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold">Template CSV and field guide</h2>
        <SecondaryButton onClick={() => downloadCsv("employee-import-template.csv", [data.templateFields.map((field) => field.field)])}><Download className="h-4 w-4" /> Download template</SecondaryButton>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {data.templateFields.map((field) => (
          <div key={field.field} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <p className="font-bold">{field.field} {field.required ? <span className="text-red-500">*</span> : null}</p>
            <p className="text-sm text-slate-500">{field.notes}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function UploadStep() {
  return (
    <Card className="p-8 text-center">
      <Upload className="mx-auto h-10 w-10 text-blue-600" />
      <h2 className="mt-3 font-bold">Upload employee CSV</h2>
      <p className="mt-1 text-sm text-slate-500">Drag and drop a CSV file or click to browse. Large files validate in the background.</p>
    </Card>
  );
}

function MappingStep({ data }: { data: BulkImportData }) {
  return (
    <Card className="p-5">
      <h2 className="font-bold">Field mapping</h2>
      <div className="mt-4 space-y-2">
        {data.mappedFields.map((field) => (
          <div key={field.column} className="grid gap-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800 md:grid-cols-3">
            <span className="font-bold">{field.column}</span>
            <span>{field.field}</span>
            <StatusBadge status={field.confidence === "Needs review" ? "Warning" : "Valid"} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ValidationStep({ data }: { data: BulkImportData }) {
  return (
    <Card className="p-5">
      <h2 className="font-bold">Validation preview</h2>
      <div className="mt-4 space-y-2">
        {data.validationRows.map((row) => (
          <div key={`${row.row}-${row.field}`} className="grid gap-3 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800 md:grid-cols-5">
            <span className="font-bold">Row {row.row}</span>
            <span>{row.employee}</span>
            <span>{row.field}</span>
            <span>{row.issue}</span>
            <StatusBadge status={row.severity} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function OrgChartScreen() {
  const query = useHrisModule<OrgChartData>("org-chart");
  const [department, setDepartment] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);

  if (query.isLoading && !query.data) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;

  const data = query.data.data;
  const visibleEmployees = department === "All" ? data.employees : data.employees.filter((employee) => employee.department === department);
  const nodes: Array<Node<{ employee: EmployeeRecord }>> = visibleEmployees.map((employee, index) => {
    const depth = employee.managerId ? (data.employees.find((candidate) => candidate.id === employee.managerId)?.managerId ? 2 : 1) : 0;
    return {
      id: employee.id,
      type: "default",
      position: { x: depth * 320, y: index * 110 },
      data: { employee, label: <FlowNode employee={employee} /> },
      style: {
        border: department !== "All" ? "2px solid #2563eb" : "1px solid #cbd5e1",
        borderRadius: 12,
        width: 250,
        padding: 0,
        background: "white",
      },
    };
  });
  const edges: Edge[] = visibleEmployees
    .filter((employee) => employee.managerId && visibleEmployees.some((candidate) => candidate.id === employee.managerId))
    .map((employee) => ({
      id: `${employee.managerId}-${employee.id}`,
      source: employee.managerId || "",
      target: employee.id,
      animated: department !== "All",
    }));

  return (
    <PageShell
      title="Org Chart"
      description="Zoom, pan, filter by department, inspect employee profiles, and export a point-in-time org snapshot."
      actions={
        <>
          <SelectControl label="Department" value={department} onChange={setDepartment} options={["All", ...data.departments]} />
          <SecondaryButton onClick={() => downloadCsv("org-chart-export.csv", [["Name", "Title", "Department", "Manager"], ...visibleEmployees.map((employee) => [employeeName(employee), employee.title, employee.department, employee.manager])])}><Download className="h-4 w-4" /> Export PNG</SecondaryButton>
          <SecondaryButton><FileText className="h-4 w-4" /> Export PDF</SecondaryButton>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="h-[680px] overflow-hidden">
          <ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={(_event, node) => setSelectedEmployee(node.data.employee)}>
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </Card>
        <Card className="p-5">
          {selectedEmployee ? (
            <div>
              <Avatar employee={selectedEmployee} size="lg" />
              <h2 className="mt-4 text-xl font-bold">{employeeName(selectedEmployee)}</h2>
              <p className="text-sm text-slate-500">{selectedEmployee.title}</p>
              <div className="mt-5 space-y-3 text-sm">
                <p><FieldLabel>Department</FieldLabel><span className="mt-1 block font-semibold">{selectedEmployee.department}</span></p>
                <p><FieldLabel>Manager</FieldLabel><span className="mt-1 block font-semibold">{selectedEmployee.manager}</span></p>
                <p><FieldLabel>Direct reports</FieldLabel><span className="mt-1 block font-semibold">{selectedEmployee.directReports.length}</span></p>
              </div>
              <Link href={`/employees/${selectedEmployee.id}`} className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white">
                Open profile <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-slate-500">
              <Users className="h-10 w-10" />
              <p className="mt-3 text-sm font-semibold">Click an employee node to open the profile drawer.</p>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}

function FlowNode({ employee }: { employee: EmployeeRecord }) {
  return (
    <div className="flex items-center gap-3 p-3 text-left">
      <Avatar employee={employee} size="sm" />
      <span>
        <span className="block text-sm font-bold text-slate-950">{employeeName(employee)}</span>
        <span className="text-xs text-slate-500">{employee.title}</span>
      </span>
    </div>
  );
}

export function EmployeeBenefitsScreen({ employeeId }: { employeeId: string }) {
  const query = useHrisModule<BenefitsTabData>("benefits", employeeId);
  if (query.isLoading && !query.data) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const data = query.data.data;
  return (
    <div className="grid gap-6">
      <Card className="p-5"><h2 className="font-bold">Open enrollment</h2><p className="mt-2 text-2xl font-bold">{data.openEnrollment}</p></Card>
      <section className="grid gap-4 md:grid-cols-3">
        {data.enrollments.map((enrollment) => (
          <Card key={enrollment.plan} className="p-5">
            <h2 className="font-bold">{enrollment.plan}</h2>
            <p className="mt-1 text-sm text-slate-500">{enrollment.coverage}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <p><FieldLabel>Employee</FieldLabel><span className="block font-bold">{money(enrollment.employeeCost)}</span></p>
              <p><FieldLabel>Employer</FieldLabel><span className="block font-bold">{money(enrollment.employerCost)}</span></p>
            </div>
            <div className="mt-4"><StatusBadge status={enrollment.status === "Active" ? "Active" : "Valid"} /></div>
          </Card>
        ))}
      </section>
    </div>
  );
}

export function EmployeeTimeScreen({ employeeId }: { employeeId: string }) {
  const query = useHrisModule<TimeTabData>("time", employeeId);
  if (query.isLoading && !query.data) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const data = query.data.data;
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["PTO balance", `${data.pto.balance} hrs`],
          ["Used YTD", `${data.pto.used} hrs`],
          ["Scheduled", `${data.pto.scheduled} hrs`],
        ].map(([label, value]) => <Card key={label} className="p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></Card>)}
      </section>
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h2 className="font-bold">Recent timesheets</h2></div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr>{["Period", "Regular", "Overtime", "Status"].map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{data.recentTimesheets.map((sheet) => <tr key={sheet.period}><td className="px-5 py-4 font-bold">{sheet.period}</td><td className="px-5 py-4">{sheet.regularHours}</td><td className="px-5 py-4">{sheet.overtimeHours}</td><td className="px-5 py-4"><StatusBadge status="Valid" /></td></tr>)}</tbody>
        </table>
      </Card>
    </div>
  );
}

export function EmployeePayrollScreen({ employeeId }: { employeeId: string }) {
  const query = useHrisModule<PayrollTabData>("payroll", employeeId);
  if (query.isLoading && !query.data) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const data = query.data.data;
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        {[["YTD Gross", data.ytdGross], ["YTD Taxes", data.ytdTaxes], ["YTD Net", data.ytdNet]].map(([label, value]) => <Card key={label} className="p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{money(Number(value))}</p></Card>)}
      </section>
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h2 className="font-bold">Pay stubs</h2></div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr>{["Date", "Gross", "Net", "Status", "Download"].map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{data.paystubs.map((stub) => <tr key={stub.id}><td className="px-5 py-4 font-bold">{stub.date}</td><td className="px-5 py-4">{money(stub.gross)}</td><td className="px-5 py-4">{money(stub.net)}</td><td className="px-5 py-4"><StatusBadge status="Valid" /></td><td className="px-5 py-4"><button className="font-bold text-blue-700">PDF</button></td></tr>)}</tbody>
        </table>
      </Card>
    </div>
  );
}

export function EmployeePerformanceScreen({ employeeId }: { employeeId: string }) {
  const query = useHrisModule<PerformanceTabData>("performance", employeeId);
  if (query.isLoading && !query.data) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const data = query.data.data;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <h2 className="font-bold">Reviews</h2>
        <div className="mt-4 space-y-3">{data.reviews.map((review) => <div key={review.cycle} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><p className="font-bold">{review.cycle}</p><p className="text-sm text-slate-500">{review.rating} - {review.reviewer} - {review.completedAt}</p></div>)}</div>
      </Card>
      <Card className="p-5">
        <h2 className="font-bold">Goals</h2>
        <div className="mt-4 space-y-4">{data.goals.map((goal) => <div key={goal.title}><div className="flex justify-between text-sm"><span className="font-bold">{goal.title}</span><span>{goal.progress}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-600" style={{ width: `${goal.progress}%` }} /></div></div>)}</div>
      </Card>
    </div>
  );
}

type EmployeeEditForm = {
  firstName: string;
  lastName: string;
  preferredName: string;
  pronouns: string;
  personalEmail: string;
  phone: string;
  dateOfBirth: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  title: string;
  department: string;
  employmentType: EmployeeRecord["employmentType"];
  status: EmployeeStatus;
  payType: EmployeeRecord["payType"];
  salary: string;
  hourlyRate: string;
  paySchedule: string;
  locationType: EmployeeRecord["locationType"];
  officeAddress: string;
  managerName: string;
  ssnMasked: string;
  filingStatus: string;
  stateTaxId: string;
  bankAccount: string;
};

const departmentOptions = ["Executive", "Engineering", "Payroll", "People", "Finance", "Sales", "Marketing", "Design"];
const statusOptions: EmployeeStatus[] = ["Active", "Inactive", "On Leave", "Onboarding", "Terminated"];

function buildEditForm(employee?: EmployeeRecord): EmployeeEditForm {
  return {
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    preferredName: employee?.preferredName || "",
    pronouns: employee?.pronouns || "",
    personalEmail: employee?.personalEmail || "",
    phone: employee?.phone || "",
    dateOfBirth: employee?.dateOfBirth || "",
    street: employee?.address.street || "",
    city: employee?.address.city || "",
    state: employee?.address.state || "",
    zip: employee?.address.zip || "",
    title: employee?.title || "",
    department: employee?.department || "People",
    employmentType: employee?.employmentType || "Full-time",
    status: employee?.status || "Active",
    payType: employee?.payType || "Salary",
    salary: employee ? String(employee.salary) : "",
    hourlyRate: employee?.hourlyRate ? String(employee.hourlyRate) : "",
    paySchedule: employee?.paySchedule || "Biweekly Salaried",
    locationType: employee?.locationType || "Remote",
    officeAddress: employee?.officeAddress || "",
    managerName: employee?.manager || "",
    ssnMasked: employee?.ssnMasked || "",
    filingStatus: employee?.filingStatus || "Single",
    stateTaxId: employee?.stateTaxId || "",
    bankAccount: employee?.bankAccount || "",
  };
}

export function EmployeeEditScreen({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const query = useHrisModule<ProfileData>("profile", employeeId);
  const action = useHrisAction();
  const [form, setForm] = useState<EmployeeEditForm>(() => buildEditForm());
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (query.data?.data.employee) {
      setForm(buildEditForm(query.data.data.employee));
    }
  }, [query.data]);

  if (query.isLoading && !query.data) return <LoadingState title="Loading employee editor" />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;

  const { employee, directReports } = query.data.data;
  const setField = <Field extends keyof EmployeeEditForm>(field: Field, value: EmployeeEditForm[Field]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSavedAt(null);
  };
  const submit = async () => {
    await action.mutateAsync({
      action: "employee.profile.update",
      screen: "profile",
      payload: { employeeId, form },
    });
    setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6">
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                <Edit3 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold">Edit Employee</h2>
                <p className="mt-1 text-sm text-slate-500">Update profile, employment, compensation, tax, and banking details for {employeeName(employee)}.</p>
              </div>
            </div>
            <StatusBadge status={employee.status} />
          </div>
        </Card>

        {savedAt ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            Employee changes saved at {savedAt}.
          </div>
        ) : null}

        <Card className="p-5">
          <div className="mb-5 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold">Personal Info</h2>
          </div>
          <FormGrid>
            <InputField label="First name" value={form.firstName} onChange={(value) => setField("firstName", value)} />
            <InputField label="Last name" value={form.lastName} onChange={(value) => setField("lastName", value)} />
            <InputField label="Preferred name" value={form.preferredName} onChange={(value) => setField("preferredName", value)} />
            <InputField label="Pronouns" value={form.pronouns} onChange={(value) => setField("pronouns", value)} />
            <InputField label="Personal email" value={form.personalEmail} onChange={(value) => setField("personalEmail", value)} />
            <InputField label="Phone" value={form.phone} onChange={(value) => setField("phone", value)} />
            <InputField label="Date of birth" type="date" value={form.dateOfBirth} onChange={(value) => setField("dateOfBirth", value)} />
            <InputField label="Street" value={form.street} onChange={(value) => setField("street", value)} />
            <InputField label="City" value={form.city} onChange={(value) => setField("city", value)} />
            <InputField label="State" value={form.state} onChange={(value) => setField("state", value)} />
            <InputField label="Zip" value={form.zip} onChange={(value) => setField("zip", value)} />
          </FormGrid>
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold">Employment Details</h2>
          </div>
          <FormGrid>
            <InputField label="Job title" value={form.title} onChange={(value) => setField("title", value)} />
            <SelectField label="Department" value={form.department} onChange={(value) => setField("department", value)} options={departmentOptions} />
            <SelectField label="Employment type" value={form.employmentType} onChange={(value) => setField("employmentType", value as EmployeeEditForm["employmentType"])} options={["Full-time", "Part-time", "Contractor"]} />
            <SelectField label="Status" value={form.status} onChange={(value) => setField("status", value as EmployeeStatus)} options={statusOptions} />
            <SelectField label="Location type" value={form.locationType} onChange={(value) => setField("locationType", value as EmployeeEditForm["locationType"])} options={["Remote", "Hybrid", "Office"]} />
            <InputField label="Office address" value={form.officeAddress} onChange={(value) => setField("officeAddress", value)} />
            <InputField label="Manager" value={form.managerName} onChange={(value) => setField("managerName", value)} />
          </FormGrid>
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex items-center gap-2">
            <Banknote className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold">Compensation</h2>
          </div>
          <FormGrid>
            <SelectField label="Pay type" value={form.payType} onChange={(value) => setField("payType", value as EmployeeEditForm["payType"])} options={["Salary", "Hourly"]} />
            <InputField label="Annual salary" value={form.salary} onChange={(value) => setField("salary", value)} />
            <InputField label="Hourly rate" value={form.hourlyRate} onChange={(value) => setField("hourlyRate", value)} />
            <InputField label="Pay schedule" value={form.paySchedule} onChange={(value) => setField("paySchedule", value)} />
          </FormGrid>
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold">Tax & Banking</h2>
          </div>
          <FormGrid>
            <InputField label="SSN" value={form.ssnMasked} onChange={(value) => setField("ssnMasked", value)} />
            <SelectField label="W-4 filing status" value={form.filingStatus} onChange={(value) => setField("filingStatus", value)} options={["Single", "Married filing jointly", "Married filing separately", "Head of household"]} />
            <InputField label="State tax ID" value={form.stateTaxId} onChange={(value) => setField("stateTaxId", value)} />
            <InputField label="Bank account" value={form.bankAccount} onChange={(value) => setField("bankAccount", value)} />
          </FormGrid>
        </Card>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:-mx-6 sm:px-6">
          <div className="flex flex-wrap justify-end gap-3">
            <SecondaryButton onClick={() => router.push(`/employees/${employeeId}`)}><X className="h-4 w-4" /> Cancel</SecondaryButton>
            <PrimaryButton onClick={() => void submit()} disabled={action.isPending}>
              {action.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Changes
            </PrimaryButton>
          </div>
        </div>
      </div>

      <aside className="grid h-fit gap-4">
        <Card className="p-5">
          <Avatar employee={employee} size="lg" />
          <h2 className="mt-4 text-xl font-bold">{employeeName(employee)}</h2>
          <p className="text-sm text-slate-500">{employee.title}</p>
          <div className="mt-4"><StatusBadge status={employee.status} /></div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Profile Summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            <p><FieldLabel>Work email</FieldLabel><span className="mt-1 block font-semibold">{employee.email}</span></p>
            <p><FieldLabel>Direct reports</FieldLabel><span className="mt-1 block font-semibold">{directReports.length}</span></p>
            <p><FieldLabel>Start date</FieldLabel><span className="mt-1 block font-semibold">{shortDate(employee.startDate)}</span></p>
          </div>
        </Card>
      </aside>
    </div>
  );
}

export function EmployeeTerminateScreen({ employeeId }: { employeeId: string }) {
  const query = useHrisModule<ProfileData>("profile", employeeId);
  const action = useHrisAction();
  const [terminationDate, setTerminationDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [terminationType, setTerminationType] = useState("Involuntary");
  const [workState, setWorkState] = useState("CA");
  const [confirmation, setConfirmation] = useState("");
  const [completed, setCompleted] = useState(false);

  if (query.isLoading && !query.data) return <LoadingState title="Loading termination workflow" />;
  if (query.isError || !query.data) return <ErrorState error={query.error} retry={() => void query.refetch()} />;

  const employee = query.data.data.employee;
  const name = employeeName(employee);
  const canSubmit = confirmation.trim().toLowerCase() === name.toLowerCase();
  const submit = async () => {
    await action.mutateAsync({
      action: "employee.termination.cascade",
      screen: "profile",
      payload: { employeeId, terminationDate, terminationType, workState },
    });
    setCompleted(true);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                <UserX className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold">Terminate Employee</h2>
                <p className="mt-1 text-sm text-slate-500">Run final pay, benefits, access, and offboarding updates for {name}.</p>
              </div>
            </div>
          </div>
          {completed ? <StatusBadge status="Terminated" /> : <StatusBadge status={employee.status} />}
        </div>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-100">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">This action affects payroll, PTO, benefits, access, documents, and offboarding tasks.</p>
              <p className="mt-1 opacity-80">Review the cascade summary before confirming. The demo workflow records the event without changing source data.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <p className="md:col-span-3 text-sm text-slate-500">Termination date, type, and work state drive final pay, benefits, and access tasks.</p>
          <InputField label="Termination date" type="date" value={terminationDate} onChange={setTerminationDate} />
          <SelectField label="Termination type" value={terminationType} onChange={setTerminationType} options={["Voluntary", "Involuntary", "Layoff", "Mutual agreement", "Other"]} />
          <SelectField label="Work state" value={workState} onChange={setWorkState} options={["CA", "CO", "IL", "MA", "NY", "TX", "WA"]} />
        </div>

        <label className="mt-6 grid gap-2">
          <FieldLabel>Type employee name to confirm termination</FieldLabel>
          <input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={name}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/employees/${employeeId}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <ChevronLeft className="h-4 w-4" /> Back to profile
          </Link>
          <PrimaryButton onClick={() => void submit()} disabled={!canSubmit || action.isPending || completed}>
            {action.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
            {completed ? "Termination Recorded" : "Create termination workflow"}
          </PrimaryButton>
        </div>
      </Card>

      <aside className="grid h-fit gap-4">
        <Card className="p-5">
          <h2 className="font-bold">Cascade Summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            {[
              ["Final pay date", terminationDate],
              ["PTO payout", money(2840)],
              ["Benefits end", "End of month"],
              ["COBRA notice", "Due within 14 days"],
              ["Access revocation", completed ? "Queued" : "Ready"],
              ["Offboarding tasks", completed ? "8 created" : "8 planned"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                <span className="text-slate-500">{label}</span>
                <span className="font-bold">{value}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Employee Snapshot</h2>
          <div className="mt-4 flex items-center gap-3">
            <Avatar employee={employee} size="sm" />
            <div>
              <p className="font-bold">{name}</p>
              <p className="text-xs text-slate-500">{employee.title}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <p><FieldLabel>Department</FieldLabel><span className="mt-1 block font-semibold">{employee.department}</span></p>
            <p><FieldLabel>Manager</FieldLabel><span className="mt-1 block font-semibold">{employee.manager}</span></p>
          </div>
        </Card>
      </aside>
    </div>
  );
}
