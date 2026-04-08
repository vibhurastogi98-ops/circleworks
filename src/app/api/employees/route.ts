import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, employeeBankAccounts, onboardingCases } from "@/db/schema";
import { generateInviteToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";
import { desc, sql } from "drizzle-orm";
import { clerkClient, auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const allEmployees = await db.query.employees.findMany({
      orderBy: [desc(employees.createdAt)],
    });
    return NextResponse.json(allEmployees);
  } catch (error: any) {
    console.error("[Employees GET Error]", error);
    
    // Check for specific database connection errors
    if (error.code === 'ECONNREFUSED' || error.message?.includes('DATABASE_URL')) {
      return NextResponse.json({ 
        error: "Database Connection Error", 
        message: "The application could not connect to the database. Please ensure DATABASE_URL is set in .env.local and the database is running."
      }, { status: 503 }); // Service Unavailable
    }

    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: "Failed to fetch employees. Check server logs."
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. VALIDATION
    if (!body.firstName || !body.email) {
      return Response.json({ error: "First Name and Email are required" }, { status: 400 });
    }

    // 2. DATABASE INSERTION
    // We'll map the incoming body to the database schema
    const [newEmployee] = await db.insert(employees).values({
      firstName: body.firstName,
      lastName: body.lastName || null,
      email: body.email,
      companyId: body.companyId || null,
      jobTitle: body.jobTitle || null,
      department: body.department || null,
      location: body.location || null,
      locationType: body.locationType || "On-Site",
      avatar: body.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${body.firstName}&backgroundColor=transparent`,
      startDate: body.startDate || null,
      status: "onboarding",
      salary: body.compensation?.salary || body.salary || null,
    }).returning();

    // 2.2. SAVE BANKING INFO (If provided)
    if (body.bankInfo && body.bankInfo.bankName) {
      await db.insert(employeeBankAccounts).values({
        employeeId: newEmployee.id,
        bankName: body.bankInfo.bankName,
        routingNumber: body.bankInfo.routingNumber,
        accountNumberMasked: body.bankInfo.accountNumberMasked,
        isPrimary: true,
      });
    }
    
    // 2.3. CREATE ONBOARDING CASE
    await db.insert(onboardingCases).values({
      employeeId: newEmployee.id,
      status: "Active",
      startDate: body.startDate || null,
    });

    console.log(`[Database] Created employee and onboarding case for ID: ${newEmployee.id}`);

    // Return the inserted record as requested
    return Response.json(newEmployee);

  } catch (error: any) {
    console.error("EMPLOYEE CREATE ERROR:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

