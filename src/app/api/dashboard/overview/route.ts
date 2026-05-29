import { NextRequest, NextResponse } from "next/server";

import { getDashboardOverview } from "@/lib/dashboard-data";

export async function GET(request: NextRequest) {
  const companyId =
    request.nextUrl.searchParams.get("companyId") || "circleworks-demo";

  return NextResponse.json(getDashboardOverview(companyId));
}
