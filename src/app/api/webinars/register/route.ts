import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.name || !body.email) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 });
    }

    // In a real application, this would save to a database and trigger an email.
    console.log("Registered for webinar:", body);
    
    return NextResponse.json({ 
      success: true, 
      message: "Registration successful. You will receive a confirmation email shortly." 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
