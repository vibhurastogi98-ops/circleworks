# Secret rotation

Every rotatable secret in the app, what it does, where it needs to be updated. Follow this file when a secret is exposed, when a team member with access leaves, or on a routine cycle.

## Secrets inventory

| Secret | What breaks if wrong / missing | Where it lives |
|--------|-------------------------------|----------------|
| `DATABASE_URL` | All Drizzle queries; the entire app | Local `.env.local`, Vercel project env vars, GitHub Actions secrets |
| `JWT_SECRET` | Tenant JWT session (`cw_session` cookie) — active sessions invalidated on rotation | Local `.env.local`, Vercel env vars |
| `PLATFORM_JWT_SECRET` | Platform admin session (`cw_platform_session` cookie) — platform admins forced to re-login | Local `.env.local`, Vercel env vars |
| `PLATFORM_MFA_SECRET_KEY` | TOTP encryption for platform admins' MFA secrets in `platform_admins.mfa_secret_encrypted`. Rotating breaks every existing admin's TOTP; requires re-enrollment. | Local `.env.local`, Vercel env vars |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Storage uploads (creator documents), Supabase admin ops (force-MFA-reset, resend-invite from platform panel) | Local `.env.local`, Vercel env vars |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side Supabase auth flows | Local `.env.local`, Vercel env vars |
| `NEXT_PUBLIC_SUPABASE_URL` | Base URL for Supabase client | Local `.env.local`, Vercel env vars |
| `POSTMARK_SERVER_TOKEN` | Transactional email — invites, invoices, password reset. Fails soft: send returns `false`, work continues. | Local `.env.local`, Vercel env vars |
| `POSTMARK_SENDER_EMAIL` | From address on outgoing mail | Local `.env.local`, Vercel env vars |
| `REDIS_URL` (optional) | Backing store for platform rate-limits. Absent → falls back to in-memory per-process buckets. | Vercel env vars (optional) |
| `ANTHROPIC_API_KEY` (optional) | Circe AI assistant. Absent → widget disabled gracefully. | Vercel env vars |
| `PLAID_CLIENT_ID` / `PLAID_ENV` (optional) | Plaid bank verification flows | Local `.env.local`, Vercel env vars |

## Where each surface lives

Three places may hold the same secret. Rotate all three or nothing works.

1. **Local `.env.local`** — every developer's machine. Not in git (see `.gitignore`).
2. **Vercel project env vars** — the app runtime. `Settings → Environment Variables` in the Vercel dashboard, or `vercel env pull` / `vercel env add`.
3. **GitHub Actions secrets** — the CI `migrate` job and any workflow that runs the app. `Settings → Secrets and variables → Actions` in GitHub.

Currently only `DATABASE_URL` is in all three. Everything else lives in local `.env.local` + Vercel.

## Rotation procedure — general

1. **Announce**: post in team channel that a rotation is happening for `<secret>` at `<time>`. Note the blast radius (below).
2. **Provision the new value** wherever it comes from (Neon dashboard, Supabase project, Postmark, or `openssl rand -hex 32` for a JWT-style secret).
3. **Update every surface** from the "Where it lives" column, in the right order (below).
4. **Verify** by exercising a code path that uses the secret.
5. **Retire the old value** — delete it from any external system that stores it (Neon old password, Supabase old key, Postmark old token) so a leak of the old value becomes moot.

## Per-secret specifics

### `DATABASE_URL` (Neon password)

**Blast radius**: brief downtime while Vercel re-deploys with the new URL; any long-lived DB connection is dropped.

Order:
1. In Neon: reset the role's password. Neon prints both the pooled and direct URLs.
2. Update GitHub Actions secret `DATABASE_URL` with the **direct** URL (see [`database-migrations.md`](./database-migrations.md#the-neon-pooled-vs-direct-gotcha)).
3. Update Vercel env var `DATABASE_URL` with the **pooled** URL.
4. Update local `.env.local` — devs' choice, usually pooled.
5. Trigger a Vercel redeploy so runtime picks up the new value.
6. Verify: hit any Drizzle-backed API route.
7. Retire the old password (Neon confirms the reset — nothing else to do).

**If exposed in git history**: Neon lets you invalidate the old password immediately by resetting; that's enough. Then rotate `JWT_SECRET` too if you think the DB was actually accessed (session tokens could have been re-signed).

### `JWT_SECRET` and `PLATFORM_JWT_SECRET`

**Blast radius**: every session signed with the old secret becomes invalid instantly. Users are forced to log in again.

Order:
1. Generate a new secret: `openssl rand -hex 32`.
2. Update Vercel env var.
3. Update local `.env.local`.
4. Redeploy Vercel.
5. Verify: log in as a test account, confirm the session works.
6. There is nothing to "retire" — the old value is now inert.

`PLATFORM_JWT_SECRET` follows the same procedure but only affects platform admins (not tenant users).

### `PLATFORM_MFA_SECRET_KEY`

**Blast radius**: every platform admin's TOTP secret becomes undecryptable — they must re-enroll MFA. Non-recoverable, so treat as last-resort.

Rotate only if the key is known-compromised. Procedure requires each admin to re-scan their authenticator; document in `platform_audit_logs` with reason.

### `SUPABASE_SERVICE_ROLE_KEY`

**Blast radius**: Supabase Storage uploads (creator documents) and platform-side Supabase admin actions (`force-mfa-reset`, `resend-invite`) fail until updated.

Order:
1. In Supabase: rotate the service role key.
2. Update Vercel env var.
3. Update local `.env.local`.
4. Redeploy Vercel.
5. Verify: upload a document as a creator, or run a force-MFA-reset from the platform panel on a test tenant.

### `POSTMARK_SERVER_TOKEN`

**Blast radius**: outgoing email fails soft (returns `false`), work continues. Users don't see errors, they just don't receive email.

Order: rotate in Postmark → update Vercel + local → redeploy → send a test invite from `/settings/*/users`.

## Exposure playbook (something leaked)

We hit this once before: `.env.local` was tracked in git across 7 historic commits with the Neon password, `JWT_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` all in it. Fix was:
1. `.env.*` added to `.gitignore` (with `!.env.example`).
2. `git rm --cached .env.local` (untracked from HEAD; history still has it).
3. Rotate every secret that was in the file (in the order above), and note in the commit / decision log why.

If a secret is exposed in git history, **you cannot un-expose it by force-pushing** — assume anyone who cloned the repo has it. Rotation is the only fix.

## Related files
- Bootstrap flow (touches `PLATFORM_MFA_SECRET_KEY`): [`platform-admin-bootstrap.md`](./platform-admin-bootstrap.md)
- CI workflow (uses GitHub Actions secrets): [`../.github/workflows/node.js.yml`](../.github/workflows/node.js.yml)
- Runtime DB connection (uses `DATABASE_URL`): [`../src/db/index.ts`](../src/db/index.ts)
