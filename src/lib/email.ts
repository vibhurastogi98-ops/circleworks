import * as postmark from "postmark";

// Initialize the Postmark client. 
// Uses a dummy key "server_token" in dev/testing if env var isn't explicitly set locally.
const client = new postmark.ServerClient(
  process.env.POSTMARK_API_KEY || "dummy_postmark_key"
);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Fire-and-forget email sender utilizing Postmark's REST API.
 * Designed to gracefully catch errors so caller process isn't interrupted.
 */
export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  const fromEmail = from || process.env.POSTMARK_SENDER_EMAIL || "hello@circleworks.com";

  try {
    // Attempt standard Postmark dispatch
    const response = await client.sendEmail({
      From: fromEmail,
      To: to,
      Subject: subject,
      HtmlBody: html,
      MessageStream: "outbound" // explicitly defining transactional outbox stream
    });
    
    console.log(`[Postmark] Email successfully sent to ${to}. MessageID: ${response.MessageID}`);
    return true;
  } catch (error) {
    // Non-blocking catch natively allows caller processes (like Employee Creation) to finish
    console.error(`[Postmark Error] Failed to send email to ${to}:`, error);
    return false;
  }
}
