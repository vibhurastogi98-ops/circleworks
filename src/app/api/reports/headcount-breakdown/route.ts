import { NextResponse } from "next/server";

import { getHeadcountBreakdown } from "@/lib/dashboard-data";

export async function GET() {
  return NextResponse.json({ data: getHeadcountBreakdown() });
}
