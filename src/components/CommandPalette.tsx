"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ElementType } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CornerDownLeft,
  File,
  FileText,
  LayoutDashboard,
  Loader2,
  PlayCircle,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { usePlatformStore } from "@/store/usePlatformStore";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  employees as hrisEmployees,
  getEmployeeName,
} from "@/lib/hris-module-data";

type SearchGroup =
  | "EMPLOYEES"
  | "RECENT PAYROLL RUNS"
  | "REPORTS"
  | "PAGES"
  | "ACTIONS"
  | "DOCUMENTS"
  | "RECENT"
  | "QUICK ACTIONS";

interface SearchResult {
  type: SearchGroup;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  url: string;
}

const GROUP_ORDER: SearchGroup[] = [
  "EMPLOYEES",
  "RECENT PAYROLL RUNS",
  "REPORTS",
  "PAGES",
  "ACTIONS",
  "DOCUMENTS",
];

const DEFAULT_RECENTS: SearchResult[] = [
  {
    type: "RECENT",
    id: "recent_emp_maya",
    title: getEmployeeName(hrisEmployees[0]),
    subtitle: `${hrisEmployees[0].title} · ${hrisEmployees[0].department}`,
    icon: "User",
    url: `/employees/${hrisEmployees[0].id}`,
  },
  {
    type: "RECENT",
    id: "recent_report_headcount",
    title: "Headcount Summary",
    subtitle: "Report · HRIS",
    icon: "FileText",
    url: "/reports/viewer/rpt-13",
  },
  {
    type: "RECENT",
    id: "recent_payroll_may",
    title: "May 1-15 Payroll",
    subtitle: "Payroll Run · Paid",
    icon: "ReceiptText",
    url: "/payroll/run/pr-2026-0515",
  },
  {
    type: "RECENT",
    id: "recent_settings",
    title: "Payroll Settings",
    subtitle: "Settings · Payroll",
    icon: "Settings",
    url: "/payroll/settings",
  },
  {
    type: "RECENT",
    id: "recent_report_tax",
    title: "Tax Liability",
    subtitle: "Report · Payroll",
    icon: "FileText",
    url: "/reports/viewer/rpt-3",
  },
];

const QUICK_ACTIONS: SearchResult[] = [
  {
    type: "QUICK ACTIONS",
    id: "action_run_payroll",
    title: "Run Payroll",
    subtitle: "Start a new payroll run",
    icon: "PlayCircle",
    url: "/payroll/run",
  },
  {
    type: "QUICK ACTIONS",
    id: "action_add_employee",
    title: "Add Employee",
    subtitle: "Create a new employee profile",
    icon: "UserPlus",
    url: "/employees/new",
  },
  {
    type: "QUICK ACTIONS",
    id: "action_create_job",
    title: "Create Job",
    subtitle: "Open the ATS job wizard",
    icon: "BriefcaseBusiness",
    url: "/hiring/jobs/new",
  },
  {
    type: "QUICK ACTIONS",
    id: "action_compliance",
    title: "Open Compliance",
    subtitle: "Review filings, alerts, and audit readiness",
    icon: "ShieldCheck",
    url: "/compliance",
  },
  {
    type: "QUICK ACTIONS",
    id: "action_reports",
    title: "View Reports",
    subtitle: "Open the analytics hub",
    icon: "FileText",
    url: "/reports",
  },
];

function iconFor(name: string) {
  const icons: Record<string, ElementType> = {
    BriefcaseBusiness,
    Building2,
    CalendarClock,
    File,
    FileText,
    LayoutDashboard,
    PlayCircle,
    ReceiptText,
    Settings,
    ShieldCheck,
    User,
    UserPlus,
    Users,
  };
  return icons[name] ?? FileText;
}

function groupResults(results: SearchResult[]) {
  return results.reduce<Record<string, SearchResult[]>>((groups, result) => {
    groups[result.type] = [...(groups[result.type] ?? []), result];
    return groups;
  }, {});
}

function loadRecentItems() {
  if (typeof window === "undefined") return DEFAULT_RECENTS;

  try {
    const stored = window.localStorage.getItem("circleworks:command-recents");
    if (!stored) return DEFAULT_RECENTS;
    const parsed = JSON.parse(stored) as SearchResult[];
    return parsed.length ? parsed.slice(0, 5) : DEFAULT_RECENTS;
  } catch {
    return DEFAULT_RECENTS;
  }
}

function saveRecentItem(item: SearchResult) {
  if (typeof window === "undefined") return;

  try {
    const current = loadRecentItems();
    const next = [item, ...current.filter((recent) => recent.url !== item.url)].slice(0, 5);
    window.localStorage.setItem("circleworks:command-recents", JSON.stringify(next));
  } catch {
    // Recent history is a convenience, not a blocking feature.
  }
}

function ResultRow({
  item,
  selected,
  onSelect,
  onHover,
}: {
  item: SearchResult;
  selected: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  const Icon = iconFor(item.icon);

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
        selected
          ? "bg-blue-50 text-blue-950 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-50 dark:ring-blue-900"
          : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            selected
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          <Icon size={17} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black">{item.title}</span>
          <span className="block truncate text-xs font-medium text-slate-500 dark:text-slate-400">{item.subtitle}</span>
        </span>
      </span>
      {selected ? (
        <CornerDownLeft size={16} className="shrink-0 text-blue-500" />
      ) : (
        <ArrowRight size={15} className="shrink-0 text-slate-300" />
      )}
    </button>
  );
}

export default function CommandPalette() {
  const router = useRouter();
  const { isCommandPaletteOpen, setCommandPaletteOpen, setPayrollRunning } = usePlatformStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recents, setRecents] = useState<SearchResult[]>(DEFAULT_RECENTS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const visibleItems = useMemo(
    () => (query.trim() ? results : [...recents.slice(0, 5), ...QUICK_ACTIONS]),
    [query, recents, results],
  );

  const grouped = useMemo(() => groupResults(results), [results]);
  const renderedGroups = GROUP_ORDER.filter((group) => grouped[group]?.length);

  const runItem = (item: SearchResult) => {
    if (item.id === "action_run_payroll") {
      setPayrollRunning(true);
    }

    saveRecentItem(item);
    setRecents(loadRecentItems());
    setCommandPaletteOpen(false);
    router.push(item.url);
  };

  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    setQuery("");
    setResults([]);
    setSelectedIndex(0);
    setRecents(loadRecentItems());
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      setSelectedIndex(0);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&companyId=demo-company`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { results?: SearchResult[] };
        setResults(data.results ?? []);
        setSelectedIndex(0);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Search API failed", error);
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setCommandPaletteOpen(false);
        return;
      }

      if (!visibleItems.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) => (current + 1) % visibleItems.length);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((current) => (current - 1 + visibleItems.length) % visibleItems.length);
      }

      if (event.key === "Enter") {
        event.preventDefault();
        runItem(visibleItems[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, selectedIndex, setCommandPaletteOpen, visibleItems]);

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <Dialog
          open={isCommandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          overlayClassName="bg-black/50 backdrop-blur-md"
          contentClassName="mt-[10vh] max-w-[640px] border-0 bg-transparent p-0 shadow-none animate-none"
        >
          <DialogContent className="p-0">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
            initial={{ opacity: 0, y: -18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative flex w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
              <Search size={20} className="shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search employees, reports, run payroll..."
                className="h-16 min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
              {isLoading ? <Loader2 size={18} className="shrink-0 animate-spin text-blue-500" /> : null}
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              ) : null}
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!query.trim() ? (
                <div className="space-y-3">
                  <section>
                    <h3 className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Recent</h3>
                    <div className="space-y-1">
                      {recents.slice(0, 5).map((item, index) => (
                        <ResultRow
                          key={item.id}
                          item={item}
                          selected={selectedIndex === index}
                          onHover={() => setSelectedIndex(index)}
                          onSelect={() => runItem(item)}
                        />
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Quick Actions</h3>
                    <div className="space-y-1">
                      {QUICK_ACTIONS.map((item, actionIndex) => {
                        const index = recents.slice(0, 5).length + actionIndex;
                        return (
                          <ResultRow
                            key={item.id}
                            item={item}
                            selected={selectedIndex === index}
                            onHover={() => setSelectedIndex(index)}
                            onSelect={() => runItem(item)}
                          />
                        );
                      })}
                    </div>
                  </section>
                </div>
              ) : renderedGroups.length ? (
                <div className="space-y-3">
                  {renderedGroups.map((group) => (
                    <section key={group}>
                      <h3 className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{group}</h3>
                      <div className="space-y-1">
                        {grouped[group].map((item) => {
                          const index = visibleItems.findIndex((visible) => visible.id === item.id);
                          return (
                            <ResultRow
                              key={item.id}
                              item={item}
                              selected={selectedIndex === index}
                              onHover={() => setSelectedIndex(index)}
                              onSelect={() => runItem(item)}
                            />
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <Search size={22} />
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">No results found</p>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">Try searching for an employee, report, payroll run, document, or action.</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/80">
              <span>↑↓ to navigate</span>
              <span>Enter to select</span>
              <span>ESC to close</span>
            </div>
          </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
