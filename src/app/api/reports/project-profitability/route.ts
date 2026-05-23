import { NextResponse } from "next/server";
import {
  buildProjectProfitabilityRows,
  buildProjectWaterfall,
  exportProjectProfitabilityCsv,
} from "@/data/mockProjectAllocation";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  const rows = buildProjectProfitabilityRows();

  if (format === "csv") {
    return new Response(exportProjectProfitabilityCsv(rows), {
      headers: {
        "Content-Type": "text/csv;charset=utf-8",
        "Content-Disposition": 'attachment; filename="project-profitability.csv"',
      },
    });
  }

  return NextResponse.json({
    meta: {
      generatedAt: new Date().toISOString(),
      formula: "(employee gross pay / total hours) x hours per project = project cost",
    },
    data: rows,
    waterfall: buildProjectWaterfall(rows),
  });
}
