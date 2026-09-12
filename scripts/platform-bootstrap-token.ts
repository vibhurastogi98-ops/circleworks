/**
 * One-time bootstrap-token generator. Prints a plaintext token to STDERR
 * exactly once, stores only its SHA-256 hash in the DB.
 *
 * Usage:
 *   npx tsx scripts/platform-bootstrap-token.ts --email you@yourdomain.com --note "Initial super admin, requested by CTO"
 *
 * Refuses to run if any super_admin already exists in platform_admins.
 * See docs/platform-admin-spec.md §3.
 */
import { db } from "@/db";
import { bootstrapTokens, platformAdmins } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { generateBootstrapToken } from "@/lib/platform-crypto";

const TOKEN_TTL_HOURS = 24;

function parseArgs(): { email: string; note: string } {
  const args = process.argv.slice(2);
  let email = "";
  let note = "";
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--email") email = args[++i] ?? "";
    else if (args[i] === "--note") note = args[++i] ?? "";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Usage: --email <address> --note <text>");
    process.exit(2);
  }
  if (!note || note.trim().length < 10) {
    console.error("--note must be at least 10 chars (who is running this, why)");
    process.exit(2);
  }
  return { email: email.toLowerCase(), note: note.trim() };
}

async function main() {
  const { email, note } = parseArgs();

  const [existingSuper] = await db
    .select({ id: platformAdmins.id })
    .from(platformAdmins)
    .where(and(eq(platformAdmins.role, "super_admin"), eq(platformAdmins.status, "active")))
    .limit(1);

  if (existingSuper) {
    console.error(
      "REFUSED: a super_admin already exists (id=" +
        existingSuper.id +
        "). Bootstrap is a one-time gate. Have that admin invite you from the panel.",
    );
    process.exit(1);
  }

  const { plaintext, hash } = generateBootstrapToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);
  await db.insert(bootstrapTokens).values({
    tokenHash: hash,
    allowedEmail: email,
    createdByNote: note,
    expiresAt,
  });

  // stderr, never stdout — makes it slightly harder to accidentally pipe to a log.
  console.error("\n=================================================");
  console.error("  PLATFORM BOOTSTRAP TOKEN — do not lose this!");
  console.error("=================================================");
  console.error("  email:      " + email);
  console.error("  expires_at: " + expiresAt.toISOString());
  console.error("  token:      " + plaintext);
  console.error("=================================================\n");
  console.error("Hand-deliver via Signal or in person. Do NOT email or Slack this.\n");
  console.error("Bootstrap URL: /platform/bootstrap\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Bootstrap script failed:", err);
  process.exit(1);
});
