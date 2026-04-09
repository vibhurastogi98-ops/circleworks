import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees, employeeBankAccounts, onboardingCases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

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
        ptoRequests: true,
        timesheets: true,
        documents: true,
        bankAccounts: true,
        onboardingCases: true,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const employeeId = parseInt(id);

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    // Check if employee exists
    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, employeeId),
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Delete related records first (due to foreign key constraints)
    await db.delete(employeeBankAccounts).where(eq(employeeBankAccounts.employeeId, employeeId));
    await db.delete(onboardingCases).where(eq(onboardingCases.employeeId, employeeId));

    // Delete the employee
    await db.delete(employees).where(eq(employees.id, employeeId));

    console.log(`[Employee DELETE] Successfully deleted employee with ID: ${employeeId}`);

    return NextResponse.json({ message: "Employee deleted successfully" });

  } catch (error: any) {
    console.error("[Employee DELETE Error]", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const employeeId = parseInt(id);

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const body = await req.json();
    console.log("[Employee PUT] Request body:", body);

    // Check if employee exists
    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, employeeId),
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Update employee data
    const updateData = {
      firstName: body.firstName,
      lastName: body.lastName || null,
      email: body.email,
      jobTitle: body.jobTitle || null,
      department: body.department || null,
      employmentType: body.employmentType || "full-time",
      locationType: body.locationType || "On-Site",
      salary: body.compensation?.salary || body.salary || null,
      updatedAt: new Date(),
    };

    console.log("[Employee PUT] Updating employee data:", updateData);

    const [updatedEmployee] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, employeeId))
      .returning();

    console.log("[Employee PUT] Successfully updated employee:", updatedEmployee);

    return NextResponse.json(updatedEmployee);

  } catch (error: any) {
    console.error("[Employee PUT Error]", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}
