# circleworks

Next.js 16 + Drizzle + Neon Postgres. Multi-tenant HR / payroll platform with a separate admin panel for the app owner.

## Where to start reading

Depending on why you're here:

- **New to the codebase** → [`docs/architecture-overview.md`](./docs/architecture-overview.md) — 3 account types, capability system, tenant vs platform-admin auth separation.
- **Wondering if X is wired to the DB or still mock** → [`docs/module-status.md`](./docs/module-status.md) — living REAL / MOCK / MIXED table across every module.
- **Running a migration** → [`runbooks/database-migrations.md`](./runbooks/database-migrations.md).
- **Standing up a super_admin** → [`runbooks/platform-admin-bootstrap.md`](./runbooks/platform-admin-bootstrap.md).
- **Rotating a secret** → [`runbooks/secret-rotation.md`](./runbooks/secret-rotation.md).
- **CI / Vercel deploy relationship** → [`runbooks/deploy-and-ci.md`](./runbooks/deploy-and-ci.md).
- **What's on the backlog** → [`brain/pending-tasks.md`](./brain/pending-tasks.md).
- **Why X is designed this way** → [`brain/decisions-log.md`](./brain/decisions-log.md).
- **Deferred bugs / known limitations** → [`brain/known-issues.md`](./brain/known-issues.md).
- **Platform admin panel full spec** → [`docs/platform-admin-spec.md`](./docs/platform-admin-spec.md).
- **Pre-Phase-2 app audit** → [`docs/audit-report.md`](./docs/audit-report.md).

## Repo layout

```
docs/       — architecture reference (what the system is)
runbooks/   — operational procedures (how to do a thing)
brain/      — session-independent context (backlog, decisions, known issues)
src/        — application code
drizzle/    — schema migrations
scripts/    — one-off ops scripts (bootstrap-token, table checks)
.github/    — CI workflow
```

## Ground rules for these docs

- If you wire a module to real data, update [`docs/module-status.md`](./docs/module-status.md) and cite the commit.
- If you make an architectural decision, append to [`brain/decisions-log.md`](./brain/decisions-log.md). Never edit an old entry — supersede.
- If you defer a bug at merge time, add it to [`brain/known-issues.md`](./brain/known-issues.md) with severity, so it doesn't get lost.
- Never add seed data to a migration file that has already been merged — see [`CLAUDE.md`](./CLAUDE.md) and [`runbooks/database-migrations.md`](./runbooks/database-migrations.md).

## Getting a dev environment running

Not documented here yet — TODO. Prereqs are Node 20+, a Neon branch's `DATABASE_URL`, Supabase project keys, and a Postmark server token (optional; email will noop without it). Full env inventory in [`runbooks/secret-rotation.md`](./runbooks/secret-rotation.md#secrets-inventory).
