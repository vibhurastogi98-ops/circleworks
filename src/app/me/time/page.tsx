"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Timer,
  Coffee,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Hourglass,
} from "lucide-react";
import { toast } from "sonner";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatHHMMSS(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatShortTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function calcHours(clockIn: string, clockOut: string | null, breaks: TimeBreak[] = []): string {
  const end = clockOut ? new Date(clockOut).getTime() : Date.now();
  const entryMs = end - new Date(clockIn).getTime();
  const breakMs = breaks.reduce((acc, b) => {
    const bEnd = b.breakEnd ? new Date(b.breakEnd).getTime() : (clockOut ? 0 : Date.now());
    if (bEnd) return acc + (bEnd - new Date(b.breakStart).getTime());
    return acc;
  }, 0);
  
  const diff = (entryMs - breakMs) / 1000;
  if (diff < 0) return "0m";
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun,1=Mon,...
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface TimeBreak {
  id: number;
  timeEntryId: number;
  breakStart: string;
  breakEnd: string | null;
}

interface TimeEntry {
  id: number;
  employeeId: number;
  clockIn: string;
  clockOut: string | null;
  entryType: string | null;
  status: string | null;
  createdAt: string;
  breaks: TimeBreak[];
}

interface StatusData {
  isClocked: boolean;
  openEntry: TimeEntry | null;
  openBreak: TimeBreak | null;
  todayTotalHours: number;
  todayEntryCount: number;
}

// ─── Punch Button ────────────────────────────────────────────────────────────

function PunchButton({
  label,
  icon: Icon,
  onClick,
  loading,
  color,
  disabled,
}: {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  loading: boolean;
  color: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        relative flex items-center justify-center gap-3 w-full sm:w-auto
        px-8 py-4 rounded-2xl text-white font-bold text-[15px]
        shadow-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${color}
      `}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        <Icon size={20} strokeWidth={2.5} />
      )}
      {label}
    </motion.button>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-[17px] font-black text-slate-900 dark:text-white leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TimePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  const [status, setStatus] = useState<StatusData | null>(null);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [weekEntries, setWeekEntries] = useState<TimeEntry[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStart, setBreakStart] = useState<Date | null>(null);
  const [breakCount, setBreakCount] = useState(0);
  const [breakElapsed, setBreakElapsed] = useState(0); // seconds
  const [totalBreakSeconds, setTotalBreakSeconds] = useState(0);

  const statusRef = useRef(status);
  statusRef.current = status;

  // ── Sync local state with API status ─────────────────────────────────────
  useEffect(() => {
    if (status) {
      setIsOnBreak(!!status.openBreak);
      setBreakStart(status.openBreak ? new Date(status.openBreak.breakStart) : null);
      
      if (status.openEntry) {
        const completedBreaksSec = status.openEntry.breaks
          .filter(b => b.breakEnd !== null)
          .reduce((acc, b) => acc + (new Date(b.breakEnd!).getTime() - new Date(b.breakStart).getTime()) / 1000, 0);
        setTotalBreakSeconds(completedBreaksSec);
        setBreakCount(status.openEntry.breaks.length);
      } else {
        setTotalBreakSeconds(0);
        setBreakCount(0);
      }
    }
  }, [status]);

  // ── Live clock tick ──────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Break elapsed timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOnBreak || !breakStart) {
      setBreakElapsed(0);
      return;
    }
    const id = setInterval(() => {
      setBreakElapsed(
        Math.floor((Date.now() - breakStart.getTime()) / 1000)
      );
    }, 1000);
    return () => clearInterval(id);
  }, [isOnBreak, breakStart]);

  // ── Fetch helpers ────────────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/time/status");
      const data = await res.json();
      if (data.success) {
        setStatus(data);
      } else {
        console.error("[TimePage] Status fetch failed:", data.error);
      }
    } catch (err) {
      console.error("[TimePage] Status network error:", err);
      // Don't toast on every poll failure to avoid spam, 
      // but maybe log it.
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchWeekEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/time/entries");
      const data = await res.json();
      if (data.success && Array.isArray(data.entries)) {
        const weekStart = getWeekStart();
        const thisWeek = data.entries.filter(
          (e: TimeEntry) => new Date(e.clockIn) >= weekStart
        );
        setWeekEntries(thisWeek);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // ── Initial + polling load ───────────────────────────────────────────────
  useEffect(() => {
    fetchStatus();
    fetchWeekEntries();
    const id = setInterval(() => {
      fetchStatus();
      fetchWeekEntries();
    }, 30_000);
    return () => clearInterval(id);
  }, [fetchStatus, fetchWeekEntries]);

  // ── Session elapsed (since clock-in) ────────────────────────────────────
  const sessionElapsedSeconds = status?.openEntry
    ? Math.max(
        0,
        Math.floor(
          (now.getTime() - new Date(status.openEntry.clockIn).getTime()) / 1000
        )
      )
    : 0;

  // ── Action handlers ──────────────────────────────────────────────────────
  const handleClockIn = async () => {
    console.log("[TimePage] Clock-In Clicked");
    setActionLoading("clock-in");
    try {
      const res = await fetch("/api/time/clock-in", { method: "POST" });
      const data = await res.json();
      console.log("[TimePage] Clock-In Response:", data);
      if (data.success) {
        toast.success("Clocked in successfully!");
        await Promise.all([fetchStatus(), fetchWeekEntries()]);
      } else {
        toast.error(data.error || "Failed to clock in");
      }
    } catch (err) {
      console.error("[TimePage] Clock-In Fetch Error:", err);
      toast.error("Network error — please try again");
    } finally {
      setActionLoading(null);
    }
  };

  const handleClockOut = async () => {
    console.log("[TimePage] Clock-Out Clicked");
    setActionLoading("clock-out");
    try {
      const res = await fetch("/api/time/clock-out", { method: "POST" });
      const data = await res.json();
      console.log("[TimePage] Clock-Out Response:", data);
      if (data.success) {
        toast.success("Clocked out successfully!");
        await Promise.all([fetchStatus(), fetchWeekEntries()]);
      } else {
        toast.error(data.error || "Failed to clock out");
      }
    } catch (err) {
      console.error("[TimePage] Clock-Out Fetch Error:", err);
      toast.error("Network error — please try again");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBreakStart = async () => {
    console.log("[TimePage] Break-Start Clicked");
    setActionLoading("break-start");
    try {
      const res = await fetch("/api/time/break-start", { method: "POST" });
      const data = await res.json();
      console.log("[TimePage] Break-Start Response:", data);
      if (data.success) {
        toast.success("Break started");
        await fetchStatus();
      } else {
        toast.error(data.error || "Failed to start break");
      }
    } catch (err) {
      console.error("[TimePage] Break-Start Fetch Error:", err);
      toast.error("Network error — please try again");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBreakEnd = async () => {
    console.log("[TimePage] Break-End Clicked");
    setActionLoading("break-end");
    try {
      const res = await fetch("/api/time/break-end", { method: "POST" });
      const data = await res.json();
      console.log("[TimePage] Break-End Response:", data);
      if (data.success) {
        toast.success("Break ended — back to work!");
        await fetchStatus();
      } else {
        toast.error(data.error || "Failed to end break");
      }
    } catch (err) {
      console.error("[TimePage] Break-End Fetch Error:", err);
      toast.error("Network error — please try again");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────
  const isClockedIn = !!status?.openEntry;
  const netSessionSeconds = Math.max(
    0,
    sessionElapsedSeconds - (isOnBreak ? breakElapsed : 0) - totalBreakSeconds
  );
  const todayHoursDisplay =
    status?.todayTotalHours !== undefined
      ? `${status.todayTotalHours.toFixed(2)}h`
      : "—";

  const currentBreakTotal = totalBreakSeconds + (isOnBreak ? breakElapsed : 0);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Time Tracking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Clock in, manage breaks, and review your timesheet
          </p>
        </div>
        {/* Status pill */}
        <AnimatePresence mode="wait">
          {!loadingStatus && (
            <motion.div
              key={isClockedIn ? "in" : "out"}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold border ${
                isClockedIn
                  ? isOnBreak
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/30"
                    : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                  : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isClockedIn
                    ? isOnBreak
                      ? "bg-amber-500 animate-pulse"
                      : "bg-emerald-500 animate-pulse"
                    : "bg-slate-400"
                }`}
              />
              {isClockedIn
                ? isOnBreak
                  ? "On Break"
                  : "Clocked In"
                : "Clocked Out"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Punch Widget ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 overflow-hidden"
      >
        {/* Live clock banner */}
        <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-700 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock size={22} className="text-white/80" />
            <span className="text-white/80 text-[13px] font-semibold uppercase tracking-widest">
              Current Time
            </span>
          </div>
          <span suppressHydrationWarning className="font-mono text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isMounted ? formatTime(now) : "--:--:-- --"}
          </span>
        </div>

        {/* Session elapsed + break timer */}
        {isClockedIn && (
          <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-700/40 border-b border-slate-100 dark:border-slate-700/40">
            <div className="flex flex-col items-center py-4 px-6">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                Session Time
              </span>
              <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatHHMMSS(netSessionSeconds)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                since{" "}
                {formatShortTime(status?.openEntry?.clockIn ?? null)}
              </span>
            </div>
            <div className="flex flex-col items-center py-4 px-6">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                {isOnBreak ? "Break Time" : "Break Taken"}
              </span>
              <span
                className={`font-mono text-2xl font-black ${
                  isOnBreak
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {isOnBreak
                  ? formatHHMMSS(breakElapsed)
                  : formatHHMMSS(totalBreakSeconds)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {breakCount} break{breakCount !== 1 ? "s" : ""} today
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="p-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isClockedIn ? (
            <PunchButton
              label="Clock In"
              icon={Play}
              onClick={handleClockIn}
              loading={actionLoading === "clock-in"}
              color="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700"
            />
          ) : (
            <>
              {!isOnBreak ? (
                <PunchButton
                  label="Start Break"
                  icon={Coffee}
                  onClick={handleBreakStart}
                  loading={actionLoading === "break-start"}
                  color="bg-amber-500 hover:bg-amber-600 active:bg-amber-700"
                />
              ) : (
                <PunchButton
                  label="End Break"
                  icon={Play}
                  onClick={handleBreakEnd}
                  loading={actionLoading === "break-end"}
                  color="bg-sky-500 hover:bg-sky-600 active:bg-sky-700"
                />
              )}
              <PunchButton
                label="Clock Out"
                icon={Square}
                onClick={handleClockOut}
                loading={actionLoading === "clock-out"}
                color="bg-red-500 hover:bg-red-600 active:bg-red-700"
              />
            </>
          )}
        </div>
      </motion.div>

      {/* ── Today's Summary ── */}
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">
          Today's Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Hourglass}
            label="Hours Worked"
            value={
              isClockedIn
                ? `${((status?.todayTotalHours ?? 0) + netSessionSeconds / 3600).toFixed(2)}h`
                : todayHoursDisplay
            }
            color="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
          />
          <StatCard
            icon={Coffee}
            label="Breaks Taken"
            value={String(breakCount)}
            color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
          />
          <StatCard
            icon={Timer}
            label="Break Time"
            value={
              currentBreakTotal > 0
                ? formatHHMMSS(currentBreakTotal)
                : "None"
            }
            color="bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400"
          />
          <StatCard
            icon={isClockedIn ? CheckCircle2 : AlertCircle}
            label="Status"
            value={
              isClockedIn ? (isOnBreak ? "On Break" : "Working") : "Clocked Out"
            }
            color={
              isClockedIn
                ? isOnBreak
                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400"
            }
          />
        </div>
      </div>

      {/* ── This Week's Entries ── */}
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <CalendarDays size={16} className="text-violet-500" />
          This Week's Timesheet
        </h2>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr_0.8fr] gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/40 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            <span>Date</span>
            <span>Clock In</span>
            <span>Clock Out</span>
            <span>Break</span>
            <span>Total</span>
            <span>Status</span>
          </div>

          {weekEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <CalendarDays size={32} className="mb-3 opacity-40" />
              <p className="text-[13px] font-semibold">No entries this week</p>
              <p className="text-[12px] mt-1 opacity-70">
                Clock in to start tracking your time
              </p>
            </div>
          ) : (
            <>
              {weekEntries.map((entry, i) => {
                const isOpen = entry.clockOut === null;
                const total = calcHours(entry.clockIn, entry.clockOut, entry.breaks);
                const breakSec = entry.breaks.reduce((acc, b) => {
                  const bEnd = b.breakEnd ? new Date(b.breakEnd).getTime() : (isOpen ? Date.now() : 0);
                  if (bEnd) return acc + (bEnd - new Date(b.breakStart).getTime()) / 1000;
                  return acc;
                }, 0);

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr_0.8fr] gap-2 sm:gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700/30 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors items-center"
                  >
                    {/* Date */}
                    <span className="text-[13px] font-semibold text-slate-900 dark:text-white">
                      {formatDate(entry.clockIn)}
                    </span>

                    {/* Clock In */}
                    <span className="text-[13px] text-slate-600 dark:text-slate-300">
                      {formatShortTime(entry.clockIn)}
                    </span>

                    {/* Clock Out */}
                    <span
                      className={`text-[13px] ${
                        isOpen
                          ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {isOpen ? "Active…" : formatShortTime(entry.clockOut)}
                    </span>

                    {/* Break */}
                    <span className="text-[13px] text-slate-400 dark:text-slate-500">
                      {breakSec > 0 ? formatHHMMSS(breakSec) : "—"}
                    </span>

                    {/* Total */}
                    <span
                      className={`text-[13px] font-bold ${
                        isOpen
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {total}
                    </span>

                    {/* Status */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold w-fit ${
                        isOpen
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                          : entry.status === "Approved"
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {isOpen ? "Active" : (entry.status ?? "Pending")}
                    </span>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}
