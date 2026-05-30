"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { ElementType, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  CornerDownLeft,
  CreditCard,
  File,
  FileText,
  Loader2,
  PlayCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
  Users,
} from "lucide-react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { usePlatformStore } from "@/store/usePlatformStore";
import type { SearchResponse, SearchResult, SearchSection } from "@/lib/search/types";
import { SearchEmptyIllustration } from "@/components/StateIllustrations";

const RECENT_SEARCH_KEY = "recent_search_items";
const LEGACY_RECENT_SEARCH_KEY = "circleworks:command-recents";

type PaletteSectionTitle = SearchSection | "RECENT" | "QUICK ACTIONS";
type PaletteItem = SearchResult & {
  commandValue: string;
  sectionTitle: PaletteSectionTitle;
  analyticsType?: string;
  visitedAt?: string;
};

const SEARCH_TYPES = "employees,payroll,documents,reports,jobs";
const SUGGESTED_SEARCHES = ["payroll runs", "employees", "PTO requests"];
const RESULT_SECTION_ORDER: SearchSection[] = [
  "EMPLOYEES",
  "PAYROLL RUNS",
  "DOCUMENTS",
  "REPORTS",
  "JOBS/CANDIDATES",
  "SETTINGS",
];

const QUICK_ACTIONS: PaletteItem[] = [
  {
    id: "quick_run_payroll",
    commandValue: "quick_run_payroll",
    sectionTitle: "QUICK ACTIONS",
    analyticsType: "quick_action",
    entityType: "payroll",
    section: "PAYROLL RUNS",
    title: "Run Payroll",
    subtitle: "Start a payroll run",
    href: "/payroll/run",
    icon: "PlayCircle",
  },
  {
    id: "quick_add_employee",
    commandValue: "quick_add_employee",
    sectionTitle: "QUICK ACTIONS",
    analyticsType: "quick_action",
    entityType: "employees",
    section: "EMPLOYEES",
    title: "Add Employee",
    subtitle: "Create a new employee profile",
    href: "/employees/new",
    icon: "UserPlus",
  },
  {
    id: "quick_view_reports",
    commandValue: "quick_view_reports",
    sectionTitle: "QUICK ACTIONS",
    analyticsType: "quick_action",
    entityType: "reports",
    section: "REPORTS",
    title: "View Reports",
    subtitle: "Open reports and analytics",
    href: "/reports",
    icon: "FileText",
  },
  {
    id: "quick_start_onboarding",
    commandValue: "quick_start_onboarding",
    sectionTitle: "QUICK ACTIONS",
    analyticsType: "quick_action",
    entityType: "employees",
    section: "EMPLOYEES",
    title: "Start Onboarding",
    subtitle: "Open onboarding cases",
    href: "/onboarding",
    icon: "CheckCircle2",
  },
  {
    id: "quick_schedule_interview",
    commandValue: "quick_schedule_interview",
    sectionTitle: "QUICK ACTIONS",
    analyticsType: "quick_action",
    entityType: "jobs",
    section: "JOBS/CANDIDATES",
    title: "Schedule Interview",
    subtitle: "Open the interview calendar",
    href: "/hiring/interviews",
    icon: "CalendarClock",
  },
];

function iconFor(name: string) {
  const icons: Record<string, ElementType> = {
    BriefcaseBusiness,
    Building2,
    CalendarClock,
    CheckCircle2,
    CreditCard,
    File,
    FileText,
    PlayCircle,
    Settings,
    ShieldCheck,
    Sparkles,
    User,
    UserPlus,
    Users,
  };
  return icons[name] ?? FileText;
}

function isRecentItem(value: unknown): value is SearchResult & { visitedAt?: string } {
  return Boolean(
    value &&
      typeof value === "object" &&
      "id" in value &&
      "title" in value &&
      "href" in value &&
      typeof (value as { id?: unknown }).id === "string" &&
      typeof (value as { title?: unknown }).title === "string" &&
      typeof (value as { href?: unknown }).href === "string",
  );
}

function toPaletteItem(item: SearchResult & { visitedAt?: string }, sectionTitle: PaletteSectionTitle): PaletteItem {
  return {
    ...item,
    commandValue: `${sectionTitle.toLowerCase().replace(/\s+/g, "_")}_${item.id}`,
    sectionTitle,
  };
}

function loadRecentItems() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(RECENT_SEARCH_KEY) ?? window.localStorage.getItem(LEGACY_RECENT_SEARCH_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];

    const recents = parsed.filter(isRecentItem).slice(0, 8);
    if (recents.length && !window.localStorage.getItem(RECENT_SEARCH_KEY)) {
      window.localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(recents));
    }
    return recents;
  } catch {
    return [];
  }
}

function saveRecentItem(item: SearchResult) {
  if (typeof window === "undefined") return;

  try {
    const current = loadRecentItems();
    const next = [
      { ...item, visitedAt: new Date().toISOString() },
      ...current.filter((recent) => recent.href !== item.href),
    ].slice(0, 8);
    window.localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next));
  } catch {
    // Recent search history is useful, but never worth interrupting navigation.
  }
}

function clearRecentItems() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RECENT_SEARCH_KEY);
  window.localStorage.removeItem(LEGACY_RECENT_SEARCH_KEY);
}

function groupedResults(results: SearchResult[]) {
  const grouped = new Map<SearchSection, PaletteItem[]>();
  results.forEach((result) => {
    const items = grouped.get(result.section) ?? [];
    items.push(toPaletteItem(result, result.section));
    grouped.set(result.section, items);
  });

  return RESULT_SECTION_ORDER.map((section) => ({
    title: section as PaletteSectionTitle,
    items: grouped.get(section) ?? [],
  })).filter((section) => section.items.length);
}

function ResultIcon({ item }: { item: PaletteItem }) {
  const Icon = iconFor(item.icon);

  if (item.entityType === "employees" && item.avatarUrl) {
    return (
      <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
        <Image src={item.avatarUrl} alt="" fill sizes="40px" className="object-cover" unoptimized />
      </span>
    );
  }

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
      <Icon size={18} />
    </span>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex max-w-28 shrink-0 items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <span className="truncate">{children}</span>
    </span>
  );
}

function ResultRow({ item, onSelect }: { item: PaletteItem; onSelect: (item: PaletteItem) => void }) {
  const metadata = item.metadata ?? {};

  return (
    <CommandItem
      value={item.commandValue}
      onSelect={() => onSelect(item)}
      className="group justify-between gap-3"
    >
      <span className="flex min-w-0 items-center gap-3">
        <ResultIcon item={item} />
        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-black text-slate-950 dark:text-white">{item.title}</span>
            {item.badge ? <Badge>{item.badge}</Badge> : null}
          </span>
          {item.entityType === "employees" ? (
            <span className="mt-0.5 block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {metadata.title ?? "Employee"} · {metadata.department ?? "No department"}
            </span>
          ) : item.entityType === "payroll" ? (
            <span className="mt-0.5 block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {metadata.period ?? item.subtitle} · {metadata.checkDate ?? "No check date"} · {metadata.gross ?? "No gross amount"}
            </span>
          ) : item.entityType === "documents" ? (
            <span className="mt-0.5 block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {metadata.employeeName ?? "Employee"} · {metadata.documentType ?? "Document"}
            </span>
          ) : (
            <span className="mt-0.5 block truncate text-xs font-medium text-slate-500 dark:text-slate-400">{item.subtitle}</span>
          )}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2 text-slate-300 transition group-data-[selected=true]:text-blue-500">
        <CornerDownLeft size={16} className="hidden group-data-[selected=true]:block" />
        <ArrowRight size={16} className="group-data-[selected=true]:hidden" />
      </span>
    </CommandItem>
  );
}

export default function CommandPalette() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    currentCompany,
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setPayrollRunning,
  } = usePlatformStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const queryStartedAtRef = useRef<number>(0);
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recents, setRecents] = useState<Array<SearchResult & { visitedAt?: string }>>([]);
  const [selectedValue, setSelectedValue] = useState("");

  const trimmedQuery = query.trim();
  const isSettlingDebounce = trimmedQuery.length >= 2 && debouncedQuery !== trimmedQuery;

  const sections = useMemo(() => {
    if (!trimmedQuery) {
      return [
        {
          title: "RECENT" as PaletteSectionTitle,
          items: recents.slice(0, 8).map((item) => toPaletteItem(item, "RECENT")),
        },
        {
          title: "QUICK ACTIONS" as PaletteSectionTitle,
          items: QUICK_ACTIONS,
        },
      ].filter((section) => section.title === "QUICK ACTIONS" || section.items.length);
    }

    if (trimmedQuery.length < 2) return [];
    return groupedResults(searchData?.results ?? []);
  }, [recents, searchData?.results, trimmedQuery]);

  const visibleItems = useMemo(() => sections.flatMap((section) => section.items), [sections]);
  const isLoading = isSettlingDebounce || searchLoading;

  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    setQuery("");
    setDebouncedQuery("");
    setSearchData(null);
    setSearchLoading(false);
    setRecents(loadRecentItems());
    setSelectedValue("");
    queryStartedAtRef.current = performance.now();
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    if (!trimmedQuery || trimmedQuery.length < 2) {
      requestIdRef.current += 1;
      setDebouncedQuery(trimmedQuery);
      setSearchData(null);
      setSearchLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setSearchLoading(true);

    const timeout = window.setTimeout(async () => {
      const searchTerm = trimmedQuery;
      setDebouncedQuery(searchTerm);
      queryStartedAtRef.current = performance.now();

      try {
        const queryKey = ["global-search", currentCompany.id, searchTerm, SEARCH_TYPES] as const;
        const cached = queryClient.getQueryData<SearchResponse>(queryKey);
        const data = cached ?? (await (async () => {
          const params = new URLSearchParams({
            q: searchTerm,
            companyId: currentCompany.id,
            types: SEARCH_TYPES,
          });
          const response = await fetch(`/api/search?${params.toString()}`, {
            credentials: "include",
          });
          if (!response.ok) throw new Error("Search failed");
          return (await response.json()) as SearchResponse;
        })());
        queryClient.setQueryData(queryKey, data);

        if (requestIdRef.current === requestId) setSearchData(data);
      } catch (error) {
        if (requestIdRef.current === requestId) {
          console.error("Global search failed", error);
          setSearchData({ companyId: currentCompany.id, query: searchTerm, tookMs: 0, resultCount: 0, source: "mock", results: [] });
        }
      } finally {
        if (requestIdRef.current === requestId) setSearchLoading(false);
      }
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [currentCompany.id, isCommandPaletteOpen, queryClient, trimmedQuery]);

  useEffect(() => {
    if (!visibleItems.length) {
      setSelectedValue("");
      return;
    }

    setSelectedValue((current) =>
      visibleItems.some((item) => item.commandValue === current) ? current : visibleItems[0].commandValue,
    );
  }, [visibleItems]);

  const closePalette = () => {
    setCommandPaletteOpen(false);
    setQuery("");
    setDebouncedQuery("");
    setSearchData(null);
    setSearchLoading(false);
  };

  const trackSelection = (item: PaletteItem) => {
    const timeToSelectionMs = Math.round(performance.now() - queryStartedAtRef.current);

    void fetch("/api/search/analytics", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: trimmedQuery,
        resultCount: searchData?.resultCount ?? visibleItems.length,
        selectedResultType: item.analyticsType ?? item.entityType,
        selectedResultId: item.id,
        selectedResultTitle: item.title,
        timeToSelectionMs,
        source: "command_palette",
      }),
    }).catch(() => undefined);
  };

  const runItem = (item: PaletteItem) => {
    if (item.id === "quick_run_payroll") setPayrollRunning(true);
    trackSelection(item);
    saveRecentItem(item);
    setRecents(loadRecentItems());
    closePalette();
    router.push(item.href);
  };

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    setSearchData(null);
    setSearchLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (trimmedQuery) {
        clearSearch();
      } else {
        closePalette();
      }
      return;
    }

    if (event.key !== "Tab" || sections.length < 2) return;

    event.preventDefault();
    const currentSectionIndex = Math.max(
      0,
      sections.findIndex((section) => section.items.some((item) => item.commandValue === selectedValue)),
    );
    const nextSectionIndex = event.shiftKey
      ? (currentSectionIndex - 1 + sections.length) % sections.length
      : (currentSectionIndex + 1) % sections.length;
    setSelectedValue(sections[nextSectionIndex]?.items[0]?.commandValue ?? visibleItems[0]?.commandValue ?? "");
  };

  return (
    <CommandDialog open={isCommandPaletteOpen} onOpenChange={(open) => (open ? setCommandPaletteOpen(true) : closePalette())}>
      <Command
        value={selectedValue}
        onValueChange={setSelectedValue}
        shouldFilter={false}
        loop
        onKeyDown={handleKeyDown}
        label="Global search"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-800">
          <Search size={21} className="shrink-0 text-slate-400" />
          <CommandInput
            ref={inputRef}
            value={query}
            onValueChange={setQuery}
            placeholder="Search employees, payroll runs, documents..."
            aria-label="Search employees, payroll runs, documents"
            autoFocus
          />
          {isLoading ? <Loader2 size={18} className="shrink-0 animate-spin text-blue-600" /> : null}
          <kbd className="hidden shrink-0 rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 sm:inline-flex">
            Esc
          </kbd>
        </div>

        <CommandList>
          {!trimmedQuery ? (
            <div className="space-y-2">
              {sections.map((section, sectionIndex) => (
                <CommandGroup
                  key={section.title}
                  heading={
                    <span className="flex items-center justify-between">
                      <span>{section.title === "RECENT" ? "Recent" : "Quick Actions"}</span>
                      {section.title === "RECENT" ? (
                        <button
                          type="button"
                          onClick={() => {
                            clearRecentItems();
                            setRecents([]);
                            setSelectedValue(QUICK_ACTIONS[0]?.commandValue ?? "");
                          }}
                          className="text-[11px] font-black normal-case tracking-normal text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          Clear all
                        </button>
                      ) : null}
                    </span>
                  }
                >
                  {section.items.length ? (
                    section.items.map((item) => <ResultRow key={item.commandValue} item={item} onSelect={runItem} />)
                  ) : (
                    <div className="px-3 py-6 text-sm font-medium text-slate-500 dark:text-slate-400">No recent items yet.</div>
                  )}
                  {sectionIndex < sections.length - 1 ? <CommandSeparator /> : null}
                </CommandGroup>
              ))}
            </div>
          ) : trimmedQuery.length < 2 ? (
            <CommandEmpty>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Search size={22} />
              </div>
              <p className="font-black text-slate-950 dark:text-white">Keep typing</p>
              <p className="mt-1">Enter at least 2 characters to search.</p>
            </CommandEmpty>
          ) : sections.length ? (
            <div className="space-y-2">
              {sections.map((section, sectionIndex) => (
                <CommandGroup key={section.title} heading={section.title}>
                  {section.items.map((item) => <ResultRow key={item.commandValue} item={item} onSelect={runItem} />)}
                  {sectionIndex < sections.length - 1 ? <CommandSeparator /> : null}
                </CommandGroup>
              ))}
            </div>
          ) : (
            <CommandEmpty>
              <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center">
                <SearchEmptyIllustration className="h-24 w-24" />
              </div>
              <p className="font-black text-slate-950 dark:text-white">No results for &quot;{trimmedQuery}&quot;</p>
              <p className="mt-1">Try different keywords or check spelling</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTED_SEARCHES.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setQuery(suggestion);
                      setSearchData(null);
                      inputRef.current?.focus();
                    }}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </CommandEmpty>
          )}
        </CommandList>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/80">
          <span>↑↓ navigate</span>
          <span>Tab section</span>
          <span>Enter open</span>
          <span>Esc clear/close</span>
        </div>
      </Command>
    </CommandDialog>
  );
}
