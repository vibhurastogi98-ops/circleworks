import { NextResponse } from "next/server";
import { db } from "@/db";
import { 
  employees, 
  onboardingCases, 
  onboardingTemplates,
  atsCandidates, 
  atsOffers, 
  atsJobs,
  users
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { candidateId, offerId, ignoreDuplicate = false } = body;

    if (!candidateId || !offerId) {
      return NextResponse.json({ error: "Candidate ID and Offer ID are required" }, { status: 400 });
    }

    const cId = parseInt(candidateId);
    const oId = parseInt(offerId);

    if (isNaN(cId) || isNaN(oId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // 1. FETCH DATA
    const [candidate] = await db
      .select()
      .from(atsCandidates)
      .where(eq(atsCandidates.id, cId));

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    const [offer] = await db
      .select()
      .from(atsOffers)
      .where(eq(atsOffers.id, oId));

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (!offer.jobId) {
      return NextResponse.json({ error: "Offer has no associated job" }, { status: 400 });
    }

    const [job] = await db
      .select()
      .from(atsJobs)
      .where(eq(atsJobs.id, offer.jobId as number));

    // 2. DUPLICATE CHECK
    if (candidate.email && !ignoreDuplicate) {
      const existingEmployee = await db.query.employees.findFirst({
        where: eq(employees.personalEmail, candidate.email),
      });

      if (existingEmployee) {
        return NextResponse.json({ 
          error: "CONFLICT", 
          message: "Employee with this email exists — merge or create new?",
          existingEmployeeId: existingEmployee.id 
        }, { status: 409 });
      }
    }

    // 3. GET COMPANY ID
    const [currentUser] = await db
      .select({ companyId: employees.companyId })
      .from(users)
      .innerJoin(employees, eq(users.id, employees.userId))
      .where(eq(users.clerkUserId, clerkUserId));
    
    const companyId = currentUser?.companyId;
    if (!companyId) {
       return NextResponse.json({ error: "User or company not found" }, { status: 400 });
    }

    // 4. MAP FIELDS & CREATE EMPLOYEE
    // status per prompt: 'pre_boarding'
    
    const [newEmployee] = await db.insert(employees).values({
      companyId: companyId,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      personalEmail: candidate.email,
      personalPhone: candidate.phone,
      salary: offer.salary,
      startDate: offer.startDate,
      jobTitle: offer.title || job?.title,
      departmentId: offer.departmentId,
      locationId: offer.locationId,
      employmentType: offer.employmentType,
      managerId: job?.managerId,
      status: 'pre_boarding',
    }).returning();

    // 5. TRIGGER ONBOARDING TEMPLATE ASSIGNMENT
    // Search for any active template for this company
    const [template] = await db
      .select({ id: onboardingTemplates.id })
      .from(onboardingTemplates)
      .where(eq(onboardingTemplates.companyId, companyId))
      .limit(1);

    const [onboardingCase] = await db.insert(onboardingCases).values({
      employeeId: newEmployee.id,
      candidateId: candidate.id,
      templateId: template?.id || null, // Best esfuerzo to assign template
      startDate: offer.startDate,
      status: "Active",
    }).returning();

    // 6. UPDATE CANDIDATE STAGE
    await db.update(atsCandidates)
      .set({ stage: 'Hired' })
      .where(eq(atsCandidates.id, candidate.id));

    // 7. EMIT WS (Mocking as it requires Socket.io server logic usually in a custom server or pusher)
    // In a real local setup with Next.js Custom Server:
    // global.io?.to(`company:${companyId}`).emit('employee.auto_created_from_ats', { 
    //   employeeId: newEmployee.id, 
    //   candidateId: candidate.id 
    // });

    // 8. SEND PRE-BOARDING INVITE (Template #28)
    if (candidate.email) {
      await sendEmail({
        to: candidate.email,
        subject: `Welcome to the team, ${candidate.firstName}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #2563eb;">Welcome to CircleWorks!</h1>
            <p>Hi ${candidate.firstName},</p>
            <p>We're thrilled to have you join our team as <strong>${offer.title || job?.title}</strong>!</p>
            <p>Your journey with us begins on <strong>${offer.startDate}</strong>. To get things started, we've prepared a pre-boarding portal for you.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/welcome/${onboardingCase.id}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Start Your Onboarding</a>
            </div>
            <p>If you have any questions before your first day, don't hesitate to reach out.</p>
            <p>Best regards,<br/>The HR Team</p>
          </div>
        `
      });
    }

    return NextResponse.json({
      success: true,
      employeeId: newEmployee.id,
      message: `Employee created and pre-boarding invitation sent to ${candidate.email}`
    });

  } catch (error: any) {
    console.error("[Hiring Hire Error]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
