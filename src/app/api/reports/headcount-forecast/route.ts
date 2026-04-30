import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const months = parseInt(searchParams.get("months") || "24", 10);
  const view = searchParams.get("view") || "total"; // "total", "department", "location"

  // Base state
  const currentHC = 150;
  let targetHC = 160;
  
  // Date calculation
  const now = new Date();
  const pastMonths = 12;
  const futureMonths = months - pastMonths;

  const data = [];

  // Generate historical data (past 12 months)
  let hc = currentHC - 20; // Start lower 12 months ago
  for (let i = pastMonths; i > 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const hires = Math.floor(Math.random() * 5);
    const attrition = Math.floor(Math.random() * 3);
    const endHC = hc + hires - attrition;
    const isPast = true;

    data.push({
      id: `m-${i}`,
      month: monthStr,
      date: date.toISOString(),
      type: "actual",
      startingHC: hc,
      hires,
      attrition,
      endingHC: endHC,
      targetHC: Math.floor(targetHC - i * 1.5),
      budgetDelta: 0,
      status: "On Track"
    });
    hc = endHC;
  }

  // Ensure current HC is synced
  hc = currentHC;

  // Next 12 months projection base (will be adjusted by UI inputs realistically, but API returns baseline)
  for (let i = 0; i < futureMonths; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const plannedHires = 3;
    const plannedAttrition = 1;
    const endHC = hc + plannedHires - plannedAttrition;
    targetHC = targetHC + (i % 3 === 0 ? 1 : 0);

    const budgetDelta = (targetHC - endHC) * 10000;
    let status = "On Track";
    if (endHC > targetHC) status = "Over Budget";
    else if (endHC < targetHC - 5) status = "Under Plan";

    data.push({
      id: `f-${i}`,
      month: monthStr,
      date: date.toISOString(),
      type: "projected",
      startingHC: hc,
      hires: plannedHires,
      attrition: plannedAttrition,
      endingHC: endHC,
      targetHC,
      budgetDelta,
      status,
    });
    hc = endHC;
  }

  // Budget impact data
  const budgetInfo = {
    currentRunRate: 15400000,
    projectedRunRate: 15400000 + (data[data.length - 1].endingHC - currentHC) * 110000,
    avgSalaryPerHire: 110000,
  };

  return NextResponse.json({
    data,
    budgetInfo,
    view
  });
}
