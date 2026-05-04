import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error || !data.session) {
      console.error("[Auth Login Error]", error?.message);

      // Map Supabase error codes to our existing error keys
      if (
        error?.message?.toLowerCase().includes("invalid") ||
        error?.message?.toLowerCase().includes("credentials") ||
        error?.code === "invalid_credentials"
      ) {
        return NextResponse.json(
          { error: "invalid_credentials" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: error?.message || "Internal server error" },
        { status: 500 }
      );
    }

    // Supabase SSR automatically sets the session cookies via the server client
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Auth Login Error]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
