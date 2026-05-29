import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Browser client (for use in Client Components) ────────────────────────────
export function createSupabaseBrowserClient() {
  const browserOnline =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    navigator.onLine;
  const shouldAutoRefreshToken = process.env.NODE_ENV === "production" && browserOnline;

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: shouldAutoRefreshToken,
    },
  });
}

// ─── Middleware client (for use in middleware.ts) ─────────────────────────────
export function createSupabaseMiddlewareClient(
  req: NextRequest,
  res: NextResponse
) {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          req.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        );
      },
    },
  });
}
