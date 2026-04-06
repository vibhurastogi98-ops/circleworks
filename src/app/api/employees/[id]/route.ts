import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employeeId = parseInt(id);

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, employeeId),
      with: {
        manager: true,
        subordinates: true,
        benefitEnrollments: {
          with: {
            plan: true
          }
        },
        ptoRequests: true,
        timesheets: true,
        documents: true,
        bankAccounts: true,
        payrollItems: {
          with: {
            payroll: true
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error("[Employee GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}
