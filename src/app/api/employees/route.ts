import { NextResponse } from "next/server";
import { generateInviteToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, companyName, startDate } = body;

    // 1. INPUT VALIDATION
    if (!email || !firstName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // -------------------------------------------------------------
    // 2. DATABASE CREATION LOGIC (Mocked out for this snippet)
    // -------------------------------------------------------------
    // e.g. const newEmployee = await db.insert(employees).values({ ... })
    const employeeId = `emp_${Math.random().toString(36).substr(2, 9)}`; 
    
    console.log(`[Database] Created employee record for: ${email} with ID: ${employeeId}`);

    // -------------------------------------------------------------
    // 3. GENERATE ONBOARDING SECURE TOKEN
    // -------------------------------------------------------------
    // Token embeds the employee ID directly, rendering DB Lookups unnecessary later.
    const token = await generateInviteToken({ employeeId, email });
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const onboardLink = `${appUrl}/welcome/${token}`;

    // -------------------------------------------------------------
    // 4. CONSTRUCT EMAIL TEMPLATE (CLEAN HTML)
    // -------------------------------------------------------------
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">You're invited to join ${companyName || 'CircleWorks'}!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          Hi ${firstName},<br><br>
          We are thrilled to welcome you to the team. To get started and set up your profile prior to your start date 
          (${startDate || "soon"}), please securely access your onboarding portal using the link below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${onboardLink}" 
             style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Start Onboarding
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${onboardLink}" style="color: #2563eb;">${onboardLink}</a>
        </p>
        <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
          This link is secure and will safely expire in 72 hours.
        </p>
      </div>
    `;

    // -------------------------------------------------------------
    // 5. ASYNC POSTMARK DISPATCH
    // -------------------------------------------------------------
    // Does NOT block the promise flow - will gracefully log errors via try/catch inside lib wrapper.
    await sendEmail({
      to: email,
      subject: `You're invited to join ${companyName || 'the team'}`,
      html: htmlTemplate
    });

    // 6. RETURN SUCCESS RESPONSE
    return NextResponse.json({ 
      success: true, 
      message: "Employee successfully created and email dispatched", 
      employee: { id: employeeId, email }
    });

  } catch (error: any) {
    console.error("[Employee API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
