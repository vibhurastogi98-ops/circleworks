import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (err) {
    console.error("[Auth Logout Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
