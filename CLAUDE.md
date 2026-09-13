# Circleworks Project
This is a Next.js fullstack project.

## Migrations & seed data

**Never add seed data (`INSERT` / `COPY` / `UPDATE`) to a migration file that has already been applied or merged.** Drizzle tracks migrations by filename in `__drizzle_migrations` and won't re-run one whose hash it's already recorded, so any seed rows tacked onto an existing migration silently never land in environments where that migration already ran — even though the file *looks* correct on disk.

Always put new seed data in a **fresh migration file** (`drizzle/00XX_<name>.sql`). Use `ON CONFLICT DO NOTHING` on the seed so it stays idempotent for fresh environments.

We hit this once already: the plan catalog seed in `drizzle/0028_platform_admin_phase2.sql` was added to an already-run migration and never made it to Neon, which broke the tenant-facing Billing page until the seed was re-applied manually.
