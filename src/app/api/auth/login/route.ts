import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error || !data.session) {
      console.error("[Auth Login Error]", error?.message);
      if (
        error?.message?.toLowerCase().includes("invalid") ||
        error?.message?.toLowerCase().includes("credentials") ||
        error?.code === "invalid_credentials"
      ) {
        return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
      }
      return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
    }

    return response;
  } catch (err) {
    console.error("[Auth Login Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
