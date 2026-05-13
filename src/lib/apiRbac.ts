import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";

export async function requireApiPermission(req: NextRequest, required: string) {
  const session = await getSession(req);

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!hasPermission(session.role, required)) {
    return {
      session,
      response: NextResponse.json(
        { error: "insufficient_permissions", required },
        { status: 403 }
      ),
    };
  }

  return { session, response: null };
}
