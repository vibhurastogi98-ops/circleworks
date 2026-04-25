import { db } from "@/db";
import { contactRequests } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, companySize, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await db.insert(contactRequests).values({
      name,
      email,
      companySize,
      message,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Contact API Error]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
