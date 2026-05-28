import { readFile } from "node:fs/promises";
import path from "node:path";

import mjml2html from "mjml";
import * as postmark from "postmark";

import {
  commonBrandVars,
  getTransactionalEmailTemplate,
  type TransactionalEmailTemplateSlug,
} from "@/emails/transactionalEmailTemplates";

// Initialize the Postmark client. 
// Uses a dummy key "server_token" in dev/testing if env var isn't explicitly set locally.
const client = new postmark.ServerClient(
  process.env.POSTMARK_API_KEY ||
    process.env.POSTMARK_SERVER_TOKEN ||
    "dummy_postmark_key"
);

type EmailTemplateVariables = Record<
  string,
  string | number | boolean | null | undefined
>;

type EmailAttachment = {
  Name: string;
  Content: string;
  ContentType: string;
  ContentID?: string | null;
};

type EmailBranding = {
  companyName?: string;
  companyLogoUrl?: string;
  brandColor?: string;
  unsubscribeUrl?: string;
};

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
  attachments?: EmailAttachment[];
  messageStream?: string;
}

/**
 * Fire-and-forget email sender utilizing Postmark's REST API.
 * Designed to gracefully catch errors so caller process isn't interrupted.
 */
export async function sendEmail({
  to,
  subject,
  html,
  from,
  text,
  attachments,
  messageStream,
}: SendEmailParams) {
  const fromEmail = from || process.env.POSTMARK_SENDER_EMAIL || "hello@circleworks.com";
  const postmarkAttachments = attachments?.map(
    ({ ContentID = null, ...attachment }) => ({
      ...attachment,
      ContentID,
    })
  );

  try {
    // Attempt standard Postmark dispatch
    const response = await client.sendEmail({
      From: fromEmail,
      To: to,
      Subject: subject,
      HtmlBody: html,
      TextBody: text,
      Attachments: postmarkAttachments,
      MessageStream: messageStream || "outbound" // explicitly defining transactional outbox stream
    });
    
    console.log(`[Postmark] Email successfully sent to ${to}. MessageID: ${response.MessageID}`);
    return true;
  } catch (error) {
    // Non-blocking catch natively allows caller processes (like Employee Creation) to finish
    console.error(`[Postmark Error] Failed to send email to ${to}:`, error);
    return false;
  }
}

export type RenderTransactionalEmailParams = {
  template: TransactionalEmailTemplateSlug;
  variables?: EmailTemplateVariables;
  branding?: EmailBranding;
};

export type SendTransactionalEmailParams = RenderTransactionalEmailParams & {
  to: string;
  from?: string;
  attachments?: EmailAttachment[];
  messageStream?: string;
};

function getDefaultBrandVariables(branding?: EmailBranding): EmailTemplateVariables {
  return {
    company_name: branding?.companyName || "CircleWorks",
    company_logo_url:
      branding?.companyLogoUrl || "https://circleworks.com/logo.png",
    brand_color: branding?.brandColor || "#2563eb",
    current_year: new Date().getFullYear(),
    unsubscribe_url:
      branding?.unsubscribeUrl || "https://circleworks.com/settings/notifications",
  };
}

function applyTemplateVariables(
  source: string,
  variables: EmailTemplateVariables
) {
  return source.replace(/{{\s*([\w.]+)\s*}}/g, (_, key: string) => {
    const value = variables[key];
    return value === null || value === undefined ? "" : String(value);
  });
}

function requireTemplateVariables(
  keys: readonly string[],
  variables: EmailTemplateVariables,
  templateName: string
) {
  const missing = keys.filter((key) => {
    const value = variables[key];
    return value === null || value === undefined || value === "";
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing variables for ${templateName}: ${missing.join(", ")}`
    );
  }
}

function htmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function renderTransactionalEmail({
  template,
  variables = {},
  branding,
}: RenderTransactionalEmailParams) {
  const templateConfig = getTransactionalEmailTemplate(template);
  const mergedVariables = {
    ...getDefaultBrandVariables(branding),
    ...variables,
  };

  requireTemplateVariables(
    [...commonBrandVars, ...templateConfig.requiredVars],
    mergedVariables,
    templateConfig.templateName
  );

  const templatePath = path.join(
    process.cwd(),
    "src",
    "emails",
    "templates",
    templateConfig.fileName
  );
  const mjml = applyTemplateVariables(
    await readFile(templatePath, "utf8"),
    mergedVariables
  );
  const subject = applyTemplateVariables(templateConfig.subject, mergedVariables);
  const rendered = await mjml2html(mjml, {
    beautify: false,
    minify: true,
    validationLevel: "strict",
  });

  if (rendered.errors.length > 0) {
    throw new Error(
      `MJML render failed for ${templateConfig.templateName}: ${rendered.errors
        .map((error: { formattedMessage: string }) => error.formattedMessage)
        .join("; ")}`
    );
  }

  return {
    template: templateConfig,
    subject,
    html: rendered.html,
    text: htmlToText(rendered.html),
  };
}

export async function sendTransactionalEmail({
  to,
  from,
  attachments,
  messageStream,
  ...renderParams
}: SendTransactionalEmailParams) {
  const rendered = await renderTransactionalEmail(renderParams);

  return sendEmail({
    to,
    from,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    attachments,
    messageStream,
  });
}
