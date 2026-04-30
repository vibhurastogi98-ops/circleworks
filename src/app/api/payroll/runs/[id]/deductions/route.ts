import { NextResponse } from "next/server";
import { getPayrollDeductions } from "@/lib/payroll/deductions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getPayrollDeductions(id);

    return NextResponse.json(result.deductions, {
      headers: {
        "X-Benefits-Changed-Employees": String(result.changedEmployeesCount),
        "X-Pay-Schedule": result.paySchedule,
      },
    });
  } catch (error: any) {
    console.error("[Payroll Deductions API Error]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
