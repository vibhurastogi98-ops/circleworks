import { db } from "@/db";
import { unions, unionContracts } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allUnions = await db.query.unions.findMany({
      with: {
        contracts: true,
      },
    });

    return NextResponse.json({
      success: true,
      unions: allUnions,
    });
  } catch (error) {
    console.error("Error fetching unions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unions from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, abbreviation, description, companyId } = body;

    if (!name || !companyId) {
      return NextResponse.json(
        { success: false, error: "Name and Company ID are required" },
        { status: 400 }
      );
    }

    const [newUnion] = await db
      .insert(unions)
      .values({
        name,
        abbreviation,
        description,
        companyId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      union: newUnion,
    });
  } catch (error) {
    console.error("Error creating union:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create union" },
      { status: 500 }
    );
  }
}
