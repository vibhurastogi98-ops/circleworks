import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { generateInviteToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allEmployees = await db.query.employees.findMany({
      orderBy: [desc(employees.createdAt)],
    });
    return NextResponse.json(allEmployees);
  } catch (error: any) {
    console.error("[Employees GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      firstName, 
      lastName, 
      email, 
      companyName, 
      startDate, 
      companyId,
      jobTitle,
      department,
      location,
      locationType,
      avatar 
    } = body;

    // 1. INPUT VALIDATION
    if (!email || !firstName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // -------------------------------------------------------------
    // 2. DATABASE CREATION LOGIC
    // -------------------------------------------------------------
    const [newEmployee] = await db.insert(employees).values({
      firstName,
      lastName: lastName || null,
      email,
      companyId: companyId || null,
      jobTitle: jobTitle || null,
      department: department || null,
      location: location || null,
      locationType: locationType || "On-Site",
      avatar: avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${firstName}&backgroundColor=transparent`,
      startDate: startDate || null,
      status: "onboarding",
    }).returning();

    const employeeId = newEmployee.id.toString();
    
    console.log(`[Database] Created employee record for: ${email} with ID: ${employeeId}`);

    // -------------------------------------------------------------
    // 3. GENERATE ONBOARDING SECURE TOKEN
    // -------------------------------------------------------------
    const token = await generateInviteToken({ employeeId, email });
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const onboardLink = `${appUrl}/welcome/${token}`;

    // -------------------------------------------------------------
    // 4. CONSTRUCT EMAIL TEMPLATE
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
      </div>
    `;

    // -------------------------------------------------------------
    // 5. ASYNC POSTMARK DISPATCH
    // -------------------------------------------------------------
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
