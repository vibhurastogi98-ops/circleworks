export type AnnouncementStatus = "Draft" | "Scheduled" | "Published" | "Expired";

export type AnnouncementAudience =
  | "All Employees"
  | "By Department"
  | "By Location"
  | "Custom Group";

export type AnnouncementPriority = "Normal" | "Important" | "Urgent";

export type AnnouncementAttachment = {
  name: string;
  type: string;
  size: number;
  url: string;
};

type EmployeeLike = {
  id?: number | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  department?: string | null;
  location?: string | null;
};

type ReadLike = {
  employee?: EmployeeLike | null;
  employeeId?: number | null;
};

type AnnouncementLike = {
  status?: string | null;
  publishAt?: string | Date | null;
  expireAt?: string | Date | null;
  audience?: string | null;
  department?: string | null;
  location?: string | null;
  attachments?: string | null;
  reads?: ReadLike[] | null;
  uniqueReaders?: number | null;
  viewsCount?: number | null;
};

export function normalizeAnnouncementStatus(announcement: AnnouncementLike, now = new Date()): AnnouncementStatus {
  if ((announcement.status ?? "Draft") === "Draft") {
    return "Draft";
  }

  const publishAt = toDate(announcement.publishAt);
  const expireAt = toDate(announcement.expireAt);

  if (expireAt && expireAt.getTime() <= now.getTime()) {
    return "Expired";
  }

  if (publishAt && publishAt.getTime() > now.getTime()) {
    return "Scheduled";
  }

  return "Published";
}

export function isAnnouncementActive(announcement: AnnouncementLike, now = new Date()): boolean {
  return normalizeAnnouncementStatus(announcement, now) === "Published";
}

export function parseAnnouncementAttachments(value: string | null | undefined): AnnouncementAttachment[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter(isAttachmentLike);
    }
    if (isAttachmentLike(parsed)) {
      return [parsed];
    }
  } catch {
    if (typeof value === "string") {
      return [{ name: "Attachment", type: "application/octet-stream", size: 0, url: value }];
    }
  }

  return [];
}

export function stringifyAnnouncementAttachments(attachments: AnnouncementAttachment[]): string | null {
  if (attachments.length === 0) return null;
  return JSON.stringify(attachments);
}

export function getAnnouncementAudienceValue(announcement: AnnouncementLike): string | null {
  if (announcement.audience === "By Department" || announcement.audience === "Custom Group") {
    return announcement.department ?? null;
  }

  if (announcement.audience === "By Location") {
    return announcement.location ?? null;
  }

  return null;
}

export function formatAnnouncementAudience(announcement: AnnouncementLike): string {
  const value = getAnnouncementAudienceValue(announcement);
  return value ? `${announcement.audience}: ${value}` : announcement.audience ?? "All Employees";
}

export function matchesAnnouncementAudience(announcement: AnnouncementLike, employee: EmployeeLike | null | undefined): boolean {
  if (!employee) return true;

  const audience = (announcement.audience ?? "All Employees") as AnnouncementAudience;
  if (audience === "All Employees") return true;

  const target = (getAnnouncementAudienceValue(announcement) ?? "").trim();
  if (!target) return true;

  if (audience === "By Department") {
    return normalize(employee.department) === normalize(target);
  }

  if (audience === "By Location") {
    return normalize(employee.location) === normalize(target);
  }

  const tokens = target
    .split(",")
    .map((part) => normalize(part))
    .filter(Boolean);

  const employeeTokens = [
    employee.id ? String(employee.id) : "",
    employee.email ?? "",
    [employee.firstName, employee.lastName].filter(Boolean).join(" "),
    employee.department ?? "",
    employee.location ?? "",
  ]
    .map(normalize)
    .filter(Boolean);

  return employeeTokens.some((token) => tokens.includes(token));
}

export function getAnnouncementDepartmentBreakdown(reads: ReadLike[] | null | undefined) {
  const counts = new Map<string, number>();

  for (const read of reads ?? []) {
    const dept = read.employee?.department?.trim() || "Unassigned";
    counts.set(dept, (counts.get(dept) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([dept, count]) => ({ dept, count }))
    .sort((a, b) => b.count - a.count || a.dept.localeCompare(b.dept));
}

export function getAnnouncementReadPercent(uniqueReaders: number, employeeCount: number) {
  if (employeeCount <= 0) return 0;
  return Math.round((uniqueReaders / employeeCount) * 100);
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function isAttachmentLike(value: unknown): value is AnnouncementAttachment {
  if (!value || typeof value !== "object") return false;
  const maybe = value as Partial<AnnouncementAttachment>;
  return typeof maybe.name === "string" &&
    typeof maybe.type === "string" &&
    typeof maybe.size === "number" &&
    typeof maybe.url === "string";
}
