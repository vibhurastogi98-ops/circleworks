/**
 * Platform-admin RBAC — completely separate from tenant `src/lib/rbac.ts`.
 * Do NOT import from `@/lib/rbac` here or from anything under `src/app/platform`.
 * CI grep-check enforces that invariant (see .github/workflows/node.js.yml).
 *
 * See docs/platform-admin-spec.md §6.2.
 */

export const PLATFORM_ADMIN_ROLES = [
  "super_admin",
  "ops",
  "risk_analyst",
  "billing_ops",
  "read_only",
] as const;

export type PlatformAdminRole = (typeof PLATFORM_ADMIN_ROLES)[number];

/**
 * Every action a platform admin can take. Grep-checkable, easy to extend.
 * Keep in sync with route handlers that call `requirePlatformPermission`.
 */
export const PLATFORM_ACTIONS = [
  // Directory
  "tenant.read",
  "tenant.suspend",
  "tenant.reactivate",
  "tenant.softDelete",
  // Impersonation
  "impersonation.start",
  "impersonation.stop",
  // Support
  "supportUser.read",
  "supportUser.forceMfaReset",
  "supportUser.forcePasswordReset",
  "supportUser.resendInvite",
  // Admin management
  "admin.read",
  "admin.invite",
  "admin.edit",
  "admin.disable",
  "admin.revokeSession",
  // Audit
  "audit.read",
  "audit.export",
  // Billing (Phase 2 — allowed here so routes can pre-declare)
  "billing.changePlan",
  "billing.editSeats",
  "billing.viewInvoices",
  // Flags (Phase 2)
  "flag.setTenantOverride",
  "flag.setKillSwitch",
  // Risk (Phase 3)
  "risk.holdPayroll",
  "risk.releasePayroll",
  "risk.reviewKyb",
  "risk.viewAchReturns",
] as const;

export type PlatformAction = (typeof PLATFORM_ACTIONS)[number];

const ALL: PlatformAction[] = [...PLATFORM_ACTIONS];

// Explicit map — no inheritance, no defaults. If a role isn't listed for an
// action, they can't do it. `super_admin` gets everything explicitly, not
// via a "default true" fallback.
export const PLATFORM_ROLE_PERMISSIONS: Record<PlatformAdminRole, ReadonlySet<PlatformAction>> = {
  super_admin: new Set<PlatformAction>(ALL),
  ops: new Set<PlatformAction>([
    "tenant.read",
    "tenant.suspend",
    "tenant.reactivate",
    "impersonation.start",
    "impersonation.stop",
    "supportUser.read",
    "supportUser.forceMfaReset",
    "supportUser.forcePasswordReset",
    "supportUser.resendInvite",
    "audit.read",
    "audit.export",
    "admin.read",
    "billing.viewInvoices",
    "risk.viewAchReturns",
  ]),
  risk_analyst: new Set<PlatformAction>([
    "tenant.read",
    "audit.read",
    "risk.holdPayroll",
    "risk.releasePayroll",
    "risk.reviewKyb",
    "risk.viewAchReturns",
    "admin.read",
  ]),
  billing_ops: new Set<PlatformAction>([
    "tenant.read",
    "audit.read",
    "billing.changePlan",
    "billing.editSeats",
    "billing.viewInvoices",
    "flag.setTenantOverride",
    "admin.read",
  ]),
  read_only: new Set<PlatformAction>([
    "tenant.read",
    "audit.read",
    "supportUser.read",
    "admin.read",
    "billing.viewInvoices",
    "risk.viewAchReturns",
  ]),
};

/** Actions that require a fresh MFA (within `PLATFORM_STEPUP_WINDOW_MS`). */
export const STEPUP_ACTIONS: ReadonlySet<PlatformAction> = new Set<PlatformAction>([
  "impersonation.start",
  "tenant.suspend",
  "tenant.reactivate",
  "tenant.softDelete",
  "billing.changePlan",
  "admin.invite",
  "admin.edit",
  "admin.disable",
  "admin.revokeSession",
  "risk.releasePayroll",
  "supportUser.forceMfaReset",
  "supportUser.forcePasswordReset",
  "flag.setKillSwitch",
]);

export const PLATFORM_STEPUP_WINDOW_MS = 5 * 60 * 1000;

export function hasPlatformPermission(role: PlatformAdminRole, action: PlatformAction): boolean {
  return PLATFORM_ROLE_PERMISSIONS[role]?.has(action) ?? false;
}
