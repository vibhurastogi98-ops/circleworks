import { NextResponse } from "next/server";
import { generateInviteToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";

// Context interface standard for App Router dynamic routes
interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: employeeId } = await context.params;
    const body = await req.json();
    const { email, firstName, companyName } = body;

    if (!employeeId || !email) {
      return NextResponse.json({ error: "Missing required employeeId or email payload" }, { status: 400 });
    }

    // 1. GENERATE NEW TOKEN (Existing valid tokens remain safe natively via JWT mechanics)
    const token = await generateInviteToken({ employeeId, email });
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const onboardLink = `${appUrl}/welcome/${token}`;

    // 2. CONSTRUCT REDUNDANT HTML TEMPLATE
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">Reminder: You're invited to join ${companyName || 'CircleWorks'}!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          Hi ${firstName || 'there'},<br><br>
          We're following up on your pre-boarding invitation. Please securely access your onboarding portal using the link below to get set up:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${onboardLink}" 
             style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Access Portal
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${onboardLink}" style="color: #2563eb;">${onboardLink}</a>
        </p>
      </div>
    `;

    // 3. TRIGGER POSTMARK
    await sendEmail({
      to: email,
      subject: `Reminder: Join ${companyName || 'the team'}`,
      html: htmlTemplate
    });

    return NextResponse.json({ 
      success: true, 
      message: "Resend invitation successfully dispatched",
    });

  } catch (error: any) {
    console.error("[Resend Invite API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
