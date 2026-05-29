import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    employeeId?: string;
    medicalPlanId?: string;
  };

  if (!body.employeeId || !body.medicalPlanId) {
    return NextResponse.json(
      { ok: false, error: "Employee and medical plan are required." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    enrollmentId: `ben-enr-${body.employeeId}-${Date.now()}`,
    payrollDeductionUpdate: "queued",
    carrierSync: "pending next nightly file",
    submittedAt: new Date().toISOString(),
  });
}
