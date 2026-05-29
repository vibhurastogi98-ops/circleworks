import { NextRequest, NextResponse } from "next/server";

import {
  applyHrisAction,
  getHrisModuleData,
  type HrisModuleScreen,
} from "@/lib/hris-module-data";

const screens = new Set<HrisModuleScreen>([
  "directory",
  "new",
  "profile",
  "compensation",
  "benefits",
  "time",
  "documents",
  "payroll",
  "performance",
  "activity",
  "bulk",
  "org-chart",
]);

function getScreen(request: NextRequest): HrisModuleScreen {
  const screen = request.nextUrl.searchParams.get("screen") as HrisModuleScreen | null;
  return screen && screens.has(screen) ? screen : "directory";
}

export async function GET(request: NextRequest) {
  const screen = getScreen(request);
  const employeeId = request.nextUrl.searchParams.get("employeeId") || undefined;

  return NextResponse.json({
    screen,
    data: getHrisModuleData(screen, employeeId),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { action?: string };
  return NextResponse.json(applyHrisAction(body.action || "hris.action"));
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { action?: string };
  return NextResponse.json(applyHrisAction(body.action || "hris.update"));
}
