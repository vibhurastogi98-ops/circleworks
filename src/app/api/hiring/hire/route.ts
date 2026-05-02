import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
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
import { eq, or, ilike } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { dispatchWebhook } from "@/lib/webhooks";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.userId;

    const body = await req.json();
    const { 
      candidateId, 
      offerId, 
      ignoreDuplicate = false,
      overrides = {} 
    } = body;

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

    // Ensure this flow is only used when offer is accepted / candidate can be moved to Hired.
    if (offer.status !== "Accepted") {
      return NextResponse.json(
        { error: "Offer must be accepted before moving candidate to Hired" },
        { status: 400 }
      );
    }

    if (!offer.jobId) {
      return NextResponse.json({ error: "Offer has no associated job" }, { status: 400 });
    }

    const [job] = await db
      .select()
      .from(atsJobs)
      .where(eq(atsJobs.id, offer.jobId as number));

    // Canonical mapped values (candidate/offer/job -> employee)
    const mappedFirstName = overrides.firstName || candidate.firstName;
    const mappedLastName = overrides.lastName || candidate.lastName;
    const mappedEmail = overrides.email || candidate.email;
    const mappedPhone = overrides.phone || candidate.phone;
    const mappedStartDate = overrides.startDate || offer.startDate;

    // Pre-flight checklist gate:
    // Required: name + email
    // Warnings: phone missing, start date missing
    const missingRequired: string[] = [];
    if (!mappedFirstName || !mappedLastName) missingRequired.push("name");
    if (!mappedEmail) missingRequired.push("email");

    const warnings: string[] = [];
    if (!mappedPhone) warnings.push("phone_missing");
    if (!mappedStartDate) warnings.push("start_date_not_confirmed");

    if (missingRequired.length > 0) {
      return NextResponse.json(
        {
          error: "PRE_FLIGHT_REQUIRED_FIELDS_MISSING",
          message: "Please update missing required fields before hiring",
          preflight: {
            required: ["name", "email"],
            missing: missingRequired,
            warnings,
          },
        },
        { status: 422 }
      );
    }

    // 2. DUPLICATE CHECK
    const finalEmail = mappedEmail;
    if (finalEmail && !ignoreDuplicate) {
      const existingEmployee = await db.query.employees.findFirst({
        where: or(
          ilike(employees.personalEmail, finalEmail),
          ilike(employees.email, finalEmail)
        ),
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
    const [currentUser] = userId
      ? await db
          .select({ companyId: employees.companyId })
          .from(users)
          .innerJoin(employees, eq(users.id, employees.userId))
          .where(eq(users.id, userId))
      : [];
    
    const companyId = currentUser?.companyId;
    if (!companyId) {
       return NextResponse.json({ error: "User or company not found" }, { status: 400 });
    }

    // 4. MAP FIELDS & CREATE EMPLOYEE (Canonical Mapping with Overrides)
    const [newEmployee] = await db.insert(employees).values({
      companyId: companyId,
      firstName: mappedFirstName,
      lastName: mappedLastName,
      personalEmail: finalEmail,
      personalPhone: mappedPhone,
      // employee.compensation.annualSalary maps to the current salary column in this schema.
      salary: offer.salary,
      startDate: mappedStartDate,
      jobTitle: offer.title || job?.title,
      departmentId: offer.departmentId,
      locationId: offer.locationId,
      employmentType: offer.employmentType,
      managerId: job?.managerId,
      status: 'pre_boarding',
    }).returning();

    // 5. TRIGGER ONBOARDING TEMPLATE ASSIGNMENT
    const [template] = await db
      .select({ id: onboardingTemplates.id })
      .from(onboardingTemplates)
      .where(eq(onboardingTemplates.companyId, companyId))
      .limit(1);

    const [onboardingCase] = await db.insert(onboardingCases).values({
      employeeId: newEmployee.id,
      candidateId: candidate.id,
      templateId: template?.id || null,
      startDate: mappedStartDate,
      status: "Active",
    }).returning();

    // 6. UPDATE CANDIDATE STAGE
    await db.update(atsCandidates)
      .set({ stage: 'Hired' })
      .where(eq(atsCandidates.id, candidate.id));

    // 7. EMIT WS: 'employee.auto_created_from_ats'
    // @ts-ignore - global.io is attached in custom server
    if (global.io) {
      // @ts-ignore
      global.io.to(`company:${companyId}`).emit('employee.auto_created_from_ats', { 
        employeeId: newEmployee.id, 
        candidateId: candidate.id 
      });
    }

    // 8. DISPATCH WEBHOOK: 'employee.auto_created_from_ats'
    await dispatchWebhook("employee.auto_created_from_ats", {
      employeeId: newEmployee.id,
      candidateId: candidate.id,
      companyId: companyId,
      firstName: mappedFirstName,
      lastName: mappedLastName,
      personalEmail: finalEmail,
      startDate: mappedStartDate,
      timestamp: new Date().toISOString()
    });

    // 9. SEND PRE-BOARDING INVITE (Template #28)
    if (finalEmail) {
      await sendEmail({
        to: finalEmail,
        subject: `Welcome to the team, ${mappedFirstName}!`,
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1e293b; font-size: 24px; font-weight: 700; margin: 0;">Welcome to CircleWorks!</h1>
            </div>
            
            <p style="color: #475569; font-size: 16px; line-height: 24px;">Hi ${mappedFirstName},</p>
            
            <p style="color: #475569; font-size: 16px; line-height: 24px;">We're thrilled to officially welcome you to the team! You've been hired as our new <strong>${offer.title || job?.title}</strong>.</p>
            
            <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; margin: 32px 0;">
              <h3 style="color: #1e293b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 16px 0;">Joining Details</h3>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <p style="color: #64748b; font-size: 14px; margin: 0;"><strong>Start Date:</strong> ${mappedStartDate}</p>
                <p style="color: #64748b; font-size: 14px; margin: 0;"><strong>Employment:</strong> ${offer.employmentType || 'Full-Time'}</p>
              </div>
            </div>
            
            <p style="color: #475569; font-size: 16px; line-height: 24px;">To make your first day as smooth as possible, we've set up a pre-boarding portal for you to complete some initial paperwork and get to know the team.</p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/welcome/${onboardingCase.id}" 
                 style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -1px rgba(37, 99, 235, 0.06);">
                Start Your Onboarding
              </a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
            
            <p style="color: #94a3b8; font-size: 13px; line-height: 20px; text-align: center;">
              If you have any questions before your first day, please don't hesitate to reach out to our HR department.
            </p>
          </div>
        `
      });
    }

    return NextResponse.json({
      success: true,
      employeeId: newEmployee.id,
      message: `Employee created and pre-boarding invitation sent to ${finalEmail}`
    });

  } catch (error: any) {
    console.error("[Hiring Hire Error]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
