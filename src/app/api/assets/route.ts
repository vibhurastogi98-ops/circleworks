import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, resolveUserContext } from "@/lib/session";

// GET — list assets for the authenticated user's company
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const ctx = await resolveUserContext(session);
    if (!ctx) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const allAssets = await db.query.assets.findMany({
      where: eq(assets.companyId, ctx.companyId),
      with: {
        assignments: {
          with: {
            employee: true,
          },
        },
      },
      orderBy: (assets, { desc }) => [desc(assets.createdAt)],
    });

    // Filter by status/type if provided
    let filtered = allAssets;
    if (status && status !== "all") {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (type && type !== "all") {
      filtered = filtered.filter((a) => a.type === type);
    }

    // Enrich with current assignee info
    const enriched = filtered.map((asset) => {
      const activeAssignment = asset.assignments?.find(
        (a: any) => a.status === "Active"
      );
      return {
        ...asset,
        assignedTo: activeAssignment?.employee
          ? `${activeAssignment.employee.firstName} ${activeAssignment.employee.lastName || ""}`
          : null,
        assignedToId: activeAssignment?.employeeId || null,
        activeAssignmentId: activeAssignment?.id || null,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error("[Assets GET Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

// POST — create new asset for the authenticated user's company
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

    const [newAsset] = await db
      .insert(assets)
      .values({
        name: body.name,
        type: body.type || "Laptop",
        serialNumber: body.serialNumber || null,
        status: body.status || "Available",
        purchaseDate: body.purchaseDate || null,
        value: body.value ? parseInt(body.value) : null,
        notes: body.notes || null,
        companyId: ctx.companyId,
      })
      .returning();

    return NextResponse.json(newAsset, { status: 201 });
  } catch (error: any) {
    console.error("[Assets POST Error]", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}
