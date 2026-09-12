import { describe, expect, it } from "vitest";

import {
  hasPlatformPermission,
  PLATFORM_ACTIONS,
  PLATFORM_ADMIN_ROLES,
  PLATFORM_ROLE_PERMISSIONS,
  STEPUP_ACTIONS,
} from "@/lib/platform-rbac";
import { IMPERSONATION_FORBIDDEN_TENANT_ACTIONS, assertNotImpersonatingOr } from "@/lib/platform-impersonation";
import { PLATFORM_AUDIT_REASONS, isPlatformAuditReason } from "@/lib/platform-audit-reasons";

describe("platform rbac", () => {
  it("super_admin has every action", () => {
    for (const action of PLATFORM_ACTIONS) {
      expect(hasPlatformPermission("super_admin", action)).toBe(true);
    }
  });

  it("read_only cannot mutate anything (no *.suspend, *.hold, *.change, admin.invite)", () => {
    const forbidden = PLATFORM_ACTIONS.filter((a) =>
      /\.(suspend|reactivate|softDelete|start|stop|forceMfaReset|forcePasswordReset|invite|edit|disable|revokeSession|changePlan|editSeats|setTenantOverride|setKillSwitch|holdPayroll|releasePayroll|reviewKyb|resendInvite|export)$/.test(a),
    );
    for (const action of forbidden) {
      expect(hasPlatformPermission("read_only", action)).toBe(false);
    }
  });

  it("billing_ops cannot impersonate or hold payroll", () => {
    expect(hasPlatformPermission("billing_ops", "impersonation.start")).toBe(false);
    expect(hasPlatformPermission("billing_ops", "risk.holdPayroll")).toBe(false);
    expect(hasPlatformPermission("billing_ops", "billing.changePlan")).toBe(true);
  });

  it("risk_analyst can hold/release payroll but not change billing", () => {
    expect(hasPlatformPermission("risk_analyst", "risk.holdPayroll")).toBe(true);
    expect(hasPlatformPermission("risk_analyst", "risk.releasePayroll")).toBe(true);
    expect(hasPlatformPermission("risk_analyst", "billing.changePlan")).toBe(false);
    expect(hasPlatformPermission("risk_analyst", "impersonation.start")).toBe(false);
  });

  it("every role in PLATFORM_ADMIN_ROLES has a permission entry", () => {
    for (const role of PLATFORM_ADMIN_ROLES) {
      expect(PLATFORM_ROLE_PERMISSIONS[role]).toBeInstanceOf(Set);
    }
  });

  it("step-up-required actions include the destructive ones", () => {
    for (const a of ["impersonation.start", "tenant.suspend", "billing.changePlan", "risk.releasePayroll", "admin.invite"] as const) {
      expect(STEPUP_ACTIONS.has(a)).toBe(true);
    }
  });
});

describe("impersonation forbid list", () => {
  it("blocks forbidden tenant actions when impersonating", () => {
    for (const action of IMPERSONATION_FORBIDDEN_TENANT_ACTIONS) {
      expect(() => assertNotImpersonatingOr(action, true)).toThrow(/impersonation_forbidden/);
    }
  });

  it("allows non-forbidden actions during impersonation", () => {
    expect(() => assertNotImpersonatingOr("employee.view", true)).not.toThrow();
  });

  it("is a no-op when not impersonating", () => {
    for (const action of IMPERSONATION_FORBIDDEN_TENANT_ACTIONS) {
      expect(() => assertNotImpersonatingOr(action, false)).not.toThrow();
    }
  });
});

describe("platform audit reasons", () => {
  it("closed enum — only known reasons pass", () => {
    for (const r of PLATFORM_AUDIT_REASONS) {
      expect(isPlatformAuditReason(r)).toBe(true);
    }
    expect(isPlatformAuditReason("free-form-typo")).toBe(false);
    expect(isPlatformAuditReason(123)).toBe(false);
    expect(isPlatformAuditReason(null)).toBe(false);
  });
});
