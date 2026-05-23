import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { name, firm, email, phone } = body;
    const payrollClients = body.payrollClients ?? body.clients;
    
    if (!name || !firm || !email || !phone || !payrollClients) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // In a real application, you would save this to a database
    // and send notification emails.
    console.log("Partner application received:", {
      name,
      firm,
      email,
      phone,
      payrollClients,
    });
    
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
