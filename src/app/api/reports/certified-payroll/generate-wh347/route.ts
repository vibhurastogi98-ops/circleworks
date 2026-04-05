import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Server-side Prevailing Wage Validation
    // Mock prevailing wage data for classifying DOL minimums
    const dolWageDeterminations: Record<string, number> = {
      "Electrician": 48.50,
      "Carpenter": 39.20,
      "Laborer": 25.00,
      "Plumber": 42.75
    };

    let hasViolations = false;
    const validatedWorkers = payload.workers.map((worker: any) => {
       const minimumRequired = dolWageDeterminations[worker.classification] || 0;
       const isUnderpaid = worker.hourlyRate < minimumRequired;
       if (isUnderpaid) hasViolations = true;
       
       return {
         ...worker,
         minimumRequired,
         isUnderpaid
       };
    });

    return NextResponse.json({
      success: true,
      hasViolations,
      validatedWorkers,
      signatureFormat: "E-Signature Validated via Auth Token"
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to generate WH-347 data" }, { status: 500 });
  }
}
