import { NextResponse } from "next/server";

import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from "@/lib/notifications/server";
import { notificationDefinitions, type NotificationDigestPreference, type NotificationPreference } from "@/lib/notifications/registry";
import { getSession, resolveUserContext } from "@/lib/session";

const validTypes: Set<string> = new Set(notificationDefinitions.map((definition) => definition.type));

function normalizeDigest(input: unknown): NotificationDigestPreference {
  const value = input && typeof input === "object" ? input as Partial<NotificationDigestPreference> : {};
  const enabled = Boolean(value.enabled);
  return {
    enabled,
    frequency: enabled ? "daily" : "realtime",
    time: typeof value.time === "string" && value.time ? value.time : "08:00",
  };
}

function normalizePreferences(input: unknown): NotificationPreference[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((item): item is NotificationPreference => {
      return Boolean(item && typeof item === "object" && validTypes.has(String((item as NotificationPreference).type)));
    })
    .map((item) => {
      const definition = notificationDefinitions.find((definition) => definition.type === item.type)!;
      return {
        type: definition.type,
        category: definition.category,
        label: definition.label,
        description: definition.description,
        inApp: Boolean(item.inApp),
        email: Boolean(item.email),
        sms: Boolean(item.sms),
      };
    });
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await resolveUserContext(session);
    if (!ctx) return NextResponse.json({ error: "Employee context not found" }, { status: 404 });

    return NextResponse.json(await getNotificationPreferences(session.userId, ctx.companyId));
  } catch (error) {
    console.error("[Notification preferences GET]", error);
    return NextResponse.json({ error: "Failed to load notification preferences" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await resolveUserContext(session);
    if (!ctx) return NextResponse.json({ error: "Employee context not found" }, { status: 404 });

    const body = await req.json();
    const preferences = normalizePreferences(body.preferences);
    const digest = normalizeDigest(body.digest);

    await saveNotificationPreferences({
      userId: session.userId,
      companyId: ctx.companyId,
      preferences,
      digest,
    });

    return NextResponse.json({ success: true, preferences, digest });
  } catch (error) {
    console.error("[Notification preferences PUT]", error);
    return NextResponse.json({ error: "Failed to save notification preferences" }, { status: 500 });
  }
}
