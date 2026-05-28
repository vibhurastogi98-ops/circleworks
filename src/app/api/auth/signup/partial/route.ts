import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SIGNUP_DRAFT_COOKIE = "cw_signup_partial";
const DRAFT_MAX_AGE = 60 * 60 * 24 * 14;

const partialSignupSchema = z.object({
  email: z.string().trim().email().optional().or(z.literal("")),
  step: z.number().int().min(0).max(4),
  data: z.unknown().optional(),
});

function sanitizeDraft(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeDraft);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => [
        key,
        key.toLowerCase().includes("password") ? "" : sanitizeDraft(entryValue),
      ])
    );
  }

  return value;
}

export async function GET(req: NextRequest) {
  const rawDraft = req.cookies.get(SIGNUP_DRAFT_COOKIE)?.value;

  if (!rawDraft) {
    return NextResponse.json({ draft: null });
  }

  try {
    const draft = JSON.parse(rawDraft) as unknown;
    return NextResponse.json({ draft: sanitizeDraft(draft) });
  } catch {
    const response = NextResponse.json({ draft: null });
    response.cookies.set(SIGNUP_DRAFT_COOKIE, "", {
      path: "/",
      maxAge: 0,
    });
    return response;
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = partialSignupSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid partial signup payload" }, { status: 400 });
    }

    const draft = {
      email: parsed.data.email || "",
      step: parsed.data.step,
      data: sanitizeDraft(parsed.data.data),
      savedAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      step: draft.step,
      savedAt: draft.savedAt,
    });

    response.cookies.set(SIGNUP_DRAFT_COOKIE, JSON.stringify(draft), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DRAFT_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SIGNUP_DRAFT_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}
