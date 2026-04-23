import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const { name, firm, email, phone, clients } = body;
    
    if (!name || !firm || !email || !phone || !clients) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // In a real application, you would save this to a database
    // and send notification emails.
    console.log("Partner application received:", body);
    
    return NextResponse.json(
      { message: "Application submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Partner application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
