import { NextResponse } from "next/server";
import { getPayrollEwaRepayments } from "@/lib/payroll/ewa-repayments";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getPayrollEwaRepayments(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Payroll EWA API Error]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
