import { NextResponse } from "next/server";

type RetroPeriodInput = {
  name?: string;
  periodStart?: string;
  periodEnd?: string;
  hoursWorked?: number;
};

type RetroProcessingMode = "next_regular_run" | "off_cycle_run";

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function calculateTaxes(difference: number) {
  const federal = roundCurrency(difference * 0.22);
  const ficaSS = roundCurrency(difference * 0.062);
  const ficaMed = roundCurrency(difference * 0.0145);
  const state = roundCurrency(difference * 0.05);

  return {
    federal,
    ficaSS,
    ficaMed,
    state,
    total: roundCurrency(federal + ficaSS + ficaMed + state),
  };
}

function buildDefaultPeriods(effectiveDate: string): RetroPeriodInput[] {
  const effective = effectiveDate ? new Date(`${effectiveDate}T00:00:00`) : new Date();
  const periods: RetroPeriodInput[] = [];

  for (let index = 0; index < 3; index += 1) {
    const start = new Date(effective);
    start.setDate(start.getDate() + index * 14);
    const end = new Date(start);
    end.setDate(start.getDate() + 13);

    const periodStart = start.toISOString().slice(0, 10);
    const periodEnd = end.toISOString().slice(0, 10);

    periods.push({
      name: `${periodStart} to ${periodEnd}`,
      periodStart,
      periodEnd,
      hoursWorked: 86.67,
    });
  }

  return periods;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      employeeId,
      oldRate,
      newRate,
      rateType = "salary",
      effectiveDate,
      processingMode = "off_cycle_run",
    } = body as {
      employeeId?: string;
      oldRate?: number;
      newRate?: number;
      rateType?: "salary" | "hourly";
      effectiveDate?: string;
      processingMode?: RetroProcessingMode;
      periods?: RetroPeriodInput[];
    };
    const periods: RetroPeriodInput[] = Array.isArray(body.periods) && body.periods.length > 0
      ? body.periods
      : buildDefaultPeriods(effectiveDate ?? "");

    if (
      !employeeId ||
      typeof oldRate !== "number" ||
      typeof newRate !== "number" ||
      !effectiveDate ||
      periods.length === 0
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (oldRate <= 0 || newRate <= 0) {
      return NextResponse.json({ error: "Rates must be greater than zero" }, { status: 400 });
    }

    // Determine hourly rates for calculation
    const oldHourly = rateType === "salary" ? oldRate / 2080 : oldRate;
    const newHourly = rateType === "salary" ? newRate / 2080 : newRate;

    let totalDifference = 0;
    
    // (new_rate - old_rate) * hours_worked_in_period
    const calculatedPeriods = periods.map((p) => {
      const hours = p.hoursWorked || 86.67;
      
      const oldGross = oldHourly * hours;
      const newGross = newHourly * hours;
      const diff = newGross - oldGross;
      const taxesOnDiff = calculateTaxes(diff);

      totalDifference += diff;

      return {
        name: p.name || `${p.periodStart} to ${p.periodEnd}`,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        hoursWorked: hours,
        oldGross: roundCurrency(oldGross),
        newGross: roundCurrency(newGross),
        difference: roundCurrency(diff),
        taxesOnDiff,
      };
    });

    // Apply FICA + federal/state withholding on difference amount
    const taxes = calculateTaxes(totalDifference);

    const netRetroPay = Number(
      (totalDifference - taxes.total).toFixed(2)
    );

    const totalDifferenceRounded = roundCurrency(totalDifference);

    return NextResponse.json({
      success: true,
      employeeId,
      originalRate: oldRate,
      newRate: newRate,
      effectiveDate,
      totalDifference: totalDifferenceRounded,
      taxes,
      netRetroPay,
      periods: calculatedPeriods,
      offCycleRun: {
        type: "retro_adjustment",
        processingMode,
        status: processingMode === "next_regular_run" ? "queued_for_next_regular_run" : "ready_to_process",
        employeeId,
        grossAmount: totalDifferenceRounded,
        netAmount: netRetroPay,
        earningsLines: [
          {
            label: "Retroactive Pay Adjustment",
            amount: totalDifferenceRounded,
          },
        ],
      },
      paystubLineItem: {
        label: "Retroactive Pay Adjustment",
        amount: totalDifferenceRounded,
      },
      auditLog: {
        action: "retro_pay_calculated",
        entityType: "payroll_run",
        employeeId,
        originalPeriods: calculatedPeriods.map((period) => ({
          name: period.name,
          periodStart: period.periodStart,
          periodEnd: period.periodEnd,
          hoursWorked: period.hoursWorked,
        })),
        rateChange: {
          oldRate,
          newRate,
          effectiveDate,
        },
        calculatedAmount: totalDifferenceRounded,
        offCycleRunType: "retro_adjustment",
        paystubLineItem: "Retroactive Pay Adjustment",
        processingMode,
      },
    });
  } catch (error) {
    console.error("Retro calc error:", error);
    return NextResponse.json({ error: "Failed to calculate retro pay" }, { status: 500 });
  }
}
