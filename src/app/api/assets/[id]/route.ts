import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assets, assetAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET — fetch single asset with full assignment history
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assetId = parseInt(id);

    if (isNaN(assetId)) {
      return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
    }

    const asset = await db.query.assets.findFirst({
      where: eq(assets.id, assetId),
      with: {
        assignments: {
          with: {
            employee: true,
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error: any) {
    console.error("[Asset GET Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 }
    );
  }
}

// PATCH — update asset details
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assetId = parseInt(id);
    const body = await req.json();

    if (isNaN(assetId)) {
      return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
    }

    const [updated] = await db
      .update(assets)
      .set({
        name: body.name,
        type: body.type,
        serialNumber: body.serialNumber,
        status: body.status,
        purchaseDate: body.purchaseDate || null,
        value: body.value != null ? parseInt(body.value) : null,
        notes: body.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(assets.id, assetId))
      .returning();

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[Asset PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

// DELETE — remove asset
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assetId = parseInt(id);

    if (isNaN(assetId)) {
      return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
    }

    // Delete assignments first
    await db
      .delete(assetAssignments)
      .where(eq(assetAssignments.assetId, assetId));

    // Delete asset
    await db.delete(assets).where(eq(assets.id, assetId));

    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error: any) {
    console.error("[Asset DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
