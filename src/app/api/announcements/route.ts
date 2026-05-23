import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { announcements, employees } from "@/db/schema";
import {
  formatAnnouncementAudience,
  getAnnouncementDepartmentBreakdown,
  getAnnouncementReadPercent,
  isAnnouncementActive,
  matchesAnnouncementAudience,
  normalizeAnnouncementStatus,
  parseAnnouncementAttachments,
  stringifyAnnouncementAttachments,
} from "@/lib/announcements";
import { recordCompanyRealtimeEvent } from "@/lib/realtime-event-log";
import { getSession, resolveUserContext } from "@/lib/session";

function normalizeAnnouncementResponse(
  item: Awaited<ReturnType<typeof db.query.announcements.findMany>>[number],
  employeeContext: { employeeId: number; department?: string | null; location?: string | null } | null,
  employeeCount: number
) {
  const status = normalizeAnnouncementStatus(item);
  const attachments = parseAnnouncementAttachments(item.attachments);
  const isRead = !!employeeContext && item.reads.some((read) => read.employeeId === employeeContext.employeeId);
  const departmentBreakdown = getAnnouncementDepartmentBreakdown(item.reads);

  return {
    ...item,
    status,
    attachments,
    audienceLabel: formatAnnouncementAudience(item),
    isRead,
    isUnread: !isRead,
    readPercent: getAnnouncementReadPercent(item.uniqueReaders ?? 0, employeeCount),
    analytics: {
      totalViews: item.viewsCount ?? 0,
      uniqueReaders: item.uniqueReaders ?? 0,
      readPercent: getAnnouncementReadPercent(item.uniqueReaders ?? 0, employeeCount),
      departmentBreakdown,
    },
  };
}

function validateAttachmentPayload(body: any) {
  const attachments = Array.isArray(body.attachments) ? body.attachments : [];
  for (const attachment of attachments) {
    if (!attachment || typeof attachment !== "object") {
      return "Attachment payload is invalid.";
    }
    const allowedType = typeof attachment.type === "string" &&
      (attachment.type.startsWith("image/") || attachment.type === "application/pdf");
    if (!allowedType) {
      return "Attachments must be a PDF or image.";
    }
    if (typeof attachment.size !== "number" || attachment.size > 10 * 1024 * 1024) {
      return "Attachments must be 10MB or smaller.";
    }
    if (typeof attachment.url !== "string" || typeof attachment.name !== "string") {
      return "Attachment metadata is incomplete.";
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await resolveUserContext(session);
    if (!ctx) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "All";
    const scope = searchParams.get("scope") || "employee";

    const [employee, companyEmployees, items] = await Promise.all([
      db.query.employees.findFirst({
        where: eq(employees.id, ctx.employeeId),
      }),
      db.query.employees.findMany({
        where: and(eq(employees.companyId, ctx.companyId), eq(employees.status, "active")),
      }),
      db.query.announcements.findMany({
        where: eq(announcements.companyId, ctx.companyId),
        orderBy: [desc(announcements.createdAt)],
        with: {
          reads: {
            with: {
              employee: true,
            },
          },
        },
      }),
    ]);

    const normalized = items
      .map((item) => normalizeAnnouncementResponse(item, employee ? {
        employeeId: ctx.employeeId,
        department: employee.department,
        location: employee.location,
      } : null, companyEmployees.length))
      .filter((item) => scope === "admin" ? true : matchesAnnouncementAudience(item, employee));

    const filtered = normalized.filter((item) => {
      if (filter === "Active") return item.status === "Published";
      if (filter === "Scheduled") return item.status === "Scheduled";
      if (filter === "Expired") return item.status === "Expired";
      return true;
    });

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("[Announcements GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await resolveUserContext(session);
    if (!ctx) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const content = String(body.body ?? "").trim();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and body are required." }, { status: 400 });
    }
    if (title.length > 100) {
      return NextResponse.json({ error: "Title must be 100 characters or fewer." }, { status: 400 });
    }

    const attachmentError = validateAttachmentPayload(body);
    if (attachmentError) {
      return NextResponse.json({ error: attachmentError }, { status: 400 });
    }

    const publishAt = body.publishAt ? new Date(body.publishAt) : null;
    const expireAt = body.expireAt ? new Date(body.expireAt) : null;
    const requestedStatus = body.status === "Draft" ? "Draft" : normalizeAnnouncementStatus({
      status: body.status ?? "Published",
      publishAt,
      expireAt,
    });

    const [announcement] = await db.insert(announcements).values({
      companyId: ctx.companyId,
      title,
      body: content,
      audience: body.audience || "All Employees",
      department: body.audience === "By Department" || body.audience === "Custom Group" ? body.audienceValue || null : null,
      location: body.audience === "By Location" ? body.audienceValue || null : null,
      priority: body.priority || "Normal",
      status: requestedStatus,
      publishAt,
      expireAt,
      isPinned: !!body.isPinned,
      attachments: stringifyAnnouncementAttachments(Array.isArray(body.attachments) ? body.attachments : []),
    }).returning();

    if (isAnnouncementActive(announcement)) {
      recordCompanyRealtimeEvent(ctx.companyId, "announcement.published", {
        announcementId: announcement.id,
        title: announcement.title,
        priority: announcement.priority,
      });
    }

    return NextResponse.json({
      ...announcement,
      status: normalizeAnnouncementStatus(announcement),
      attachments: parseAnnouncementAttachments(announcement.attachments),
    }, { status: 201 });
  } catch (error) {
    console.error("[Announcements POST Error]", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
