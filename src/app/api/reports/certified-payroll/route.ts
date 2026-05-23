import { NextResponse } from "next/server";

interface CertifiedPayrollSetupRequest {
  contractName?: string;
  contractNumber?: string;
  contractingAgency?: string;
  projectLocation?: string;
  weekEnding?: string;
  contractorName?: string;
  contractorAddress?: string;
  contractorType?: "prime" | "subcontractor";
  wageDeterminationNo?: string;
  isFinalPayroll?: boolean;
  adminSigner?: string;
  adminTitle?: string;
}

const certifiedPayrollHistory = [
  {
    id: "cp-001",
    contractName: "Federal Courthouse HQ Renovations",
    contractNumber: "DOJ-FX-9921",
    contractingAgency: "Department of Justice",
    projectLocation: "123 Justice Ave, Washington, DC 20001",
    contractorName: "CircleWorks Inc.",
    contractorAddress: "100 Market St, San Francisco, CA 94105",
    contractorType: "prime",
    wageDeterminationNo: "DC20250012 Rev. 4",
    isFinalPayroll: false,
    weekEnding: "2026-03-24",
    payrollNo: 1,
    status: "Submitted",
    generatedAt: "2026-03-25T15:12:00.000Z",
  },
  {
    id: "cp-002",
    contractName: "Federal Courthouse HQ Renovations",
    contractNumber: "DOJ-FX-9921",
    contractingAgency: "Department of Justice",
    projectLocation: "123 Justice Ave, Washington, DC 20001",
    contractorName: "CircleWorks Inc.",
    contractorAddress: "100 Market St, San Francisco, CA 94105",
    contractorType: "prime",
    wageDeterminationNo: "DC20250012 Rev. 4",
    isFinalPayroll: false,
    weekEnding: "2026-03-31",
    payrollNo: 2,
    status: "Draft",
    generatedAt: "2026-04-01T14:05:00.000Z",
  },
  {
    id: "cp-003",
    contractName: "HUD Seismic Retrofit",
    contractNumber: "HUD-BLDG-11A",
    contractingAgency: "Department of Housing and Urban Development",
    projectLocation: "410 7th St SW, Washington, DC 20410",
    contractorName: "CircleWorks Inc.",
    contractorAddress: "100 Market St, San Francisco, CA 94105",
    contractorType: "subcontractor",
    wageDeterminationNo: "DC20250008 Rev. 2",
    isFinalPayroll: false,
    weekEnding: "2026-04-05",
    payrollNo: 12,
    status: "Submitted",
    generatedAt: "2026-04-06T16:40:00.000Z",
  },
];

function nextPayrollNumber(contractNumber: string) {
  const matchingPayrolls = certifiedPayrollHistory
    .filter((item) => item.contractNumber === contractNumber)
    .map((item) => item.payrollNo);

  return (Math.max(0, ...matchingPayrolls) || 0) + 1;
}

export async function GET() {
  return NextResponse.json({
    reportType: "Certified Payroll (Davis-Bacon)",
    output: "DOL WH-347 PDF",
    history: certifiedPayrollHistory,
  });
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as CertifiedPayrollSetupRequest;
    const contractNumber = data.contractNumber?.trim();

    if (!data.contractName || !contractNumber || !data.contractingAgency || !data.projectLocation || !data.weekEnding) {
      return NextResponse.json(
        { error: "contractName, contractNumber, contractingAgency, projectLocation, and weekEnding are required" },
        { status: 400 },
      );
    }

    const payrollNo = nextPayrollNumber(contractNumber);
    const report = {
      id: `cp-draft-${contractNumber.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${payrollNo}`,
      reportType: "Certified Payroll (Davis-Bacon)",
      contractName: data.contractName,
      contractNumber,
      contractingAgency: data.contractingAgency,
      projectLocation: data.projectLocation,
      contractorName: data.contractorName?.trim() || "CircleWorks Inc.",
      contractorAddress: data.contractorAddress?.trim() || "100 Market St, San Francisco, CA 94105",
      contractorType: data.contractorType ?? "prime",
      wageDeterminationNo: data.wageDeterminationNo?.trim() || "TBD",
      isFinalPayroll: Boolean(data.isFinalPayroll),
      weekEnding: data.weekEnding,
      payrollNo,
      status: "Draft",
      generatedAt: new Date().toISOString(),
    };

    certifiedPayrollHistory.unshift(report);

    return NextResponse.json({
      success: true,
      message: "Certified payroll setup saved as draft",
      report,
    });
  } catch {
    return NextResponse.json({ error: "Failed to save certified payroll setup" }, { status: 500 });
  }
}
