import { NextResponse } from "next/server";
import { getTemplateById } from "@/data/templates";
import { sendEmail } from "@/lib/email";

type DownloadPayload = {
  firstName?: string;
  email?: string;
  companySize?: string;
  templateId?: string;
  returningVisitor?: boolean;
};

function clean(value: unknown) {
  return String(value || "").trim();
}

function getEmailDomain(email: string) {
  return email.split("@")[1]?.toLowerCase() || "";
}

function isValidWorkEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAppUrl(req: Request) {
  const requestOrigin = new URL(req.url).origin;
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");

  if (!configuredUrl || configuredUrl.includes("localhost")) {
    return requestOrigin;
  }

  return configuredUrl;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DownloadPayload;
    const firstName = clean(body.firstName);
    const email = clean(body.email).toLowerCase();
    const companySize = clean(body.companySize);
    const template = body.templateId ? getTemplateById(body.templateId) : null;
    const returningVisitor = Boolean(body.returningVisitor);

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 },
      );
    }

    if (!email || !isValidWorkEmail(email)) {
      return NextResponse.json(
        { success: false, error: "A valid work email is required" },
        { status: 400 },
      );
    }

    if (!returningVisitor && (!firstName || !companySize)) {
      return NextResponse.json(
        { success: false, error: "First name and company size are required" },
        { status: 400 },
      );
    }

    const downloadUrl = `${getAppUrl(req)}/templates/${template.slug}?download=1`;
    const emailConfigured = Boolean(process.env.POSTMARK_API_KEY);
    const emailQueued = emailConfigured
      ? await sendEmail({
          to: email,
          subject: `${template.title} download link`,
          html: `
            <p>Hi ${firstName || "there"},</p>
            <p>Here is your free CircleWorks template:</p>
            <p><a href="${downloadUrl}">${template.title}</a></p>
            <p>You are also subscribed to our HR templates and compliance nurture sequence. You can unsubscribe from any email.</p>
          `,
          text: [
            `Hi ${firstName || "there"},`,
            "",
            `Here is your free CircleWorks template: ${template.title}`,
            downloadUrl,
            "",
            "You are also subscribed to our HR templates and compliance nurture sequence. You can unsubscribe from any email.",
          ].join("\n"),
        })
      : false;

    console.log("[Template download]", {
      email,
      domain: getEmailDomain(email),
      companySize: companySize || "returning visitor",
      templateId: template.id,
      nurtureSequenceAdded: true,
      emailQueued,
    });

    const response = NextResponse.json({
      success: true,
      downloadUrl,
      emailQueued,
      nurtureSequenceAdded: true,
      message: emailQueued
        ? "Download link sent."
        : "Download link generated. Email sending is not configured in this environment.",
    });

    response.cookies.set("cw_template_domain", getEmailDomain(email), {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("[Template download error]", error);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
