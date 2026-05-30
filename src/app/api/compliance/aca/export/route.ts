import { aca1095CEmployees, acaEmployerSummary1094C } from "@/data/complianceModule";

export async function GET() {
  const rows = [
    ["Record Type", "Employee", "Employee ID", "Coverage Months", "Line 14", "Line 15", "Line 16", "Status"],
    ...aca1095CEmployees.map((employee) => [
      "1095-C",
      employee.employee,
      employee.employeeId,
      employee.coverageMonths,
      employee.line14,
      employee.line15,
      employee.line16,
      employee.status,
    ]),
    [
      "1094-C",
      acaEmployerSummary1094C.employer,
      acaEmployerSummary1094C.ein,
      "",
      String(acaEmployerSummary1094C.fullTimeEmployeeCount),
      String(acaEmployerSummary1094C.totalEmployeeCount),
      String(acaEmployerSummary1094C.total1095CForms),
      acaEmployerSummary1094C.aleMember ? "ALE" : "Non-ALE",
    ],
  ];

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="aca-1094c-1095c-export.csv"',
    },
  });
}
