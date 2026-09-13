import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { employees, payrollItems, payrolls, paySchedules } from "@/db/schema";
import {
  applyPayrollAction,
  getPayrollModuleData,
  type PayrollHubData,
  type PayrollModuleScreen,
  type PayrollRunStatus,
  type PayrollRunSummary,
} from "@/lib/payroll-module-data";
import { createNotificationForEmployee } from "@/lib/notifications/server";
import { createPayrollRunWithEngine } from "@/lib/payroll/run-engine";
import { getSession, resolveUserContext } from "@/lib/session";

const screens = new Set<PayrollModuleScreen>([
  "hub",
  "run",
  "completed-run",
  "paystubs",
  "off-cycle",
  "history",
  "contractors",
  "schedule",
  "tax-setup",
  "garnishments",
  "ewa",
  "bridge",
  "settings",
  "reports",
]);

function getScreen(request: NextRequest): PayrollModuleScreen {
  const screen = request.nextUrl.searchParams.get("screen") as PayrollModuleScreen | null;
  return screen && screens.has(screen) ? screen : "hub";
}

async function runPayrollActionSideEffects(
  request: NextRequest,
  action: string,
  payload: Record<string, unknown> = {},
) {
  if (!action.startsWith("payroll.autopilot")) return;

  try {
    const session = await getSession(request);
    if (!session) return;

    const ctx = await resolveUserContext(session);
    if (!ctx) return;

    const scheduleName = typeof payload.scheduleName === "string" ? payload.scheduleName : "payroll";
    const scheduleId = typeof payload.scheduleId === "string" ? payload.scheduleId : "autopilot";
    const nextRunLabel = typeof payload.nextRunLabel === "string" ? payload.nextRunLabel : "Jun 15";
    const reviewHref =
      typeof payload.reviewHref === "string"
        ? payload.reviewHref
        : `/payroll/run?autopilot=review&schedule=${scheduleId}`;
    const pauseHref =
      typeof payload.pauseHref === "string"
        ? payload.pauseHref
        : `/payroll/settings?autopilot=pause&schedule=${scheduleId}`;

    if (action === "payroll.autopilot.review-window") {
      await createNotificationForEmployee({
        ctx,
        userId: session.userId,
        type: "payroll.autopilot.review_window",
        title: "AutoPilot review window open",
        message: `AutoPilot is on for ${scheduleName}. The next run is ${nextRunLabel} and auto-submits in 2 days unless paused.`,
        link: reviewHref,
        actionLabel: "Review",
        metadata: {
          scheduleId,
          scheduleName,
          nextRunLabel,
          secondaryActionLabel: "Pause this run",
          secondaryActionLink: pauseHref,
        },
      });
    }

    if (action === "payroll.autopilot.pause") {
      await createNotificationForEmployee({
        ctx,
        userId: session.userId,
        type: "payroll.autopilot.paused",
        title: "AutoPilot run paused",
        message: `AutoPilot was paused for ${scheduleName}. This run now requires manual review and submission.`,
        link: reviewHref,
        actionLabel: "Review run",
        metadata: { scheduleId, scheduleName },
      });
    }

    if (action === "payroll.autopilot.auto-run") {
      await createPayrollRunWithEngine({
        companyId: ctx.companyId,
        payPeriodStart: typeof payload.payPeriodStart === "string" ? payload.payPeriodStart : "2026-06-01",
        payPeriodEnd: typeof payload.payPeriodEnd === "string" ? payload.payPeriodEnd : "2026-06-15",
        checkDate: typeof payload.checkDate === "string" ? payload.checkDate : "2026-06-15",
        type: "regular",
        timeImportMissingMode: "scheduled",
        initialStatus: "pending",
        source: "autopilot",
        sourceConfigRunId: typeof payload.lastRunId === "string" ? payload.lastRunId : undefined,
      });
    }
  } catch (error) {
    console.error("[Payroll AutoPilot side effect]", error);
  }
}

function formatMoney(cents: number) {
  if (Math.abs(cents) >= 100_000_00) {
    return `$${(cents / 100_000_00).toFixed(2)}M`;
  }
  if (Math.abs(cents) >= 1_000_00) {
    return `$${(cents / 1_000_00).toFixed(1)}k`;
  }
  return `$${(cents / 100).toFixed(2)}`;
}

function statusFromDb(v: string | null): PayrollRunStatus {
  switch ((v ?? "").toLowerCase()) {
    case "paid": return "Paid";
    case "processing": return "Processing";
    case "pending": return "Pending";
    case "draft": return "Draft";
    case "failed":
    case "cancelled": return "Failed";
    default: return "Draft";
  }
}

function typeFromDb(v: string | null): PayrollRunSummary["type"] {
  const t = (v ?? "").toLowerCase();
  if (t === "off-cycle" || t === "bonus") return "Off-cycle";
  if (t === "contractor") return "Contractor";
  return "Regular";
}

function labelPeriod(start: Date | string | null, end: Date | string | null) {
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;
  if (!s || !e) return "—";
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(s)} – ${fmt(e)}`;
}

function labelCheckDate(d: Date | string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function computeNextCheckDate(lastCheck: Date | null, frequency: string | null): Date {
  const base = lastCheck ? new Date(lastCheck) : new Date();
  const freq = (frequency ?? "biweekly").toLowerCase();
  const next = new Date(base);
  if (lastCheck) {
    if (freq === "weekly") next.setDate(next.getDate() + 7);
    else if (freq === "semi-monthly") next.setDate(next.getDate() + 15);
    else if (freq === "monthly") next.setMonth(next.getMonth() + 1);
    else next.setDate(next.getDate() + 14); // biweekly default
  } else {
    // No history — next check is 14 days out from today as a placeholder.
    next.setDate(next.getDate() + 14);
  }
  return next;
}

async function getPayrollHubDataReal(companyId: number): Promise<PayrollHubData> {
  // Recent runs (up to 5). We join payroll_items to count distinct employees per run.
  const recent = await db
    .select({
      id: payrolls.id,
      payPeriodStart: payrolls.payPeriodStart,
      payPeriodEnd: payrolls.payPeriodEnd,
      checkDate: payrolls.checkDate,
      status: payrolls.status,
      type: payrolls.type,
      totalGross: payrolls.totalGross,
      totalTaxes: payrolls.totalTaxes,
      totalNet: payrolls.totalNet,
    })
    .from(payrolls)
    .where(eq(payrolls.companyId, companyId))
    .orderBy(desc(payrolls.checkDate), desc(payrolls.id))
    .limit(5);

  const itemCounts = recent.length
    ? await db
        .select({ payrollId: payrollItems.payrollId, n: sql<number>`count(*)::int` })
        .from(payrollItems)
        .where(sql`${payrollItems.payrollId} IN ${recent.map((r) => r.id)}`)
        .groupBy(payrollItems.payrollId)
    : [];
  const countByRun = new Map(itemCounts.map((r) => [r.payrollId, r.n]));

  const activeRuns: PayrollRunSummary[] = recent.map((r) => ({
    id: `run-${r.id}`,
    payPeriod: labelPeriod(r.payPeriodStart, r.payPeriodEnd),
    checkDate: labelCheckDate(r.checkDate),
    employees: countByRun.get(r.id) ?? 0,
    gross: r.totalGross ?? 0,
    taxes: r.totalTaxes ?? 0,
    net: r.totalNet ?? 0,
    status: statusFromDb(r.status),
    type: typeFromDb(r.type),
  }));

  // In-flight vs paid counts for the KPI subtitle.
  const inFlight = activeRuns.filter((r) => r.status === "Draft" || r.status === "Pending" || r.status === "Processing");
  const inFlightDetail =
    inFlight.length === 0
      ? "All recent runs paid"
      : `${inFlight.filter((r) => r.status === "Draft").length} draft, ` +
        `${inFlight.filter((r) => r.status === "Pending").length} pending, ` +
        `${inFlight.filter((r) => r.status === "Processing").length} processing`;

  // Employee count (active only).
  const [empCountRow] = await db
    .select({ n: count() })
    .from(employees)
    .where(and(eq(employees.companyId, companyId), eq(employees.status, "active")));
  const activeEmployees = empCountRow?.n ?? 0;

  // YTD totals (sum of paid runs whose check_date is >= Jan 1 of this year).
  const yearStart = `${new Date().getUTCFullYear()}-01-01`;
  const [ytdRow] = await db
    .select({
      gross: sql<number>`coalesce(sum(${payrolls.totalGross}),0)::int`,
      taxes: sql<number>`coalesce(sum(${payrolls.totalTaxes}),0)::int`,
    })
    .from(payrolls)
    .where(and(
      eq(payrolls.companyId, companyId),
      eq(payrolls.status, "paid"),
      gte(payrolls.checkDate, yearStart),
    ));
  const ytdGross = ytdRow?.gross ?? 0;
  const ytdTaxes = ytdRow?.taxes ?? 0;

  // Next pay date from the default (or first) pay schedule, projected off the
  // most recent check date on file (or today, if no runs yet).
  const [defaultSchedule] = await db
    .select({ frequency: paySchedules.frequency })
    .from(paySchedules)
    .where(eq(paySchedules.companyId, companyId))
    .orderBy(desc(paySchedules.isDefault), desc(paySchedules.createdAt))
    .limit(1);
  const lastCheckDate = recent[0]?.checkDate ? new Date(recent[0].checkDate) : null;
  const nextPay = computeNextCheckDate(lastCheckDate, defaultSchedule?.frequency ?? null);
  const nextPayLabel = nextPay.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const nextPayDetail = defaultSchedule
    ? `${defaultSchedule.frequency} · projected from last run`
    : "No pay schedule configured";

  return {
    kpis: [
      {
        label: "Active Runs",
        value: String(activeRuns.length),
        detail: inFlightDetail,
        href: "/payroll/history",
      },
      {
        label: "Next Pay Date",
        value: nextPayLabel,
        detail: nextPayDetail,
        href: "/payroll/schedule",
      },
      {
        label: "YTD Payroll",
        value: formatMoney(ytdGross),
        detail: `${activeEmployees} active employees`,
        href: "/payroll/history",
      },
      {
        label: "YTD Tax Filed",
        value: formatMoney(ytdTaxes),
        detail: "Sum of paid-run taxes this year",
        href: "/payroll/tax-setup",
      },
    ],
    quickLinks: [
      { label: "Off-cycle", href: "/payroll/off-cycle", detail: "Bonus, correction, termination pay" },
      { label: "Contractors", href: "/payroll/contractors", detail: "1099 payment runs" },
      { label: "Schedules", href: "/payroll/schedule", detail: "Pay calendars and check dates" },
      { label: "Tax Setup", href: "/payroll/tax-setup", detail: "EIN, state accounts, EFTPS" },
    ],
    activeRuns,
    // AutoPilot is a scheduler-layer feature not backed by DB yet — leave off.
    autoPilot: null,
  };
}

export async function GET(request: NextRequest) {
  const screen = getScreen(request);
  const runId = request.nextUrl.searchParams.get("runId") || undefined;

  // Only the hub screen is real-data. Every other screen still returns the
  // mock module data (deliberate scope-limit per this iteration).
  if (screen === "hub") {
    const session = await getSession(request);
    const ctx = session ? await resolveUserContext(session) : null;
    if (ctx?.companyId) {
      try {
        const data = await getPayrollHubDataReal(ctx.companyId);
        return NextResponse.json({ screen, data });
      } catch (err) {
        // Real-data path failed — falling back to mock so the page still
        // renders. This is a monitoring signal, not user-visible: a spike in
        // these means the hub is showing stale/fake numbers to real tenants.
        console.error(
          "[payroll/module] hub real-data query failed; falling back to mock",
          { companyId: ctx.companyId, error: err instanceof Error ? err.message : String(err) },
        );
      }
    }
  }

  return NextResponse.json({
    screen,
    data: getPayrollModuleData(screen, runId),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { action?: string; payload?: Record<string, unknown> };
  const action = body.action || "payroll.action";
  await runPayrollActionSideEffects(request, action, body.payload);
  return NextResponse.json(applyPayrollAction(action, body.payload));
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { action?: string; payload?: Record<string, unknown> };
  const action = body.action || "payroll.update";
  await runPayrollActionSideEffects(request, action, body.payload);
  return NextResponse.json(applyPayrollAction(action, body.payload));
}
