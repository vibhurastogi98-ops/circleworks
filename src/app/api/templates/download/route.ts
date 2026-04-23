import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.firstName || !body.email || !body.companySize) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    // In a real application, this would:
    // 1. Add email to nurture sequence (e.g. Mailchimp, Hubspot)
    // 2. Generate a secure pre-signed download URL or send email with attachment.
    console.log("Template requested by:", body);

    return NextResponse.json({ 
      success: true, 
      downloadUrl: "#", // Mock download URL
      message: "Success! Your template is ready to download." 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
