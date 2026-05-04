import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      role: user.user_metadata?.role ?? "employee",
    });
  } catch (err) {
    console.error("[Auth Me Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
