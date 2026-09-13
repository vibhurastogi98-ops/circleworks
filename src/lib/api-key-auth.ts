import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { apiKeys } from "@/db/schema";

/**
 * Auth for `/api/v1/*`. Keys are minted through the settings UI; the plaintext
 * is shown once and only the SHA-256 hash is stored. Callers send
 *   Authorization: Bearer <plaintext>
 * on every request. The key's companyId scopes the request.
 *
 * Not a middleware — Next.js middleware runs on the Edge runtime and we need
 * Node crypto + Drizzle. Each `/api/v1/*` handler calls `requireApiKey(req)`
 * at the top instead.
 */

const PREFIX = "cw_live_";

export function hashKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

/**
 * Generates `cw_live_<32-char-base64url>`. That's 24 bytes = 192 bits of
 * entropy in the secret portion — same target as the invoice public-token.
 * The `cw_live_` prefix makes leaks obvious in log scans.
 */
export function generateApiKey(): { plaintext: string; hashed: string; keyPrefix: string } {
  const secret = randomBytes(24).toString("base64url");
  const plaintext = `${PREFIX}${secret}`;
  const hashed = hashKey(plaintext);
  // First 12 chars is enough to identify a key visually without leaking the secret.
  const keyPrefix = `${PREFIX}${secret.slice(0, 4)}…`;
  return { plaintext, hashed, keyPrefix };
}

export type ApiKeyContext = { companyId: number; apiKeyId: number };
export type RequireApiKeyResult =
  | { ok: true; ctx: ApiKeyContext }
  | { ok: false; response: NextResponse };

/**
 * Validate an incoming request's API key. On success returns the companyId
 * this request is scoped to. On failure returns a NextResponse the handler
 * should immediately return.
 *
 * Side effect: updates `last_used_at` (fire-and-forget). We don't block the
 * response on that write.
 */
export async function requireApiKey(request: Request): Promise<RequireApiKeyResult> {
  const authz = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(authz.trim());
  if (!match) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "missing_api_key", message: "Send Authorization: Bearer <key>" },
        { status: 401 },
      ),
    };
  }
  const plaintext = match[1];
  if (!plaintext.startsWith(PREFIX)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "invalid_api_key_format" }, { status: 401 }),
    };
  }

  const hashed = hashKey(plaintext);
  const [row] = await db
    .select({ id: apiKeys.id, companyId: apiKeys.companyId, revokedAt: apiKeys.revokedAt })
    .from(apiKeys)
    .where(and(eq(apiKeys.hashedKey, hashed), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (!row) {
    return {
      ok: false,
      response: NextResponse.json({ error: "invalid_or_revoked_api_key" }, { status: 401 }),
    };
  }

  // Best-effort last-used update; do not await the promise on the response path.
  void db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, row.id))
    .catch((err) => console.error("[api-key-auth] lastUsedAt update failed:", err));

  return { ok: true, ctx: { companyId: row.companyId, apiKeyId: row.id } };
}
