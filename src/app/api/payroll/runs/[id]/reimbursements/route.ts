import { NextResponse } from "next/server";
import { getPayrollReimbursements } from "@/lib/payroll/reimbursements";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getPayrollReimbursements(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Payroll Reimbursements API Error]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
