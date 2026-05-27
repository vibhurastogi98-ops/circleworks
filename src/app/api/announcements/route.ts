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
import { hasPermission } from "@/lib/rbac";
import { getSession, resolveUserContext } from "@/lib/session";

type AnnouncementReadWithEmployee = {
  employeeId: number | null;
  employee?: {
    department?: string | null;
  } | null;
};

type AnnouncementWithReads = typeof announcements.$inferSelect & {
  reads?: AnnouncementReadWithEmployee[] | null;
};

function normalizeAnnouncementResponse(
  item: AnnouncementWithReads,
  employeeContext: {
    employeeId: number;
    department?: string | null;
    location?: string | null;
  } | null,
  employeeCount: number,
) {
  const status = normalizeAnnouncementStatus(item);
  const attachments = parseAnnouncementAttachments(item.attachments);
  const reads = item.reads ?? [];
  const isRead =
    !!employeeContext &&
    reads.some((read) => read.employeeId === employeeContext.employeeId);
  const departmentBreakdown = getAnnouncementDepartmentBreakdown(reads);

  return {
    ...item,
    status,
    attachments,
    audienceLabel: formatAnnouncementAudience(item),
    isRead,
    isUnread: !isRead,
    readPercent: getAnnouncementReadPercent(
      item.uniqueReaders ?? 0,
      employeeCount,
    ),
    analytics: {
      totalViews: item.viewsCount ?? 0,
      uniqueReaders: item.uniqueReaders ?? 0,
      readPercent: getAnnouncementReadPercent(
        item.uniqueReaders ?? 0,
        employeeCount,
      ),
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
    const allowedType =
      typeof attachment.type === "string" &&
      (attachment.type.startsWith("image/") ||
        attachment.type === "application/pdf");
    if (!allowedType) {
      return "Attachments must be a PDF or image.";
    }
    if (
      typeof attachment.size !== "number" ||
      attachment.size > 10 * 1024 * 1024
    ) {
      return "Attachments must be 10MB or smaller.";
    }
    if (
      typeof attachment.url !== "string" ||
      typeof attachment.name !== "string"
    ) {
      return "Attachment metadata is incomplete.";
    }
  }
  return null;
}

function getAnnouncementId(req: NextRequest, body?: any) {
  const fromQuery = req.nextUrl.searchParams.get("id");
  const raw = body?.id ?? body?.announcementId ?? fromQuery;
  const id = Number.parseInt(String(raw ?? ""), 10);
  return Number.isNaN(id) ? null : id;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await resolveUserContext(session);
    if (!ctx) {
      return NextResponse.json(
        { error: "Employee record not found" },
        { status: 404 },
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "All";
    const scope = searchParams.get("scope") || "employee";

    if (scope === "admin" && !hasPermission(session.role, "manage_notifications")) {
      return NextResponse.json(
        { error: "insufficient_permissions", required: "manage_notifications" },
        { status: 403 },
      );
    }

    const [employee, companyEmployees, items] = await Promise.all([
      db.query.employees.findFirst({
        where: eq(employees.id, ctx.employeeId),
      }),
      db.query.employees.findMany({
        where: and(
          eq(employees.companyId, ctx.companyId),
          eq(employees.status, "active"),
        ),
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
      .map((item) =>
        normalizeAnnouncementResponse(
          item,
          employee
            ? {
                employeeId: ctx.employeeId,
                department: employee.department,
                location: employee.location,
              }
            : null,
          companyEmployees.length,
        ),
      )
      .filter((item) =>
        scope === "admin" ? true : matchesAnnouncementAudience(item, employee),
      );

    const filtered = normalized.filter((item) => {
      if (filter === "Active") return item.status === "Published";
      if (filter === "Scheduled") return item.status === "Scheduled";
      if (filter === "Expired") return item.status === "Expired";
      return true;
    });

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("[Announcements GET Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 },
    );
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
      return NextResponse.json(
        { error: "Employee record not found" },
        { status: 404 },
      );
    }

    const body = await req.json();
    if (!hasPermission(session.role, "manage_notifications")) {
      return NextResponse.json(
        { error: "insufficient_permissions", required: "manage_notifications" },
        { status: 403 },
      );
    }

    const title = String(body.title ?? "").trim();
    const content = String(body.body ?? "").trim();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and body are required." },
        { status: 400 },
      );
    }
    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title must be 100 characters or fewer." },
        { status: 400 },
      );
    }

    const attachmentError = validateAttachmentPayload(body);
    if (attachmentError) {
      return NextResponse.json({ error: attachmentError }, { status: 400 });
    }

    const publishAt = body.publishAt ? new Date(body.publishAt) : null;
    const expireAt = body.expireAt ? new Date(body.expireAt) : null;
    const requestedStatus =
      body.status === "Draft"
        ? "Draft"
        : normalizeAnnouncementStatus({
            status: body.status ?? "Published",
            publishAt,
            expireAt,
          });

    const [announcement] = await db
      .insert(announcements)
      .values({
        companyId: ctx.companyId,
        title,
        body: content,
        audience: body.audience || "All Employees",
        department:
          body.audience === "By Department" || body.audience === "Custom Group"
            ? body.audienceValue || null
            : null,
        location:
          body.audience === "By Location" ? body.audienceValue || null : null,
        priority: body.priority || "Normal",
        status: requestedStatus,
        publishAt,
        expireAt,
        isPinned: !!body.isPinned,
        attachments: stringifyAnnouncementAttachments(
          Array.isArray(body.attachments) ? body.attachments : [],
        ),
      })
      .returning();

    if (isAnnouncementActive(announcement)) {
      recordCompanyRealtimeEvent(ctx.companyId, "announcement.published", {
        announcementId: announcement.id,
        title: announcement.title,
        priority: announcement.priority,
      });
    }

    return NextResponse.json(
      {
        ...announcement,
        status: normalizeAnnouncementStatus(announcement),
        attachments: parseAnnouncementAttachments(announcement.attachments),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Announcements POST Error]", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasPermission(session.role, "manage_notifications")) {
      return NextResponse.json(
        { error: "insufficient_permissions", required: "manage_notifications" },
        { status: 403 },
      );
    }

    const ctx = await resolveUserContext(session);
    if (!ctx) {
      return NextResponse.json(
        { error: "Employee record not found" },
        { status: 404 },
      );
    }

    const body = await req.json();
    const annId = getAnnouncementId(req, body);
    if (!annId) {
      return NextResponse.json(
        { error: "Announcement id is required." },
        { status: 400 },
      );
    }

    const title = String(body.title ?? "").trim();
    const content = String(body.body ?? "").trim();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and body are required." },
        { status: 400 },
      );
    }
    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title must be 100 characters or fewer." },
        { status: 400 },
      );
    }

    const attachmentError = validateAttachmentPayload(body);
    if (attachmentError) {
      return NextResponse.json({ error: attachmentError }, { status: 400 });
    }

    const publishAt = body.publishAt ? new Date(body.publishAt) : null;
    const expireAt = body.expireAt ? new Date(body.expireAt) : null;
    const nextStatus =
      body.status === "Draft"
        ? "Draft"
        : normalizeAnnouncementStatus({
            status: body.status ?? "Published",
            publishAt,
            expireAt,
          });

    const [updated] = await db
      .update(announcements)
      .set({
        title,
        body: content,
        audience: body.audience || "All Employees",
        department:
          body.audience === "By Department" || body.audience === "Custom Group"
            ? body.audienceValue || null
            : null,
        location:
          body.audience === "By Location" ? body.audienceValue || null : null,
        priority: body.priority || "Normal",
        status: nextStatus,
        publishAt,
        expireAt,
        isPinned: !!body.isPinned,
        attachments: stringifyAnnouncementAttachments(
          Array.isArray(body.attachments) ? body.attachments : [],
        ),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(announcements.id, annId),
          eq(announcements.companyId, ctx.companyId),
        ),
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (isAnnouncementActive(updated)) {
      recordCompanyRealtimeEvent(ctx.companyId, "announcement.published", {
        announcementId: updated.id,
        title: updated.title,
        priority: updated.priority,
      });
    }

    return NextResponse.json({
      ...updated,
      status: normalizeAnnouncementStatus(updated),
      attachments: parseAnnouncementAttachments(updated.attachments),
    });
  } catch (error) {
    console.error("[Announcements PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasPermission(session.role, "manage_notifications")) {
      return NextResponse.json(
        { error: "insufficient_permissions", required: "manage_notifications" },
        { status: 403 },
      );
    }

    const ctx = await resolveUserContext(session);
    if (!ctx) {
      return NextResponse.json(
        { error: "Employee record not found" },
        { status: 404 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const annId = getAnnouncementId(req, body);
    if (!annId) {
      return NextResponse.json(
        { error: "Announcement id is required." },
        { status: 400 },
      );
    }

    await db
      .delete(announcements)
      .where(
        and(
          eq(announcements.id, annId),
          eq(announcements.companyId, ctx.companyId),
        ),
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Announcements DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 },
    );
  }
}
