import { NextResponse } from "next/server";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

interface CertifiedPayrollWorker {
  id: number;
  name: string;
  ssnLast4: string;
  classification: string;
  hoursByDay: Record<DayKey, number>;
  hourlyRate: number;
  withholding: number;
  deductions: number;
}

interface GenerateWh347Request {
  contractName?: string;
  contractNumber?: string;
  contractingAgency?: string;
  projectLocation?: string;
  weekEnding?: string;
  payrollNo?: number;
  adminSigner?: string;
  adminTitle?: string;
  workers?: CertifiedPayrollWorker[];
}

const dolWageDeterminations: Record<string, number> = {
  Carpenter: 39.2,
  Electrician: 48.5,
  Laborer: 25,
  Plumber: 42.75,
  "Heavy Equipment Operator": 44.6,
  Painter: 36.35,
};

function totalHours(hoursByDay: Record<DayKey, number>) {
  return Object.values(hoursByDay).reduce((sum, hours) => sum + Number(hours || 0), 0);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as GenerateWh347Request;

    if (!payload.contractName || !payload.contractNumber || !payload.contractingAgency || !payload.projectLocation || !payload.weekEnding || !payload.payrollNo) {
      return NextResponse.json(
        { error: "Contract setup fields and payrollNo are required to generate WH-347" },
        { status: 400 },
      );
    }

    if (!payload.workers?.length) {
      return NextResponse.json({ error: "At least one worker is required" }, { status: 400 });
    }

    let hasViolations = false;
    const validatedWorkers = payload.workers.map((worker) => {
      const prevailingWageRate = dolWageDeterminations[worker.classification] ?? 0;
      const isUnderpaid = worker.hourlyRate < prevailingWageRate;
      const hours = totalHours(worker.hoursByDay);
      const grossWages = Number((hours * worker.hourlyRate).toFixed(2));
      const totalDeductions = Number((worker.withholding + worker.deductions).toFixed(2));
      const netWages = Number((grossWages - totalDeductions).toFixed(2));

      if (isUnderpaid) hasViolations = true;

      return {
        ...worker,
        maskedSsn: `xxx-xx-${worker.ssnLast4}`,
        prevailingWageRate,
        isUnderpaid,
        totalHours: hours,
        grossWages,
        totalDeductions,
        netWages,
      };
    });

    const generatedAt = new Date().toISOString();
    const fileName = `WH-347-${payload.contractNumber}-${payload.payrollNo}-${payload.weekEnding}.pdf`;

    return NextResponse.json({
      success: true,
      reportType: "Certified Payroll (Davis-Bacon)",
      hasViolations,
      validatedWorkers,
      wageDeterminations: dolWageDeterminations,
      wh347: {
        form: "DOL WH-347",
        status: hasViolations ? "blocked_by_prevailing_wage_violation" : "ready_to_submit",
        fileName,
        mimeType: "application/pdf",
        generatedAt,
        fields: {
          contractorOrSubcontractor: "CircleWorks Inc.",
          contractName: payload.contractName,
          contractNumber: payload.contractNumber,
          contractingAgency: payload.contractingAgency,
          projectLocation: payload.projectLocation,
          weekEnding: payload.weekEnding,
          payrollNo: payload.payrollNo,
          employees: validatedWorkers.map((worker) => ({
            name: worker.name,
            ssn: worker.maskedSsn,
            workClassification: worker.classification,
            hoursByDay: worker.hoursByDay,
            totalHours: worker.totalHours,
            rateOfPay: worker.hourlyRate,
            grossWages: worker.grossWages,
            withholding: worker.withholding,
            deductions: worker.deductions,
            netWages: worker.netWages,
          })),
          statementOfCompliance: {
            signerName: payload.adminSigner ?? "Alex HR Admin",
            signerTitle: payload.adminTitle ?? "HR Director",
            eSignatureStatus: hasViolations ? "blocked" : "e-signed",
            signedAt: hasViolations ? null : generatedAt,
          },
        },
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate WH-347 data" }, { status: 500 });
  }
}
