import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { employeeDocuments, users } from "@/db/schema";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      with: {
        employees: true,
      },
    });

    const employee = user?.employees?.[0];
    if (!employee) {
      return NextResponse.json(
        { error: "Employee record not found" },
        { status: 404 },
      );
    }

    const savedDocuments = await db.query.employeeDocuments.findMany({
      where: eq(employeeDocuments.employeeId, employee.id),
    });

    const documents = savedDocuments.map((document) => ({
      id: `DB-${document.id}`,
      name: document.name,
      type: document.type,
      category: document.type === "Tax Form" ? "Tax Forms" : "Employee Files",
      uploadedBy: "CircleWorks",
      uploadedAt: document.createdAt || new Date().toISOString(),
      status: document.status || "Read",
      fileSize: document.fileUrl?.startsWith("data:application/pdf")
        ? "Generated PDF"
        : "File",
      fileUrl: document.fileUrl,
    }));

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("[Employee Documents GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}
