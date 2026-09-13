# Database migrations

## What we use

- **ORM**: Drizzle ORM (`drizzle-orm` + `drizzle-orm/postgres-js`)
- **Runtime driver**: [`postgres`](https://github.com/porsager/postgres) (`postgres-js`)
- **Migration tool**: `drizzle-kit`
- **Database**: Neon Postgres
- **Config**: [`drizzle.config.ts`](../drizzle.config.ts) — schema in `src/db/schema.ts`, migrations in `drizzle/`

## Running migrations

### Locally (against your own Neon branch)

```
DATABASE_URL=<your-branch-direct-url> npx drizzle-kit push
```

`push` diffs the schema in `src/db/schema.ts` against the target DB and applies the delta. It also picks up any new `drizzle/*.sql` files that haven't been applied.

### In CI (against production Neon)

The `migrate` job in [`.github/workflows/node.js.yml`](../.github/workflows/node.js.yml) runs `npx drizzle-kit push` on every push to `main`, after the `build` job passes. It reads `DATABASE_URL` from GitHub Actions secrets.

The migrate job runs **independently of Vercel's own deploy** — the deploy and the migration are not gated on each other. If a migration fails, CI is red but Vercel may still deploy new code that expects the new schema. Rollback plan: revert the code commit; do not attempt to "undo" a Drizzle push (it's a forward-only tool).

## The Neon pooled-vs-direct gotcha

Neon offers two connection strings for the same database:
- **Pooled** (host contains `-pooler`): high-concurrency, transaction-mode pooler. Good for the app runtime.
- **Direct** (host does not contain `-pooler`): single-session, session-mode. Good for admin/DDL work.

**Use the direct URL for `DATABASE_URL` in the GitHub Actions `migrate` job.** DDL from `drizzle-kit push` can fail or hang on the pooled connection. The app runtime (Vercel `DATABASE_URL`) should use the pooled URL.

Symptoms of getting these swapped:
- Migrations succeed locally but time out in CI → CI is on the pooled URL, switch to direct.
- App runtime is slow / dropped connections under load → app is on the direct URL, switch to pooled.

## `channel_binding=require` — automatically stripped

Neon adds `channel_binding=require` to the URL it hands out. `postgres-js` doesn't support it. [`src/db/index.ts`](../src/db/index.ts) strips it automatically at runtime. `drizzle-kit push` handles it fine so no action needed there.

## Seed data rule (from CLAUDE.md, restated)

**Never add seed data (`INSERT` / `COPY` / `UPDATE`) to a migration file that has already been applied or merged.** Drizzle tracks migrations by filename in `__drizzle_migrations` and won't re-run one whose hash is already recorded. Any seed rows tacked onto an existing migration silently never land in environments where that migration already ran — the file *looks* correct on disk but the data never gets there.

**Rule**: always put new seed data in a **fresh** migration file (`drizzle/00XX_<name>.sql`) with `ON CONFLICT DO NOTHING` for idempotence in fresh environments.

We hit this exactly once: the plan catalog seed in `drizzle/0028_platform_admin_phase2.sql` was added to an already-run migration and never made it to Neon, which broke the tenant-facing Billing page until the seed was re-applied manually.

## Auditing what's actually on Neon vs on disk

Sometimes it's worth confirming that the DB reflects reality. Quick pattern:

```
grep -l 'INSERT INTO\|COPY .* FROM' drizzle/*.sql
# For each one, connect to Neon and SELECT to confirm the rows exist.
```

If the file has an `INSERT INTO plans` but `SELECT count(*) FROM plans` returns 0, the seed silently no-op'd — re-apply the seed as a fresh migration.

## Applying a fresh migration by hand

If you can't wait for CI (rare — normally CI does this on merge):

```
DATABASE_URL=<direct-url> npx drizzle-kit push
```

Or, for a specific file:

```
psql "$DATABASE_URL" -f drizzle/00XX_new_thing.sql
```

The latter is safe for pure `CREATE TABLE IF NOT EXISTS` / idempotent seeds. Do not use it for `ALTER` statements — those go through `drizzle-kit push` so the schema hash stays in sync.

## Related files
- Migration set: [`drizzle/*.sql`](../drizzle/)
- Schema source of truth: [`src/db/schema.ts`](../src/db/schema.ts)
- Runtime client: [`src/db/index.ts`](../src/db/index.ts)
- CI workflow: [`.github/workflows/node.js.yml`](../.github/workflows/node.js.yml)
