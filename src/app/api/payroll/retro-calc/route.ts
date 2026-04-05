import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, oldRate, newRate, rateType = "salary", periods } = body;

    if (!oldRate || !newRate || !periods) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine hourly rates for calculation
    const oldHourly = rateType === "salary" ? oldRate / 2080 : oldRate;
    const newHourly = rateType === "salary" ? newRate / 2080 : newRate;
    const diffHourly = newHourly - oldHourly;

    let totalDifference = 0;
    
    // (new_rate - old_rate) * hours_worked_in_period
    const calculatedPeriods = periods.map((p: { name: string; hoursWorked: number }) => {
      // For salary employees, we often simplify to a flat semi-monthly difference if hours aren't tracked
      // But we'll follow the exact prompt: (new - old) * hours
      
      // If it's a salary standard semi-monthly period (86.67 hours)
      const hours = p.hoursWorked || 86.67; 
      
      const oldGross = oldHourly * hours;
      const newGross = newHourly * hours;
      const diff = newGross - oldGross;

      totalDifference += diff;

      return {
        name: p.name,
        oldGross: Number(oldGross.toFixed(2)),
        newGross: Number(newGross.toFixed(2)),
        difference: Number(diff.toFixed(2))
      };
    });

    // Apply FICA + federal/state withholding on difference amount
    const taxes = {
      federal: Number((totalDifference * 0.22).toFixed(2)), // 22% Supplemental withholding rate
      ficaSS: Number((totalDifference * 0.062).toFixed(2)), // 6.2% FICA SS
      ficaMed: Number((totalDifference * 0.0145).toFixed(2)), // 1.45% FICA Med
      state: Number((totalDifference * 0.05).toFixed(2)) // ~5% State Tax Mock
    };

    const netRetroPay = Number(
      (totalDifference - taxes.federal - taxes.ficaSS - taxes.ficaMed - taxes.state).toFixed(2)
    );

    return NextResponse.json({
      success: true,
      originalRate: oldRate,
      newRate: newRate,
      totalDifference: Number(totalDifference.toFixed(2)),
      taxes,
      netRetroPay,
      periods: calculatedPeriods,
      // Metadata for off-cycle run type
      offCycleType: "retro_adjustment",
      paystubLineItem: "Retroactive Pay Adjustment"
    });
  } catch (error) {
    console.error("Retro calc error:", error);
    return NextResponse.json({ error: "Failed to calculate retro pay" }, { status: 500 });
  }
}
