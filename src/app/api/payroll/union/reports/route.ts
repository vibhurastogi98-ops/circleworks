import { NextResponse } from "next/server";
import {
  maskSsn,
  mockContributionReports,
  mockUnionEmployeeSsns,
  mockUnionPayrollCalcs,
} from "@/data/mockUnionPayroll";

function csvEscape(value: string | number) {
  const stringValue = String(value);
  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
}

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

    const selectedFormat = format || report.exportFormat;
    const headers =
      selectedFormat === "SAG-AFTRA CSV"
        ? [
            "Union Name",
            "Employee Name",
            "SSN",
            "Earnings",
            "Hours",
            "Union Dues",
            "Work Dues",
            "Pension Contribution",
            "Health & Welfare",
            "Fringe Contributions",
          ]
        : selectedFormat === "IATSE CSV"
          ? [
              "Local/Union",
              "Employee Name",
              "SSN",
              "Gross Earnings",
              "Hours",
              "Dues",
              "Pension",
              "Health & Welfare",
              "Annuity/Fringe",
              "Total Contributions",
            ]
          : [
              "Union Name",
              "Employee Name",
              "SSN",
              "Earnings",
              "Hours",
              "Employee Deductions",
              "Employer Contributions",
              "Total Contributions",
            ];

    const rows = calcs.map((calc) => {
      const ssn = maskSsn(mockUnionEmployeeSsns[calc.employeeName]);
      const totalContributions =
        calc.totalEmployeeDeductions + calc.totalEmployerContributions;
      const genericRow = [
        calc.unionAbbreviation,
        calc.employeeName,
        ssn,
        calc.grossEarnings,
        calc.hoursWorked,
        calc.totalEmployeeDeductions,
        calc.totalEmployerContributions,
        totalContributions,
      ];
      const detailedRow = [
        calc.unionAbbreviation,
        calc.employeeName,
        ssn,
        calc.grossEarnings,
        calc.hoursWorked,
        calc.duesDeduction,
        calc.workDuesDeduction,
        calc.pensionContribution,
        calc.healthWelfareContribution,
        calc.fringeContribution,
      ];
      const iatseRow = [
        calc.unionAbbreviation,
        calc.employeeName,
        ssn,
        calc.grossEarnings,
        calc.hoursWorked,
        calc.duesDeduction + calc.workDuesDeduction,
        calc.pensionContribution,
        calc.healthWelfareContribution,
        calc.fringeContribution,
        totalContributions,
      ];

      return (selectedFormat === "Generic CSV"
        ? genericRow
        : selectedFormat === "IATSE CSV"
          ? iatseRow
          : detailedRow
      )
        .map(csvEscape)
        .join(",");
    });

    const csvContent = [headers.map(csvEscape).join(","), ...rows].join("\n");

    return NextResponse.json({
      success: true,
      reportId,
      format: selectedFormat,
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
