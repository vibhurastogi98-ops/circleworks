import { NextResponse } from "next/server";
import { mockContributionReports, mockUnionPayrollCalcs } from "@/data/mockUnionPayroll";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reportId, format } = body;

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: "Missing required field: reportId" },
        { status: 400 }
      );
    }

    const report = mockContributionReports.find(r => r.id === reportId);
    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    // Filter calculations for this union
    const calcs = mockUnionPayrollCalcs.filter(
      c => c.unionAbbreviation === report.unionAbbreviation
    );

    // Build CSV header based on format
    const headers = format === "SAG-AFTRA CSV"
      ? "Union,Employee Name,SSN (masked),Gross Earnings,Hours Worked,Dues,Pension,H&W,Fringe"
      : format === "IATSE CSV"
        ? "Union,Employee Name,SSN (masked),Gross Earnings,Hours,Dues,Pension,Health & Welfare,Annuity,Vacation"
        : "Union,Employee Name,SSN,Earnings,Hours,Contributions";

    const rows = calcs.map(c =>
      `${c.unionAbbreviation},"${c.employeeName}",***-**-XXXX,${c.grossEarnings},${c.hoursWorked},${c.duesDeduction},${c.pensionContribution},${c.healthWelfareContribution},${c.fringeContribution}`
    );

    const csvContent = [headers, ...rows].join("\n");

    return NextResponse.json({
      success: true,
      reportId,
      format: format || report.exportFormat,
      csvContent,
      rowCount: calcs.length,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
