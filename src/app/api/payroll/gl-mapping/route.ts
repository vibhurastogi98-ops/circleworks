import { NextResponse } from "next/server";
import { mockGLAccounts, mockPayrollComponents } from "@/data/mockGL";

export async function GET() {
  return NextResponse.json({
    success: true,
    provider: "QuickBooks Online",
    providers: [
      {
        name: "QuickBooks Online",
        source: "Chart of Accounts API",
        status: "connected",
      },
      {
        name: "Xero",
        source: "Chart of Accounts API",
        status: "available",
      },
      {
        name: "NetSuite",
        source: "CSV import format",
        status: "available",
      },
      {
        name: "Generic CSV",
        source: "User-defined column mapping",
        status: "available",
      },
    ],
    chartOfAccounts: mockGLAccounts,
    payrollComponents: mockPayrollComponents,
    templates: [
      {
        id: "tpl-default-payroll",
        name: "Default Payroll GL Mapping",
        isDefault: true,
        mappingCount: mockPayrollComponents.length,
        updatedAt: "2026-05-23T00:00:00.000Z",
      },
    ],
  });
}
