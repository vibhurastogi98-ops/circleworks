/**
 * Sec. 02 — Redis cache key patterns (TTLs in seconds).
 * Prefer WS-driven invalidation over TTL expiry where possible.
 */
export const cacheKeys = {
  companyEmployees: (companyId: number) => `company:${companyId}:employees`,
  companyPayrollActive: (companyId: number) => `company:${companyId}:payroll:active`,
  companyDashboard: (companyId: number) => `company:${companyId}:dashboard`,
  employeeProfile: (employeeId: number) => `employee:${employeeId}:profile`,
  companyBenefitsPlans: (companyId: number) => `company:${companyId}:benefits:plans`,
} as const;

export const cacheTtlSec = {
  companyEmployees: 300,
  companyPayrollActive: 30,
  companyDashboard: 300,
  employeeProfile: 600,
  companyBenefitsPlans: 3600,
} as const;
