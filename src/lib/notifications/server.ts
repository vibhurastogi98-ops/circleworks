import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  employees,
  notificationDigestPreferences,
  notificationPreferences,
  notifications,
} from "@/db/schema";
import { sendEmail } from "@/lib/email";
import {
  createDemoNotifications,
  getNotificationDefinition,
  getNotificationPreferencesDefaults,
  type NotificationDigestPreference,
  type NotificationPreference,
  type NotificationRecord,
} from "@/lib/notifications/registry";
import type { UserContext } from "@/lib/session";

export async function ensureNotificationSchema() {
  await db.execute(sql`
    ALTER TABLE notifications
      ADD COLUMN IF NOT EXISTS category text DEFAULT 'system',
      ADD COLUMN IF NOT EXISTS priority text DEFAULT 'info',
      ADD COLUMN IF NOT EXISTS action_label text,
      ADD COLUMN IF NOT EXISTS metadata text,
      ADD COLUMN IF NOT EXISTS read_at timestamp,
      ADD COLUMN IF NOT EXISTS email_delivery_status text DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS email_delivered_at timestamp,
      ADD COLUMN IF NOT EXISTS sms_delivery_status text DEFAULT 'not_sent',
      ADD COLUMN IF NOT EXISTS sms_delivered_at timestamp,
      ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now()
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id serial PRIMARY KEY,
      company_id integer REFERENCES companies(id) ON DELETE cascade,
      user_id integer NOT NULL REFERENCES users(id) ON DELETE cascade,
      notification_type text NOT NULL,
      category text DEFAULT 'system',
      in_app_enabled boolean DEFAULT true,
      email_enabled boolean DEFAULT true,
      sms_enabled boolean DEFAULT false,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS notification_digest_preferences (
      id serial PRIMARY KEY,
      company_id integer REFERENCES companies(id) ON DELETE cascade,
      user_id integer NOT NULL REFERENCES users(id) ON DELETE cascade,
      digest_enabled boolean DEFAULT false,
      digest_frequency text DEFAULT 'realtime',
      digest_time text DEFAULT '08:00',
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )
  `);

  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_preferences_user_type ON notification_preferences (user_id, notification_type)`);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_digest_preferences_user ON notification_digest_preferences (user_id)`);
}

function parseMetadata(metadata: string | null | undefined): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  try {
    const parsed = JSON.parse(metadata);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function toIso(value: Date | string | null | undefined) {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function mapNotificationRow(row: typeof notifications.$inferSelect): NotificationRecord {
  const definition = getNotificationDefinition(row.type);

  return {
    id: String(row.id),
    type: row.type,
    category: (row.category ?? definition.category) as NotificationRecord["category"],
    title: row.title,
    message: row.description,
    timestamp: toIso(row.createdAt),
    isRead: row.isRead ?? false,
    link: row.link || definition.link,
    actionLabel: row.actionLabel || definition.actionLabel,
    severity: (row.priority ?? definition.severity) as NotificationRecord["severity"],
    metadata: parseMetadata(row.metadata),
  };
}

export async function getNotificationsForContext(ctx: UserContext) {
  await ensureNotificationSchema();
  const rows = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.companyId, ctx.companyId), eq(notifications.employeeId, ctx.employeeId)))
    .orderBy(desc(notifications.createdAt))
    .limit(80);

  return rows.length ? rows.map(mapNotificationRow) : createDemoNotifications();
}

export async function markNotificationsRead(ctx: UserContext, ids?: number[]) {
  await ensureNotificationSchema();
  const base = and(eq(notifications.companyId, ctx.companyId), eq(notifications.employeeId, ctx.employeeId));
  const now = new Date();

  if (ids?.length) {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: now, updatedAt: now })
      .where(and(base, inArray(notifications.id, ids)));
    return;
  }

  await db
    .update(notifications)
    .set({ isRead: true, readAt: now, updatedAt: now })
    .where(base);
}

export async function getNotificationPreferences(userId: number, companyId: number) {
  await ensureNotificationSchema();
  const saved = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));

  const savedByType = new Map(saved.map((row) => [row.notificationType, row]));
  const preferences = getNotificationPreferencesDefaults().map((defaultPreference) => {
    const row = savedByType.get(defaultPreference.type);
    return {
      ...defaultPreference,
      inApp: row?.inAppEnabled ?? defaultPreference.inApp,
      email: row?.emailEnabled ?? defaultPreference.email,
      sms: row?.smsEnabled ?? defaultPreference.sms,
    } satisfies NotificationPreference;
  });

  const [digestRow] = await db
    .select()
    .from(notificationDigestPreferences)
    .where(eq(notificationDigestPreferences.userId, userId))
    .limit(1);

  const digest: NotificationDigestPreference = digestRow
    ? {
        enabled: digestRow.digestEnabled ?? false,
        frequency: (digestRow.digestFrequency === "daily" ? "daily" : "realtime"),
        time: digestRow.digestTime || "08:00",
      }
    : { enabled: false, frequency: "realtime", time: "08:00" };

  return { preferences, digest, companyId };
}

export async function saveNotificationPreferences({
  userId,
  companyId,
  preferences,
  digest,
}: {
  userId: number;
  companyId: number;
  preferences: NotificationPreference[];
  digest: NotificationDigestPreference;
}) {
  await ensureNotificationSchema();
  const now = new Date();

  for (const preference of preferences) {
    await db
      .insert(notificationPreferences)
      .values({
        companyId,
        userId,
        notificationType: preference.type,
        category: preference.category,
        inAppEnabled: preference.inApp,
        emailEnabled: preference.email,
        smsEnabled: preference.sms,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [notificationPreferences.userId, notificationPreferences.notificationType],
        set: {
          category: preference.category,
          inAppEnabled: preference.inApp,
          emailEnabled: preference.email,
          smsEnabled: preference.sms,
          updatedAt: now,
        },
      });
  }

  await db
    .insert(notificationDigestPreferences)
    .values({
      companyId,
      userId,
      digestEnabled: digest.enabled,
      digestFrequency: digest.frequency,
      digestTime: digest.time,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [notificationDigestPreferences.userId],
      set: {
        companyId,
        digestEnabled: digest.enabled,
        digestFrequency: digest.frequency,
        digestTime: digest.time,
        updatedAt: now,
      },
    });
}

export async function createNotificationForEmployee({
  ctx,
  userId,
  type,
  title,
  message,
  link,
  actionLabel,
  metadata,
}: {
  ctx: UserContext;
  userId: number;
  type: string;
  title?: string;
  message?: string;
  link?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}) {
  await ensureNotificationSchema();
  const definition = getNotificationDefinition(type);
  const { preferences, digest } = await getNotificationPreferences(userId, ctx.companyId);
  const preference = preferences.find((item) => item.type === definition.type);
  const inAppEnabled = preference?.inApp ?? true;
  const emailEnabled = preference?.email ?? true;
  const smsEnabled = preference?.sms ?? false;

  let inserted: typeof notifications.$inferSelect | null = null;
  if (inAppEnabled) {
    const [row] = await db
      .insert(notifications)
      .values({
        companyId: ctx.companyId,
        employeeId: ctx.employeeId,
        type: definition.type,
        category: definition.category,
        priority: definition.severity,
        title: title || definition.title,
        description: message || definition.message,
        actionLabel: actionLabel || definition.actionLabel,
        link: link || definition.link,
        metadata: metadata ? JSON.stringify(metadata) : null,
        emailDeliveryStatus: emailEnabled && !digest.enabled ? "queued" : "digest",
        smsDeliveryStatus: smsEnabled ? "queued" : "not_sent",
      })
      .returning();
    inserted = row;
  }

  if (emailEnabled && !digest.enabled) {
    const [employee] = await db
      .select({ email: employees.email })
      .from(employees)
      .where(eq(employees.id, ctx.employeeId))
      .limit(1);

    if (employee?.email) {
      await sendEmail({
        to: employee.email,
        subject: title || definition.title,
        html: `<p>${message || definition.message}</p><p><a href="${link || definition.link}">${actionLabel || definition.actionLabel}</a></p>`,
        text: `${message || definition.message}\n${link || definition.link}`,
      });
    }
  }

  return inserted ? mapNotificationRow(inserted) : null;
}
