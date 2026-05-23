import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { createHash, randomBytes } from 'crypto';

export type SessionLimitAction = 'cancel' | 'sign_out_oldest' | 'sign_out_others';

export interface DeviceInfo {
  type: string;
  browser: string;
  os: string;
  location: string;
  userAgent?: string;
}

export interface RefreshSession {
  sessionId: string;
  userId: string;
  deviceId: string;
  createdAt: string;
  lastActive: string;
  expiresAt: string;
  rememberMe: boolean;
  deviceInfo: DeviceInfo;
}

interface CreateSessionInput {
  userId: string;
  rememberMe?: boolean;
  deviceInfo: DeviceInfo;
  limitAction?: SessionLimitAction;
}

interface RotateSessionInput {
  refreshToken: string;
}

const DEFAULT_MAX_SESSIONS = 5;
const STANDARD_REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;
const REMEMBER_ME_REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30;

@Injectable()
export class SessionService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly maxSessions: number;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://127.0.0.1:6379';
    this.redis = new Redis(redisUrl, {
      enableReadyCheck: true,
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });
    this.maxSessions = Number(this.configService.get<string>('MAX_USER_SESSIONS') || DEFAULT_MAX_SESSIONS);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async createSession(input: CreateSessionInput) {
    await this.enforceSessionLimit(input.userId, input.limitAction || 'cancel');

    const now = new Date();
    const ttlSeconds = input.rememberMe ? REMEMBER_ME_REFRESH_TTL_SECONDS : STANDARD_REFRESH_TTL_SECONDS;
    const session: RefreshSession = {
      sessionId: this.randomId(),
      userId: input.userId,
      deviceId: this.randomId(),
      createdAt: now.toISOString(),
      lastActive: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
      rememberMe: Boolean(input.rememberMe),
      deviceInfo: input.deviceInfo,
    };
    const refreshToken = this.randomToken();

    await this.storeSession(session, refreshToken, ttlSeconds);
    return { refreshToken, session, ttlSeconds };
  }

  async rotateRefreshToken(input: RotateSessionInput) {
    const tokenKey = this.refreshTokenKey(input.refreshToken);
    const sessionId = await this.redis.get(tokenKey);
    if (!sessionId) return null;

    const session = await this.getSessionById(sessionId);
    await this.redis.del(tokenKey);
    if (!session) return null;

    const now = new Date();
    if (new Date(session.expiresAt) <= now) {
      await this.deleteSession(session);
      return null;
    }

    const ttlSeconds = Math.max(Math.ceil((new Date(session.expiresAt).getTime() - now.getTime()) / 1000), 1);
    const rotatedSession = { ...session, lastActive: now.toISOString() };
    const refreshToken = this.randomToken();

    await this.storeSession(rotatedSession, refreshToken, ttlSeconds);
    return { refreshToken, session: rotatedSession, ttlSeconds };
  }

  async revokeRefreshToken(refreshToken: string) {
    const sessionId = await this.redis.get(this.refreshTokenKey(refreshToken));
    if (!sessionId) return;

    const session = await this.getSessionById(sessionId);
    if (session) {
      await this.deleteSession(session);
    }

    await this.redis.del(this.refreshTokenKey(refreshToken));
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.getSessionById(sessionId);
    if (!session || session.userId !== userId) return false;
    await this.deleteSession(session);
    return true;
  }

  async revokeAllUserSessions(userId: string) {
    const sessions = await this.listSessions(userId);
    await Promise.all(sessions.map((session) => this.deleteSession(session)));
  }

  async revokeOtherUserSessions(userId: string, currentSessionId?: string) {
    const sessions = await this.listSessions(userId);
    await Promise.all(
      sessions
        .filter((session) => session.sessionId !== currentSessionId)
        .map((session) => this.deleteSession(session)),
    );
  }

  async listSessions(userId: string) {
    const ids = await this.redis.zrevrange(this.userSessionsKey(userId), 0, -1);
    const sessions = await Promise.all(ids.map((id) => this.getSessionById(id)));
    return sessions
      .filter((session): session is RefreshSession => Boolean(session))
      .sort((a, b) => Date.parse(b.lastActive) - Date.parse(a.lastActive));
  }

  private async enforceSessionLimit(userId: string, action: SessionLimitAction) {
    await this.pruneExpiredSessions(userId);
    const sessions = await this.listSessions(userId);
    if (sessions.length < this.maxSessions) return;

    if (action === 'sign_out_oldest') {
      await this.deleteSession(sessions[sessions.length - 1]);
      return;
    }

    if (action === 'sign_out_others') {
      await Promise.all(sessions.map((session) => this.deleteSession(session)));
      return;
    }

    const error = new Error('Session limit reached') as Error & {
      code: string;
      maxSessions: number;
      options: string[];
    };
    error.code = 'SESSION_LIMIT_REACHED';
    error.maxSessions = this.maxSessions;
    error.options = ['Sign out oldest', 'Sign out all others', 'Cancel'];
    throw error;
  }

  private async pruneExpiredSessions(userId: string) {
    const sessions = await this.listSessions(userId);
    const now = Date.now();
    await Promise.all(
      sessions
        .filter((session) => Date.parse(session.expiresAt) <= now)
        .map((session) => this.deleteSession(session)),
    );
  }

  private async storeSession(session: RefreshSession, refreshToken: string, ttlSeconds: number) {
    const refreshTokenKey = this.refreshTokenKey(refreshToken);
    await this.redis
      .multi()
      .set(this.sessionKey(session.sessionId), JSON.stringify(session), 'EX', ttlSeconds)
      .set(refreshTokenKey, session.sessionId, 'EX', ttlSeconds)
      .set(this.sessionRefreshKey(session.sessionId), refreshTokenKey, 'EX', ttlSeconds)
      .zadd(this.userSessionsKey(session.userId), Date.parse(session.lastActive), session.sessionId)
      .expire(this.userSessionsKey(session.userId), REMEMBER_ME_REFRESH_TTL_SECONDS)
      .exec();
  }

  private async getSessionById(sessionId: string) {
    const raw = await this.redis.get(this.sessionKey(sessionId));
    return raw ? (JSON.parse(raw) as RefreshSession) : null;
  }

  private async deleteSession(session: RefreshSession) {
    const refreshKey = await this.redis.get(this.sessionRefreshKey(session.sessionId));
    const keysToDelete = [this.sessionKey(session.sessionId), this.sessionRefreshKey(session.sessionId)];
    if (refreshKey) keysToDelete.push(refreshKey);

    await this.redis
      .multi()
      .del(...keysToDelete)
      .zrem(this.userSessionsKey(session.userId), session.sessionId)
      .exec();
  }

  private sessionKey(sessionId: string) {
    return `auth:session:${sessionId}`;
  }

  private refreshTokenKey(refreshToken: string) {
    return `auth:refresh:${createHash('sha256').update(refreshToken).digest('hex')}`;
  }

  private sessionRefreshKey(sessionId: string) {
    return `auth:session_refresh:${sessionId}`;
  }

  private userSessionsKey(userId: string) {
    return `auth:user_sessions:${userId}`;
  }

  private randomId() {
    return randomBytes(16).toString('hex');
  }

  private randomToken() {
    return randomBytes(48).toString('base64url');
  }
}
