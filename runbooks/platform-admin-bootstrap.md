# Standing up a new super_admin (platform panel bootstrap)

The platform admin panel at `/platform/*` is a separate application with its own auth. There is no way to sign up from the UI — the first super_admin is minted via a bootstrap script that runs against the DB directly and prints a one-time token. Later super_admins are invited from inside the panel by an existing one.

Full design context: [`../docs/platform-admin-spec.md`](../docs/platform-admin-spec.md) §3 ("Auth model").

## When to run this

- Standing up a fresh environment (a new staging / a rebuilt production).
- All existing super_admins are locked out (very rare — normally invite from within the panel).

The script **refuses to run** if any `super_admin` already exists in `platform_admins` with status `active`. That's intentional — bootstrap is a one-time gate.

## Prerequisites

- Access to a shell with `DATABASE_URL` pointed at the target Neon database (direct URL, not pooled — see [`database-migrations.md`](./database-migrations.md#the-neon-pooled-vs-direct-gotcha)).
- `PLATFORM_JWT_SECRET` and `PLATFORM_MFA_SECRET_KEY` already set in the target environment (see [`secret-rotation.md`](./secret-rotation.md)).
- The person who will become super_admin ready to receive the token via a secure out-of-band channel (Signal, in-person). Not email, not Slack.

## Step 1 — mint the bootstrap token

```
npm run platform:bootstrap-token -- --email you@yourdomain.com --note "Initial super admin, requested by CTO"
```

Args:
- `--email` — must be a valid email; the token is bound to this address so a leaked token can't be redeemed by someone else
- `--note` — free text ≥ 10 chars explaining who is running this and why. Stored in `bootstrap_tokens.created_by_note` for audit.

The script:
1. Refuses if any active `super_admin` exists in `platform_admins`.
2. Generates a plaintext token + SHA-256 hash.
3. Inserts the hash into `bootstrap_tokens` with a 24-hour expiry (`TOKEN_TTL_HOURS = 24`).
4. Prints the plaintext token to **stderr** exactly once. The plaintext is never stored; only the hash is on disk.

Sample output (on stderr):

```
=================================================
  PLATFORM BOOTSTRAP TOKEN — do not lose this!
=================================================
  email:      you@yourdomain.com
  expires_at: 2026-09-14T09:20:00.000Z
  token:      <plaintext-here>
=================================================
Hand-deliver via Signal or in person. Do NOT email or Slack this.
Bootstrap URL: /platform/bootstrap
```

## Step 2 — redeem the token in the browser

The recipient (email owner) visits `/platform/bootstrap`, pastes the token, and sets:
- password (subject to the platform panel's password rules)
- TOTP MFA (scan QR with authenticator app, confirm one code)

On success, a `platform_admins` row is inserted with `role='super_admin'`, `status='active'`, and the bootstrap token is marked consumed (single-use). Any subsequent redemption of the same token 400s.

## Step 3 — verify

Log in at `/platform/login` with email + password + TOTP. You should land on the platform overview. If a subsequent bootstrap run reports "REFUSED: a super_admin already exists," the flow succeeded.

## Failure modes

| Symptom | Meaning | Fix |
|---------|---------|-----|
| `REFUSED: a super_admin already exists` when you expected none | Someone already bootstrapped, or an admin from a snapshot restore is still active. | Investigate `SELECT * FROM platform_admins WHERE role='super_admin'`. If a defunct admin is holding the slot, mark `status='deactivated'` directly in the DB and re-run. Document who did what in the note. |
| Token expired | > 24h passed since mint | Re-run step 1. Note the previous mint in `--note`. |
| Bootstrap page 500s | `PLATFORM_JWT_SECRET` or `PLATFORM_MFA_SECRET_KEY` missing | Set them in the environment, redeploy, retry. |
| Recipient email doesn't match token | Token is email-bound. | Re-run step 1 with the right email. |

## What NOT to do

- **Do not email or Slack the token.** Any medium the sender doesn't fully control is a leak. Signal, in-person, or a shared secret manager only.
- **Do not commit the token to git.** It's plaintext.
- **Do not run the script "just to see it work" in production.** Each mint creates a live token in the DB — if you don't intend to redeem it, delete the row afterward.

## Inviting further platform admins (normal path)

Once the first super_admin exists, further admins are invited from `/platform/admins` inside the panel — no more bootstrap script. The panel enforces role rules (super_admin can create any role; admin can create read-only; read-only can create nothing). Every invite goes through `withPlatformAudit()` so the reason is on the record.
