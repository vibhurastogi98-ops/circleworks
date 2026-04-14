import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assets, assetAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST — assign an asset to an employee
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assetId, employeeId, assignedBy, notes } = body;

    if (!assetId || !employeeId) {
      return NextResponse.json(
        { error: "assetId and employeeId are required" },
        { status: 400 }
      );
    }

    // Update asset status to Assigned
    await db
      .update(assets)
      .set({ status: "Assigned", updatedAt: new Date() })
      .where(eq(assets.id, parseInt(assetId)));

    // Create assignment record
    const [assignment] = await db
      .insert(assetAssignments)
      .values({
        assetId: parseInt(assetId),
        employeeId: parseInt(employeeId),
        assignedBy: assignedBy || null,
        status: "Active",
        notes: notes || null,
      })
      .returning();

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    console.error("[Asset Assign POST Error]", error);
    return NextResponse.json(
      { error: "Failed to assign asset" },
      { status: 500 }
    );
  }
}

// PATCH — return an asset (mark assignment as Returned, set asset back to Available)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { assignmentId } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { error: "assignmentId is required" },
        { status: 400 }
      );
    }

    // Find the assignment
    const assignment = await db.query.assetAssignments.findFirst({
      where: eq(assetAssignments.id, parseInt(assignmentId)),
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Mark assignment as Returned
    await db
      .update(assetAssignments)
      .set({
        status: "Returned",
        returnedAt: new Date(),
      })
      .where(eq(assetAssignments.id, parseInt(assignmentId)));

    // Set asset back to Available
    await db
      .update(assets)
      .set({ status: "Available", updatedAt: new Date() })
      .where(eq(assets.id, assignment.assetId!));

    return NextResponse.json({ message: "Asset returned successfully" });
  } catch (error: any) {
    console.error("[Asset Return PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to return asset" },
      { status: 500 }
    );
  }
}
