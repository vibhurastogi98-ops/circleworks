import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  const employeeId = params.employeeId;

  // Mock employee data based on ID for demonstration
  const isCaliforniaEmployee = employeeId === "EMP-001" || employeeId === "1";
  
  const programs = isCaliforniaEmployee ? [
    {
      id: "ca-sdi",
      stateCode: "CA",
      programName: "SDI (State Disability Insurance)",
      status: "Eligible",
      rules: "Requires at least $300 in wages during base period.",
      balance: "52 weeks max duration",
      accrued: "$1,620 weekly max benefit",
    },
    {
      id: "ca-pfl",
      stateCode: "CA",
      programName: "PFL (Paid Family Leave)",
      status: "Eligible",
      rules: "Covered by SDI contributions. Valid for 8 weeks.",
      balance: "8 weeks available",
      accrued: "$1,620 weekly max benefit",
    }
  ] : [
    {
      id: "ny-pfl",
      stateCode: "NY",
      programName: "PFL (Paid Family Leave)",
      status: "Eligible",
      rules: "Requires 26 consecutive weeks of employment.",
      balance: "12 weeks max duration",
      accrued: "$1,151.16 weekly max benefit",
    }
  ];

  return NextResponse.json({
    employeeId,
    name: isCaliforniaEmployee ? "Jane Doe" : "John Smith",
    ptoBalance: 120, // hours
    programs,
    recentRequests: [
      {
        id: "REQ-001",
        date: "2026-03-15",
        type: "Parental Leave",
        suggestion: `This may qualify for ${isCaliforniaEmployee ? "CA PFL" : "NY PFL"} — apply?`,
      }
    ]
  });
}
