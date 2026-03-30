import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Circe, the AI assistant for CircleWorks — a modern, all-in-one USA Payroll & HR SaaS platform.

You help prospects and users understand CircleWorks' features, pricing, and capabilities. Be friendly, concise, and professional. Use emoji sparingly.

Key facts about CircleWorks:
- All-in-one platform: Payroll, HRIS, ATS, Benefits, Time Tracking, Expenses, Performance, Compliance, Analytics
- Covers all 50 US states + DC with automated tax filing
- Pricing: Starter (Free base + $8/employee/mo), Pro ($79/mo + $14/employee/mo), Enterprise (custom)
- SOC 2 Type II, HIPAA, GDPR, CCPA compliant
- 99.97% uptime SLA
- Average first payroll setup: under 5 minutes
- Direct deposit, W-2/1099 generation, multi-state tax handling
- Free trial available, no credit card required
- Integrations: QuickBooks, Slack, Okta, Xero, Checkr, DocuSign, and 50+ more
- California payroll: yes, fully supported including CA SDI, PFL, and local taxes

If you don't know something specific, suggest the user contact sales@circleworks.com or visit the Help Center.
Keep responses under 150 words.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicKey) {
      // Fallback: return a canned response when no API key is configured
      const lastUserMsg = messages?.[messages.length - 1]?.content?.toLowerCase() || "";

      let reply = "Thanks for your question! I'd love to help. For the most accurate answer, you can reach our team at sales@circleworks.com or start a free trial to explore the platform yourself.";

      if (lastUserMsg.includes("payroll")) {
        reply = "CircleWorks handles payroll across all 50 US states + DC. We automate tax calculations, filings, W-2/1099 generation, and direct deposit. Most companies run their first payroll in under 5 minutes! Want to try it? Start your free trial — no credit card needed.";
      } else if (lastUserMsg.includes("pricing") || lastUserMsg.includes("cost") || lastUserMsg.includes("plan")) {
        reply = "We keep pricing simple! **Starter**: Free base + $8/employee/mo. **Pro**: $79/mo + $14/employee/mo (most popular). **Enterprise**: Custom pricing with a dedicated support manager. All plans include a free trial with no credit card required. See full details at /pricing.";
      } else if (lastUserMsg.includes("california") || lastUserMsg.includes("state")) {
        reply = "Absolutely! CircleWorks fully supports California payroll, including CA SDI, PFL, and all local tax jurisdictions. We cover all 50 states + DC with automated tax filing — no extra charge per state.";
      } else if (lastUserMsg.includes("integration") || lastUserMsg.includes("connect")) {
        reply = "We integrate with 50+ tools your team already uses — QuickBooks, Xero, Slack, Okta, Checkr, DocuSign, Google Workspace, and many more. Check out our Integrations page for the full list!";
      } else if (lastUserMsg.includes("benefit")) {
        reply = "CircleWorks offers comprehensive benefits administration — health insurance, 401(k), HSA/FSA, commuter benefits, and more. Employees can enroll and manage benefits through their self-service portal. Deductions sync automatically with payroll.";
      } else if (lastUserMsg.includes("compliance") || lastUserMsg.includes("security")) {
        reply = "We take compliance seriously. CircleWorks is SOC 2 Type II certified, HIPAA compliant, and supports GDPR/CCPA requirements. We proactively flag overtime violations and minimum wage updates across all states.";
      }

      return NextResponse.json({ reply });
    }

    // If API key is available, call Claude
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6-20250514",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Anthropic API error:", errorBody);
      return NextResponse.json(
        { reply: "I'm having a brief issue connecting. Please try again in a moment!" },
        { status: 200 }
      );
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Circe API error:", error);
    return NextResponse.json(
      { reply: "Something went wrong on my end. Please try again, or email support@circleworks.com for help." },
      { status: 200 }
    );
  }
}
