import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  companyId?: string;
  connectedAt?: number;
  joinedRooms?: Set<string>;
}

interface JwtPayload {
  sub?: string | number;
  userId?: string | number;
  id?: string | number;
  email?: string;
  role?: string;
  companyId?: string | number;
}

interface JoinRoomsPayload {
  companyId?: string;
  rooms?: string[];
}

@WebSocketGateway({
  namespace: '/',
  cors: {
    origin:
      process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000',
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 60000,
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private readonly activeConnections = new Map<
    string,
    { userId: string; companyId: string; connectedAt: number }
  >();
  private totalConnections = 0;
  private totalDisconnects = 0;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);

      if (!token) {
        this.rejectConnection(client, 'missing JWT');
        return;
      }

      const payload = this.verifyToken(token);
      const userId = this.resolveUserId(payload);
      const companyId = await this.resolveCompanyId(client, payload, userId);

      if (!userId || !companyId) {
        this.rejectConnection(client, 'invalid auth payload');
        return;
      }

      client.userId = userId;
      client.companyId = companyId;
      client.connectedAt = Date.now();
      client.joinedRooms = new Set();

      await this.joinAllowedRooms(client, [
        this.companyRoom(companyId),
        this.userRoom(userId),
      ]);

      this.activeConnections.set(client.id, {
        userId,
        companyId,
        connectedAt: client.connectedAt,
      });
      this.totalConnections += 1;

      this.logger.log(
        `User ${userId} connected to company ${companyId}; active=${this.activeConnections.size}`,
      );

      client.emit('connected', {
        userId,
        companyId,
        rooms: Array.from(client.joinedRooms),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown websocket connection error';
      this.logger.error(`Connection failed: ${message}`);
      this.rejectConnection(client, message);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.totalDisconnects += 1;
    const connection = this.activeConnections.get(client.id);
    const connectedForMs = connection
      ? Date.now() - connection.connectedAt
      : client.connectedAt
        ? Date.now() - client.connectedAt
        : 0;

    if (client.userId && client.companyId) {
      for (const room of client.joinedRooms || []) {
        client.leave(room);
      }
      this.logger.log(
        `User ${client.userId} disconnected from company ${client.companyId}; durationMs=${connectedForMs}; active=${Math.max(
          this.activeConnections.size - 1,
          0,
        )}`,
      );
    }

    this.activeConnections.delete(client.id);
  }

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomsPayload = {},
  ) {
    const requestedRooms = payload.rooms?.length
      ? payload.rooms
      : [
          payload.companyId
            ? this.companyRoom(payload.companyId)
            : client.companyId
              ? this.companyRoom(client.companyId)
              : undefined,
          client.userId ? this.userRoom(client.userId) : undefined,
        ].filter(Boolean);

    const joinedRooms = await this.joinAllowedRooms(client, requestedRooms);
    client.emit('rooms.joined', {
      rooms: joinedRooms,
      timestamp: new Date().toISOString(),
    });

    return { rooms: joinedRooms };
  }

  @SubscribeMessage('notification.join')
  async handleNotificationJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomsPayload = {},
  ) {
    return this.handleJoin(client, payload);
  }

  @SubscribeMessage('leave')
  async handleLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomsPayload = {},
  ) {
    const rooms = payload.rooms || [];
    const leftRooms: string[] = [];

    for (const room of rooms) {
      if (!this.isAllowedRoom(client, room)) continue;
      client.leave(room);
      client.joinedRooms?.delete(room);
      leftRooms.push(room);
    }

    client.emit('rooms.left', {
      rooms: leftRooms,
      timestamp: new Date().toISOString(),
    });

    return { rooms: leftRooms };
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) return authToken;

    const authorization = client.handshake.headers.authorization;
    const header = Array.isArray(authorization)
      ? authorization[0]
      : authorization;
    if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length);

    const cookies = this.parseCookies(client.handshake.headers.cookie);
    return (
      cookies.access_token ||
      cookies.accessToken ||
      cookies.token ||
      cookies.cw_session ||
      null
    );
  }

  private verifyToken(token: string): JwtPayload {
    const secrets = [
      this.configService.get<string>('WS_JWT_SECRET'),
      this.configService.get<string>('JWT_SECRET'),
      this.configService.get<string>('AUTH_SECRET'),
      this.configService.get<string>('SUPABASE_JWT_SECRET'),
      'circleworks-dev-secret-change-in-production',
      'dev-secret',
    ].filter(Boolean);

    let lastError: unknown;
    for (const secret of secrets) {
      try {
        return this.jwtService.verify<JwtPayload>(token, { secret });
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('JWT verification failed');
  }

  private resolveUserId(payload: JwtPayload) {
    const id = payload.sub ?? payload.userId ?? payload.id;
    return id === undefined || id === null ? undefined : String(id);
  }

  private async resolveCompanyId(
    client: Socket,
    payload: JwtPayload,
    userId?: string,
  ) {
    const requestedCompanyId =
      payload.companyId ||
      client.handshake.auth?.companyId ||
      this.firstHeader(client.handshake.headers['x-company-id']);

    if (requestedCompanyId) return String(requestedCompanyId);
    if (!userId) return undefined;

    const userCompany = await this.prisma.userCompany.findFirst({
      where: { userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
      select: { companyId: true },
    });

    return userCompany?.companyId;
  }

  private async joinAllowedRooms(
    client: AuthenticatedSocket,
    rooms: Array<string | undefined>,
  ) {
    const joinedRooms: string[] = [];

    for (const room of rooms) {
      if (!room || !this.isAllowedRoom(client, room)) continue;
      await client.join(room);
      client.joinedRooms?.add(room);
      joinedRooms.push(room);
    }

    return joinedRooms;
  }

  private isAllowedRoom(client: AuthenticatedSocket, room: string) {
    return (
      (client.companyId && room === this.companyRoom(client.companyId)) ||
      (client.userId && room === this.userRoom(client.userId))
    );
  }

  private companyRoom(companyId: string) {
    return `company:${companyId}`;
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }

  private parseCookies(cookieHeader?: string) {
    if (!cookieHeader) return {} as Record<string, string>;

    return cookieHeader.split(';').reduce(
      (cookies, pair) => {
        const [rawName, ...rawValue] = pair.trim().split('=');
        if (!rawName || rawValue.length === 0) return cookies;
        cookies[rawName] = decodeURIComponent(rawValue.join('='));
        return cookies;
      },
      {} as Record<string, string>,
    );
  }

  private firstHeader(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
  }

  private rejectConnection(client: Socket, reason: string) {
    this.logger.warn(`Connection rejected (${client.id}): ${reason}`);
    client.emit('connect_error', { message: 'Unauthorized' });
    client.disconnect(true);
  }

  // Helper methods for emitting events
  emitToCompany(companyId: string, event: string, data: any) {
    this.server.to(this.companyRoom(companyId)).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(this.userRoom(userId)).emit(event, data);
  }

  emitToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => this.emitToUser(userId, event, data));
  }

  getMetrics() {
    return {
      activeConnections: this.activeConnections.size,
      totalConnections: this.totalConnections,
      totalDisconnects: this.totalDisconnects,
    };
  }
}
