import { NextResponse } from "next/server";

export async function GET() {
  // Mock history of previous WH-347 reports
  const history = [
    { id: "cp-001", contract: "DOJ-FX-9921", agency: "Department of Justice", weekEnding: "2026-03-24", payrollNo: 1, status: "Submitted" },
    { id: "cp-002", contract: "DOJ-FX-9921", agency: "Department of Justice", weekEnding: "2026-03-31", payrollNo: 2, status: "Draft" },
    { id: "cp-003", contract: "HUD-BLDG-11A", agency: "Housing and Urban Devel", weekEnding: "2026-04-05", payrollNo: 12, status: "Submitted" },
  ];

  return NextResponse.json({ history });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    return NextResponse.json({ success: true, message: "Saved as draft", data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
