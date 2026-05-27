import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { announcements, employees } from "@/db/schema";
import {
  formatAnnouncementAudience,
  getAnnouncementDepartmentBreakdown,
  getAnnouncementReadPercent,
  isAnnouncementActive,
  matchesAnnouncementAudience,
  parseAnnouncementAttachments,
  stringifyAnnouncementAttachments,
  normalizeAnnouncementStatus,
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
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const annId = Number.parseInt(id, 10);
    if (Number.isNaN(annId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [item, companyEmployees, employee] = await Promise.all([
      db.query.announcements.findFirst({
        where: and(
          eq(announcements.id, annId),
          eq(announcements.companyId, ctx.companyId),
        ),
        with: {
          reads: {
            with: {
              employee: true,
            },
          },
        },
      }),
      db.query.employees.findMany({
        where: and(
          eq(employees.companyId, ctx.companyId),
          eq(employees.status, "active"),
        ),
      }),
      db.query.employees.findFirst({
        where: eq(employees.id, ctx.employeeId),
      }),
    ]);

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const canManageAnnouncements = hasPermission(
      session.role,
      "manage_notifications",
    );
    if (!canManageAnnouncements && !matchesAnnouncementAudience(item, employee)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const reads = (item.reads ?? []) as AnnouncementReadWithEmployee[];
    const isRead = reads.some((read) => read.employeeId === ctx.employeeId);
    const analytics = canManageAnnouncements
      ? {
          totalViews: item.viewsCount ?? 0,
          uniqueReaders: item.uniqueReaders ?? 0,
          readPercent: getAnnouncementReadPercent(
            item.uniqueReaders ?? 0,
            companyEmployees.length,
          ),
          departmentBreakdown: getAnnouncementDepartmentBreakdown(reads),
        }
      : undefined;

    return NextResponse.json({
      ...item,
      status: normalizeAnnouncementStatus(item),
      attachments: parseAnnouncementAttachments(item.attachments),
      audienceLabel: formatAnnouncementAudience(item),
      isRead,
      isUnread: !isRead,
      analytics,
    });
  } catch (error) {
    console.error("[Announcement GET Error]", error);
    return NextResponse.json(
      { error: "Failed to load announcement" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const annId = Number.parseInt(id, 10);
    if (Number.isNaN(annId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
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
    console.error("[Announcement PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const annId = Number.parseInt(id, 10);
    if (Number.isNaN(annId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
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
    console.error("[Announcement DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 },
    );
  }
}
