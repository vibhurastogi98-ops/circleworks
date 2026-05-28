import { NextResponse } from "next/server";
import postmark from "postmark";

import { db } from "@/db";
import { contactRequests } from "@/db/schema";

type ContactPayload = {
  requestType?: "contact" | "demo" | "migration";
  name?: string;
  email?: string;
  company?: string;
  companySize?: string;
  message?: string;
  phone?: string;
  currentTool?: string;
  demoSlot?: string;
};

function clean(value: unknown) {
  return String(value || "").trim();
}

function getRequestLabel(type: ContactPayload["requestType"]) {
  if (type === "demo") return "Demo request";
  if (type === "migration") return "Migration request";
  return "Contact request";
}

function buildStoredMessage(body: ContactPayload) {
  const lines = [
    clean(body.message),
    body.company ? `Company: ${clean(body.company)}` : "",
    body.phone ? `Phone: ${clean(body.phone)}` : "",
    body.currentTool ? `Current tool: ${clean(body.currentTool)}` : "",
    body.demoSlot ? `Requested demo slot: ${clean(body.demoSlot)}` : "",
    `Request type: ${getRequestLabel(body.requestType).replace(" request", "")}`,
  ].filter(Boolean);

  return lines.join("\n");
}

async function sendPostmarkEmail(body: ContactPayload, storedMessage: string) {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  if (!token) {
    console.warn(
      "[Contact API] POSTMARK_SERVER_TOKEN not configured; skipping email send.",
    );
    return false;
  }

  const client = new postmark.ServerClient(token);
  const to =
    process.env.CONTACT_TO_EMAIL ||
    process.env.SALES_TO_EMAIL ||
    "support@circleworks.com";
  const from = process.env.POSTMARK_FROM_EMAIL || "support@circleworks.com";
  const requestLabel = getRequestLabel(body.requestType);

  await client.sendEmail({
    From: from,
    To: to,
    ReplyTo: clean(body.email),
    Subject: `${requestLabel}: ${clean(body.company) || clean(body.name)}`,
    TextBody: [
      requestLabel,
      "",
      `Name: ${clean(body.name)}`,
      `Email: ${clean(body.email)}`,
      `Company: ${clean(body.company) || "Not provided"}`,
      `Company size: ${clean(body.companySize) || "Not provided"}`,
      storedMessage,
    ].join("\n"),
    HtmlBody: `
      <h2>${requestLabel}</h2>
      <p><strong>Name:</strong> ${clean(body.name)}</p>
      <p><strong>Email:</strong> ${clean(body.email)}</p>
      <p><strong>Company:</strong> ${clean(body.company) || "Not provided"}</p>
      <p><strong>Company size:</strong> ${clean(body.companySize) || "Not provided"}</p>
      <pre style="font-family:Arial,sans-serif;white-space:pre-wrap">${storedMessage}</pre>
    `,
  });

  return true;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactPayload;
    const name = clean(body.name);
    const email = clean(body.email);
    const companySize = clean(body.companySize);
    const storedMessage = buildStoredMessage(body);
    let stored = false;

    if (!name || !email || !storedMessage) {
      return NextResponse.json(
        { success: false, error: "Name, work email, and message are required" },
        { status: 400 },
      );
    }

    try {
      await db.insert(contactRequests).values({
        name,
        email,
        companySize,
        message: storedMessage,
      });
      stored = true;
    } catch (error) {
      console.warn("[Contact API] Database insert failed.", error);
    }

    const emailSent = await sendPostmarkEmail(
      { ...body, name, email, companySize },
      storedMessage,
    );

    if (!stored && !emailSent && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: "Unable to save or send request" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, emailSent, stored });
  } catch (error) {
    console.error("[Contact API Error]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
