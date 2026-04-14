import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users, employees, employeeDocuments } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    // Find employee record based on clerk User ID
    const user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId),
      with: { employees: true }
    });

    if (!user || !user.employees || user.employees.length === 0) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    const employee = user.employees[0];

    // For demonstration, we simply record the submitted W4 in the database
    // In a real application, you might generate a PDF using a library like pdf-lib
    // and upload it to S3, saving the URL here.
    
    await db.insert(employeeDocuments).values({
      employeeId: employee.id,
      name: `W-4 Form - ${new Date().getFullYear()}`,
      type: 'W-4',
      fileUrl: '/mock-pdfs/w4-completed.pdf', // Placeholder
      status: 'Unread', // For admin review
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting W-4:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
