import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { tips, grossReceipts, allocMethod } = await request.json();

    if (!grossReceipts || !tips || tips.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const eightPercentThreshold = grossReceipts * 0.08;
    const totalDeclared = tips.reduce((sum: number, t: any) => sum + t.declaredTips, 0);

    const needsAllocation = totalDeclared < eightPercentThreshold;
    const shortfallAmount = needsAllocation ? eightPercentThreshold - totalDeclared : 0;

    // Simulate allocation calculations
    const updatedTips = tips.map((t: any) => {
      let allocatedAmount = 0;
      
      if (needsAllocation) {
        // Simple generic mock allocation logic if shortfall detected
        // In real life, allocation maps purely "hours worked" or "gross receipts specific to employee"
        if (allocMethod === "hours") {
          const totalHours = tips.reduce((sum: number, emp: any) => sum + emp.hoursWorked, 0);
          allocatedAmount = shortfallAmount * (t.hoursWorked / totalHours);
        } else {
           // fallback flat split
           allocatedAmount = shortfallAmount / tips.length;
        }
      }

      return {
        ...t,
        allocatedTips: Number(allocatedAmount.toFixed(2)),
        totalTips: Number((t.declaredTips + allocatedAmount).toFixed(2))
      };
    });

    return NextResponse.json({
      success: true,
      needsAllocation,
      eightPercentThreshold,
      totalDeclared,
      shortfallAmount,
      allocMethod,
      allocatedTips: updatedTips
    });

  } catch (error) {
    console.error("Form 8027 API error:", error);
    return NextResponse.json({ error: "Failed to generate Form 8027 data" }, { status: 500 });
  }
}
