import { NextResponse } from "next/server";
import { getTimesheetHoursImport } from "@/lib/payroll/timesheet-import";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const useScheduledHoursForMissing = searchParams.get("missing") === "scheduled";
    const result = await getTimesheetHoursImport(id, { useScheduledHoursForMissing });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Payroll Time Import API Error]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
