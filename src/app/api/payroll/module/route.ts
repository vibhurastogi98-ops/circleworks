import { NextRequest, NextResponse } from "next/server";

import {
  applyPayrollAction,
  getPayrollModuleData,
  type PayrollModuleScreen,
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

export async function GET(request: NextRequest) {
  const screen = getScreen(request);
  const runId = request.nextUrl.searchParams.get("runId") || undefined;

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
