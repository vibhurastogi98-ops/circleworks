import { RATE_LIMIT_RULES, RateLimitRule } from './rate-limit.constants';

function normalizePath(path: string) {
  return path.replace(/^\/api\/v\d+/, '').split('?')[0] || '/';
}

function isBulkPath(path: string) {
  return path.includes('/batch') || path.includes('/bulk') || path.includes('/import');
}

function isPayrollProcessingPath(path: string, method: string) {
  if (!path.startsWith('/payroll')) return false;
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
}

function isReportGenerationPath(path: string, method: string) {
  if (!path.startsWith('/reports')) return false;
  return ['POST', 'PUT', 'PATCH'].includes(method) || path.includes('/generate') || path.includes('/export');
}

export function classifyRateLimitRules(path: string, method: string, hasApiKey: boolean): RateLimitRule[] {
  const normalizedPath = normalizePath(path);
  const normalizedMethod = method.toUpperCase();

  if (normalizedPath === '/health' || normalizedPath === '/' || normalizedPath.startsWith('/docs')) {
    return [];
  }

  if (normalizedPath === '/auth/login' || normalizedPath === '/auth/signup' || normalizedPath === '/auth/register') {
    return [RATE_LIMIT_RULES.authCredential];
  }

  if (
    normalizedPath === '/auth/forgot-password' ||
    normalizedPath === '/auth/reset-password' ||
    normalizedPath.startsWith('/auth/mfa')
  ) {
    return [RATE_LIMIT_RULES.authSensitive];
  }

  if (hasApiKey) {
    return [RATE_LIMIT_RULES.publicApiKey];
  }

  const rules: RateLimitRule[] = [RATE_LIMIT_RULES.generalUser];

  if (isPayrollProcessingPath(normalizedPath, normalizedMethod)) {
    rules.push(RATE_LIMIT_RULES.payrollCompany);
  }

  if (isBulkPath(normalizedPath)) {
    rules.push(RATE_LIMIT_RULES.bulkCompany);
  }

  if (isReportGenerationPath(normalizedPath, normalizedMethod)) {
    rules.push(RATE_LIMIT_RULES.reportUser);
  }

  rules.push(RATE_LIMIT_RULES.companyAggregate);
  return rules;
}

