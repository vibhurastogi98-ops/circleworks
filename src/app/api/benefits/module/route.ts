import { NextRequest, NextResponse } from "next/server";

import {
  applyBenefitsAction,
  getBenefitsModuleData,
  type BenefitsModuleScreen,
} from "@/lib/benefits-module-data";

const screens = new Set<BenefitsModuleScreen>([
  "overview",
  "plans",
  "enrollment",
  "oe",
  "qle",
  "401k",
  "cobra",
  "fsa-hsa",
  "life-disability",
]);

function getScreen(request: NextRequest): BenefitsModuleScreen {
  const screen = request.nextUrl.searchParams.get("screen") as BenefitsModuleScreen | null;
  return screen && screens.has(screen) ? screen : "overview";
}

export async function GET(request: NextRequest) {
  const screen = getScreen(request);
  const employeeId = request.nextUrl.searchParams.get("employeeId") || undefined;

  return NextResponse.json({
    screen,
    data: getBenefitsModuleData(screen, employeeId),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { action?: string };
  return NextResponse.json(applyBenefitsAction(body.action || "benefits.action"));
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { action?: string };
  return NextResponse.json(applyBenefitsAction(body.action || "benefits.update"));
}
