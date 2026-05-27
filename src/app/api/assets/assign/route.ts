import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assets, assetAssignments, employees } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession, resolveUserContext } from "@/lib/session";

// POST — assign an asset to an employee
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await resolveUserContext(session);
    if (!ctx) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    const body = await req.json();
    const { assetId, employeeId, assignedBy, notes } = body;

    if (!assetId || !employeeId) {
      return NextResponse.json(
        { error: "assetId and employeeId are required" },
        { status: 400 }
      );
    }

    const parsedAssetId = parseInt(assetId);
    const parsedEmployeeId = parseInt(employeeId);

    if (Number.isNaN(parsedAssetId) || Number.isNaN(parsedEmployeeId)) {
      return NextResponse.json(
        { error: "assetId and employeeId must be numeric" },
        { status: 400 }
      );
    }

    const asset = await db.query.assets.findFirst({
      where: and(eq(assets.id, parsedAssetId), eq(assets.companyId, ctx.companyId)),
      with: {
        assignments: true,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const employee = await db.query.employees.findFirst({
      where: and(eq(employees.id, parsedEmployeeId), eq(employees.companyId, ctx.companyId)),
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const existingActiveAssignment = asset.assignments?.find((entry) => entry.status === "Active");
    if (existingActiveAssignment) {
      return NextResponse.json(
        { error: "Asset is already assigned" },
        { status: 409 }
      );
    }

    // Update asset status to Assigned
    await db
      .update(assets)
      .set({ status: "Assigned", updatedAt: new Date() })
      .where(and(eq(assets.id, parsedAssetId), eq(assets.companyId, ctx.companyId)));

    // Create assignment record
    const [assignment] = await db
      .insert(assetAssignments)
      .values({
        assetId: parsedAssetId,
        employeeId: parsedEmployeeId,
        assignedBy: assignedBy || String(session.userId),
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
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await resolveUserContext(session);
    if (!ctx) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    const body = await req.json();
    const { assignmentId } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { error: "assignmentId is required" },
        { status: 400 }
      );
    }

    // Find the assignment
    const parsedAssignmentId = parseInt(assignmentId);
    if (Number.isNaN(parsedAssignmentId)) {
      return NextResponse.json(
        { error: "assignmentId must be numeric" },
        { status: 400 }
      );
    }

    const assignment = await db.query.assetAssignments.findFirst({
      where: eq(assetAssignments.id, parsedAssignmentId),
      with: {
        asset: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (assignment.asset?.companyId !== ctx.companyId) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Mark assignment as Returned
    await db
      .update(assetAssignments)
      .set({
        status: "Returned",
        returnedAt: new Date(),
      })
      .where(eq(assetAssignments.id, parsedAssignmentId));

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
