import { NextRequest, NextResponse } from "next/server";

import {
  applyPayrollAction,
  getPayrollModuleData,
  type PayrollModuleScreen,
} from "@/lib/payroll-module-data";

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

export async function GET(request: NextRequest) {
  const screen = getScreen(request);
  const runId = request.nextUrl.searchParams.get("runId") || undefined;

  return NextResponse.json({
    screen,
    data: getPayrollModuleData(screen, runId),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { action?: string };
  return NextResponse.json(applyPayrollAction(body.action || "payroll.action"));
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { action?: string };
  return NextResponse.json(applyPayrollAction(body.action || "payroll.update"));
}
