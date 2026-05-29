import { NextRequest, NextResponse } from "next/server";

import { getPayrollTrend } from "@/lib/dashboard-data";

export async function GET(request: NextRequest) {
  const requestedMonths = Number(request.nextUrl.searchParams.get("months") || 12);
  const months = Number.isFinite(requestedMonths)
    ? Math.min(Math.max(Math.trunc(requestedMonths), 1), 24)
    : 12;

  return NextResponse.json({ months, data: getPayrollTrend(months) });
}
