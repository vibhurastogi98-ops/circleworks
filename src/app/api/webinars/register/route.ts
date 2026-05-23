import { NextResponse } from "next/server";
import postmark from "postmark";
import { z } from "zod";

import {
  buildWebinarIcs,
  formatWebinarDateTime,
  WEBINARS,
} from "@/data/webinars";

const payloadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("register"),
    webinarId: z.string().min(1),
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    company: z.string().trim().min(2),
  }),
  z.object({
    type: z.literal("lead"),
    webinarId: z.string().min(1),
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    company: z.string().trim().optional().default(""),
  }),
  z.object({
    type: z.literal("mailing"),
    email: z.string().trim().email(),
  }),
  z.object({
    type: z.literal("topic"),
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    topic: z.string().trim().min(5),
  }),
]);

function getWebinarById(id: string) {
  return WEBINARS.find((webinar) => webinar.id === id || webinar.slug === id);
}

function getPostmarkClient() {
  const token = process.env.POSTMARK_SERVER_TOKEN || process.env.POSTMARK_API_KEY;

  if (!token) {
    console.warn("[Webinars API] Postmark token not configured; skipping email send.");
    return null;
  }

  return new postmark.ServerClient(token);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendConfirmationEmail(
  payload: Extract<z.infer<typeof payloadSchema>, { type: "register" | "lead" }>,
) {
  const webinar = getWebinarById(payload.webinarId);
  const client = getPostmarkClient();

  if (!webinar || !client) return false;

  const from = process.env.POSTMARK_FROM_EMAIL || process.env.POSTMARK_SENDER_EMAIL || "webinars@circleworks.com";
  const webinarUrl = `https://circleworks.com/webinars/${webinar.slug}`;
  const isRegistration = payload.type === "register";
  const subject = isRegistration
    ? `You're registered: ${webinar.title}`
    : `Your on-demand webinar access: ${webinar.title}`;
  const text = isRegistration
    ? [
        `Hi ${payload.name},`,
        "",
        `You're registered for ${webinar.title}.`,
        `When: ${formatWebinarDateTime(webinar)}`,
        `Duration: ${webinar.durationMinutes} minutes`,
        `Speaker: ${webinar.speaker}, ${webinar.speakerTitle}`,
        "",
        `Webinar page: ${webinarUrl}`,
        "",
        "Thanks,",
        "CircleWorks",
      ].join("\n")
    : [
        `Hi ${payload.name},`,
        "",
        `Here is your access link for ${webinar.title}:`,
        webinarUrl,
        "",
        "Thanks,",
        "CircleWorks",
      ].join("\n");

  try {
    await client.sendEmail({
      From: from,
      To: payload.email,
      Subject: subject,
      TextBody: text,
      HtmlBody: text
        .split("\n")
        .map((line) => (line ? `<p>${escapeHtml(line)}</p>` : "<br />"))
        .join(""),
      Attachments: isRegistration
        ? [
            {
              Name: `${webinar.slug}.ics`,
              Content: Buffer.from(buildWebinarIcs(webinar), "utf8").toString("base64"),
              ContentType: "text/calendar",
            },
          ]
        : undefined,
      MessageStream: "outbound",
    });

    return true;
  } catch (error) {
    console.error("[Webinars API] Failed to send confirmation email:", error);
    return false;
  }
}

async function sendInternalNotification(payload: z.infer<typeof payloadSchema>) {
  const client = getPostmarkClient();
  if (!client) return false;

  const from = process.env.POSTMARK_FROM_EMAIL || process.env.POSTMARK_SENDER_EMAIL || "webinars@circleworks.com";
  const to = process.env.WEBINAR_NOTIFY_EMAIL || process.env.CONTACT_TO_EMAIL || "support@circleworks.com";
  const webinar =
    "webinarId" in payload && payload.webinarId ? getWebinarById(payload.webinarId) : undefined;
  const subject =
    payload.type === "topic"
      ? "New webinar topic suggestion"
      : payload.type === "mailing"
        ? "New webinar mailing list signup"
        : `New webinar ${payload.type}: ${webinar?.title || payload.webinarId}`;

  const details = [
    `Type: ${payload.type}`,
    "name" in payload ? `Name: ${payload.name}` : "",
    `Email: ${payload.email}`,
    "company" in payload && payload.company ? `Company: ${payload.company}` : "",
    webinar ? `Webinar: ${webinar.title}` : "",
    "topic" in payload ? `Suggested topic: ${payload.topic}` : "",
  ].filter(Boolean);

  try {
    await client.sendEmail({
      From: from,
      To: to,
      ReplyTo: payload.email,
      Subject: subject,
      TextBody: details.join("\n"),
      HtmlBody: details.map((detail) => `<p>${escapeHtml(detail)}</p>`).join(""),
      MessageStream: "outbound",
    });

    return true;
  } catch (error) {
    console.error("[Webinars API] Failed to send internal notification:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const parsed = payloadSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Please provide the required webinar form fields." },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    let emailSent = false;

    if ("webinarId" in payload) {
      const webinar = getWebinarById(payload.webinarId);

      if (!webinar) {
        return NextResponse.json(
          { success: false, error: "Webinar not found." },
          { status: 404 },
        );
      }

      if (payload.type === "register" && webinar.type !== "upcoming") {
        return NextResponse.json(
          { success: false, error: "Registration is only available for upcoming webinars." },
          { status: 400 },
        );
      }

      if (payload.type === "lead" && webinar.type !== "ondemand") {
        return NextResponse.json(
          { success: false, error: "Video access is only available for on-demand webinars." },
          { status: 400 },
        );
      }

      emailSent = await sendConfirmationEmail(payload);
    }

    const notificationSent = await sendInternalNotification(payload);

    return NextResponse.json({
      success: true,
      emailSent,
      notificationSent,
      message:
        payload.type === "register"
          ? "Registration successful. A confirmation email will be sent shortly."
          : "Thanks. Your webinar request has been received.",
    });
  } catch (error) {
    console.error("[Webinars API Error]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
