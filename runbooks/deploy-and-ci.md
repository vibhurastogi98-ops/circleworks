# Deploy & CI

Two independent systems ship code and schema changes. This file explains what each does, how they relate, and how to reason about failures.

## The two systems

### 1. Vercel deploy (application)

- **Trigger**: every push to `main` and every PR (preview deploy).
- **What it does**: builds and deploys the Next.js app from `src/`. Uses Vercel's build pipeline, not the GitHub Actions workflow.
- **Where it reads env from**: Vercel project env vars (Settings → Environment Variables).
- **Where it lives**: [vercel.com](https://vercel.com) → the CircleWorks project.
- **Rollback**: Vercel dashboard → Deployments → "Promote to Production" on a previous deploy.

### 2. GitHub Actions workflow (`.github/workflows/node.js.yml`)

- **Trigger**: every push and PR. The `migrate` job additionally requires push-to-`main`.
- **Jobs (in order)**:
  1. **`build`** — installs deps, runs platform admin security invariants (grep-based), then `npm run build`. On PR, also runs Lighthouse CI.
  2. **`security-headers`** — only on `main`; validates `next.config.ts` still declares the required security headers (CSP, HSTS with preload, etc.).
  3. **`migrate`** — only on push to `main`, and only after `build` passes. Runs `npx drizzle-kit push` against the production `DATABASE_URL` from GitHub Actions secrets.
  4. **`bundle-analysis`** — only on release publish.

### They are independent

Vercel's deploy is not gated on GitHub Actions passing, and GitHub Actions doesn't call Vercel. This has consequences:

- **A CI failure does not block a Vercel deploy.** If `build` in GitHub Actions fails but Vercel's own build succeeds, the app ships anyway. In practice this rarely matters — Vercel runs `npm run build` too, so if it's a real build error both fail. But the grep invariants (platform-admin security checks) live only in GitHub Actions. **If someone bypasses those and Vercel's build passes, code ships anyway.** Treat the invariants as a merge gate, not a deploy gate.
- **A `migrate` job failure does not roll back Vercel.** If new code depends on new schema and the migration fails, the deploy still goes out and starts throwing DB errors. Rollback plan: revert the code commit; do not try to "unpush" the migration.
- **A `migrate` success does not gate Vercel.** They race. In practice `migrate` runs after `build` and `build` takes long enough that Vercel usually wins, meaning the app can hit a schema that hasn't updated yet for a few seconds. Use `CREATE TABLE IF NOT EXISTS` and additive-only schema changes so the app is forward-compatible.

## The platform-admin security invariants (grep-checked in CI)

The `build` job enforces the separation between tenant and platform code with `grep -rEn` sweeps over `src/app/platform`, `src/app/api/platform`, and the platform `lib/*` files. It fails the build if any of the following appear:

- Imports from `@/lib/rbac` (`hasPermission`, `resolveBuiltInRole`, `CAPABILITY_MATRIX`)
- References to `SESSION_COOKIE` / `cw_session` (the tenant session cookie)
- Imports from `@/lib/capability-routes` (`getCapabilityRouteRedirect`)

These are the fastest, most brittle safety net for a critical property: the platform admin surface must never accidentally reuse tenant authorization. Full detail in [`../docs/platform-admin-spec.md`](../docs/platform-admin-spec.md) §11.

## Typical failure modes and how to read them

| Symptom | Likely cause | What to do |
|---------|--------------|------------|
| Vercel green, GitHub Actions red on `build` | Grep invariants tripped, or Lighthouse budget failed | Read the failing step output — the invariants log the offending file/line. Fix the code, push again. |
| Vercel green, GitHub Actions red on `migrate` | Schema drift, or Neon rejected DDL (see pooled-vs-direct in [`database-migrations.md`](./database-migrations.md)) | App is likely broken against the new code — revert the code commit, then investigate the migration separately |
| Both green, prod still broken | Env var missing on Vercel, or a `NEXT_PUBLIC_*` change wasn't picked up | Compare the failing route's `process.env` usage against Vercel's env panel; a redeploy is required after env changes |
| Vercel red on build | Real Next.js/TypeScript error | Fix in code; both systems will rebuild |
| CI passes locally but fails on GitHub Actions | Env dummy fallbacks in `node.js.yml` differ from real values | The workflow uses `DATABASE_URL: postgres://dummy:...` for the build; anything that tries to actually connect at build time (e.g. `getStaticProps`) will fail. Move the DB call to request time. |

## What "shipping a new feature" looks like end-to-end

1. Push branch → PR opened → Vercel preview deploy + GitHub Actions build run in parallel.
2. Review, merge to `main`.
3. **In parallel**: Vercel builds and deploys production; GitHub Actions runs `build` → `security-headers` → `migrate`.
4. If everything's green, done. If migrate failed, the new code is live against the old schema — revert.

## What "rolling back" looks like

- **Code**: Vercel dashboard → previous deploy → Promote to Production. Instant.
- **Schema**: There is no "roll back" — Drizzle push is forward-only. If a bad schema change lands, write a new migration to undo it (`ALTER TABLE ... DROP COLUMN ...` or the reverse) and push again. Only revert-by-write, never revert-by-file-delete.

## Related files
- Workflow: [`../.github/workflows/node.js.yml`](../.github/workflows/node.js.yml)
- Migration mechanics: [`./database-migrations.md`](./database-migrations.md)
- Where each secret lives: [`./secret-rotation.md`](./secret-rotation.md)
