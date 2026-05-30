export type RateLimitScope = 'ip' | 'user' | 'company' | 'key';

export interface RateLimitRule {
  id: string;
  scope: RateLimitScope;
  points: number;
  durationSeconds: number;
  keyPrefix: string;
}

export const RATE_LIMIT_RULES = {
  authCredential: {
    id: 'auth_credential',
    scope: 'ip',
    points: 5,
    durationSeconds: 60,
    keyPrefix: 'rl:ip',
  },
  authSensitive: {
    id: 'auth_sensitive',
    scope: 'ip',
    points: 3,
    durationSeconds: 15 * 60,
    keyPrefix: 'rl:ip',
  },
  generalUser: {
    id: 'general_user',
    scope: 'user',
    points: 100,
    durationSeconds: 60,
    keyPrefix: 'rl:user',
  },
  payrollCompany: {
    id: 'payroll_company',
    scope: 'company',
    points: 5,
    durationSeconds: 60,
    keyPrefix: 'rl:company',
  },
  bulkCompany: {
    id: 'bulk_company',
    scope: 'company',
    points: 10,
    durationSeconds: 60 * 60,
    keyPrefix: 'rl:company',
  },
  reportUser: {
    id: 'report_user',
    scope: 'user',
    points: 20,
    durationSeconds: 60 * 60,
    keyPrefix: 'rl:user',
  },
  companyAggregate: {
    id: 'company_aggregate',
    scope: 'company',
    points: 1000,
    durationSeconds: 60,
    keyPrefix: 'rl:company',
  },
  publicApiKey: {
    id: 'public_api_key',
    scope: 'key',
    points: 100,
    durationSeconds: 60,
    keyPrefix: 'rl:key',
  },
} as const satisfies Record<string, RateLimitRule>;

export type RateLimitRuleId = keyof typeof RATE_LIMIT_RULES;
