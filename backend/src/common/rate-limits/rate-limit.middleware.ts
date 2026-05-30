import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import {
  RateLimiterMemory,
  RateLimiterRedis,
  RateLimiterRes,
  IRateLimiterOptions,
} from 'rate-limiter-flexible';
import { PrismaService } from '@/prisma/prisma.service';
import { classifyRateLimitRules } from './rate-limit.classifier';
import { RateLimitRule, RateLimitScope } from './rate-limit.constants';

interface RateLimitIdentity {
  ip: string;
  userId?: string;
  companyId?: string;
  apiKey?: string;
}

interface ConsumedLimit {
  rule: RateLimitRule;
  result: RateLimiterRes;
}

type FlexibleLimiter = RateLimiterRedis | RateLimiterMemory;

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly redis?: Redis;
  private readonly limiters = new Map<string, FlexibleLimiter>();
  private readonly jwtSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'dev-secret';
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        enableReadyCheck: true,
        maxRetriesPerRequest: 2,
        lazyConnect: true,
      });
      this.redis.on('error', (error) => {
        console.warn(
          '[RateLimit] Redis unavailable; limiter will fail open for this request.',
          error.message,
        );
      });
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = this.getHeader(req, 'x-api-key');
    const rules = classifyRateLimitRules(req.path, req.method, Boolean(apiKey));

    if (rules.length === 0) {
      next();
      return;
    }

    try {
      const identity = await this.resolveIdentity(req, apiKey);
      const applicableRules = rules.filter((rule) =>
        this.hasIdentityForScope(identity, rule.scope),
      );

      if (applicableRules.length === 0) {
        next();
        return;
      }

      const consumed: ConsumedLimit[] = [];

      for (const rule of applicableRules) {
        const effectiveRule = this.applyConfiguredLimits(rule);
        const limiter = this.getLimiter(effectiveRule);
        const key = this.buildKey(effectiveRule, identity);
        try {
          const result = await limiter.consume(key);
          consumed.push({ rule: effectiveRule, result });
        } catch (error) {
          if (error instanceof RateLimiterRes || this.isRateLimiterRes(error)) {
            this.sendRateLimitExceeded(
              res,
              effectiveRule,
              error as RateLimiterRes,
            );
            return;
          }

          throw error;
        }
      }

      this.setRateLimitHeaders(res, this.mostConstrainedLimit(consumed));
      next();
    } catch (error) {
      console.warn(
        '[RateLimit] Failed to evaluate request; allowing request to continue.',
        error,
      );
      next();
    }
  }

  private getLimiter(rule: RateLimitRule): FlexibleLimiter {
    const configuredRule = this.applyConfiguredLimits(rule);
    const existing = this.limiters.get(configuredRule.id);
    if (existing) return existing;

    const options: IRateLimiterOptions = {
      keyPrefix: configuredRule.keyPrefix,
      points: configuredRule.points,
      duration: configuredRule.durationSeconds,
      execEvenly: false,
    };

    const limiter = this.redis
      ? new RateLimiterRedis({
          ...options,
          storeClient: this.redis,
          insuranceLimiter: new RateLimiterMemory(options),
        })
      : new RateLimiterMemory(options);

    this.limiters.set(configuredRule.id, limiter);
    return limiter;
  }

  private async resolveIdentity(
    req: Request,
    apiKey?: string,
  ): Promise<RateLimitIdentity> {
    const userId = this.extractUserId(req);
    const requestedCompanyId =
      this.getHeader(req, 'x-company-id') ||
      this.extractCompanyIdFromPath(req.path);
    const companyId =
      requestedCompanyId ||
      (userId ? await this.resolveActiveCompanyId(userId) : undefined);

    return {
      ip: this.getClientIp(req),
      userId,
      companyId,
      apiKey,
    };
  }

  private extractUserId(req: Request) {
    const authHeader = this.getHeader(req, 'authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;
    if (!token) return undefined;

    try {
      const payload = jwt.verify(token, this.jwtSecret) as {
        sub?: string;
        userId?: string;
      };
      return payload.sub || payload.userId;
    } catch {
      return undefined;
    }
  }

  private async resolveActiveCompanyId(userId: string) {
    const membership = await this.prisma.userCompany.findFirst({
      where: { userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
      select: { companyId: true },
    });

    return membership?.companyId;
  }

  private extractCompanyIdFromPath(path: string) {
    const companyMatch = path.match(/\/compan(?:y|ies)\/([^/]+)/);
    if (!companyMatch?.[1] || companyMatch[1] === 'switch') return undefined;
    return companyMatch[1];
  }

  private buildKey(rule: RateLimitRule, identity: RateLimitIdentity) {
    switch (rule.scope) {
      case 'ip':
        return `${identity.ip}:${rule.id}`;
      case 'user':
        return `${identity.userId}:${rule.id}`;
      case 'company':
        return `${identity.companyId}:${rule.id}`;
      case 'key':
        return `${identity.apiKey}:${rule.id}`;
      default:
        return identity.ip;
    }
  }

  private hasIdentityForScope(
    identity: RateLimitIdentity,
    scope: RateLimitScope,
  ) {
    if (scope === 'ip') return Boolean(identity.ip);
    if (scope === 'user') return Boolean(identity.userId);
    if (scope === 'company') return Boolean(identity.companyId);
    if (scope === 'key') return Boolean(identity.apiKey);
    return false;
  }

  private mostConstrainedLimit(consumed: ConsumedLimit[]) {
    return consumed.sort(
      (a, b) => a.result.remainingPoints - b.result.remainingPoints,
    )[0];
  }

  private setRateLimitHeaders(res: Response, consumed?: ConsumedLimit) {
    if (!consumed) return;

    const resetAt = this.resetEpochSeconds(consumed.result);
    res.setHeader('X-RateLimit-Limit', String(consumed.rule.points));
    res.setHeader(
      'X-RateLimit-Remaining',
      String(Math.max(consumed.result.remainingPoints, 0)),
    );
    res.setHeader('X-RateLimit-Reset', String(resetAt));
  }

  private sendRateLimitExceeded(
    res: Response,
    rule: RateLimitRule,
    limiterResult: RateLimiterRes,
  ) {
    const retryAfterSeconds = Math.max(
      Math.ceil(limiterResult.msBeforeNext / 1000),
      1,
    );
    const resetAt = new Date(Date.now() + limiterResult.msBeforeNext);

    res.setHeader('X-RateLimit-Limit', String(rule.points));
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader(
      'X-RateLimit-Reset',
      String(Math.floor(resetAt.getTime() / 1000)),
    );
    res.setHeader('Retry-After', String(retryAfterSeconds));

    const requestId = res.req?.headers?.['x-request-id'] || randomUUID();

    res.status(429).json({
      statusCode: 429,
      message: 'Rate limit exceeded',
      error: 'RATE_LIMIT_EXCEEDED',
      requestId,
      limit: rule.points,
      resetAt: resetAt.toISOString(),
      retryAfterSeconds,
    });
  }

  private applyConfiguredLimits(rule: RateLimitRule): RateLimitRule {
    if (rule.scope !== 'key') return rule;

    const configuredPoints = Number(
      this.configService.get<string>('RATE_LIMIT_REQUESTS') || rule.points,
    );
    const configuredWindowMs = Number(
      this.configService.get<string>('RATE_LIMIT_WINDOW_MS') || 60000,
    );

    return {
      ...rule,
      points:
        Number.isFinite(configuredPoints) && configuredPoints > 0
          ? configuredPoints
          : rule.points,
      durationSeconds:
        Number.isFinite(configuredWindowMs) && configuredWindowMs > 0
          ? Math.ceil(configuredWindowMs / 1000)
          : rule.durationSeconds,
    };
  }

  private resetEpochSeconds(result: RateLimiterRes) {
    return Math.floor((Date.now() + result.msBeforeNext) / 1000);
  }

  private getClientIp(req: Request) {
    const forwardedFor = this.getHeader(req, 'x-forwarded-for');
    if (forwardedFor) return forwardedFor.split(',')[0].trim();
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private getHeader(req: Request, name: string) {
    const value = req.headers[name.toLowerCase()];
    if (Array.isArray(value)) return value[0];
    return value;
  }

  private isRateLimiterRes(error: unknown): error is RateLimiterRes {
    return Boolean(
      error &&
      typeof error === 'object' &&
      'msBeforeNext' in error &&
      'remainingPoints' in error,
    );
  }
}
