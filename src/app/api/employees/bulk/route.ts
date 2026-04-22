import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees, onboardingCases } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    // Guest Mode: Authentication disabled
    const userId = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";

    const body = await req.json();
    const { employees: employeesData } = body;

    if (!Array.isArray(employeesData) || employeesData.length === 0) {
      return NextResponse.json({ error: "No employee data provided" }, { status: 400 });
    }

    console.log(`[Bulk Import] Importing ${employeesData.length} employees`);

    // We'll do this in a simple loop for now, or a transaction if we wanted it to be atomic
    const results = [];
    for (const emp of employeesData) {
      try {
        const [newEmployee] = await db.insert(employees).values({
          firstName: emp.firstName,
          lastName: emp.lastName || null,
          email: emp.email,
          jobTitle: emp.jobTitle || null,
          department: emp.department || null,
          employmentType: emp.employmentType?.toLowerCase() || 'full-time',
          locationType: emp.locationType || 'Remote',
          salary: emp.salary || null,
          status: 'onboarding',
          startDate: emp.startDate || null,
        }).returning();

        // Create onboarding case
        await db.insert(onboardingCases).values({
          employeeId: newEmployee.id,
          status: "Active",
          startDate: emp.startDate || null,
        });

        results.push(newEmployee);
      } catch (err) {
        console.error(`[Bulk Import] Failed to import employee ${emp.email}:`, err);
        // Continue with others
      }
    }

    return NextResponse.json({ 
      message: `Successfully imported ${results.length} out of ${employeesData.length} employees`,
      count: results.length 
    });

  } catch (error: any) {
    console.error("[Bulk Import Error]", error);
    return NextResponse.json({ error: "Failed to perform bulk import" }, { status: 500 });
  }
}
