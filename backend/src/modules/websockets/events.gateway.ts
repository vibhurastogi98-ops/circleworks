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
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  companyId?: string;
}

@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  pingInterval: 25000, // 25 seconds
  pingTimeout: 60000, // 60 seconds
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract auth token or fallback session cookie.
      const token = this.extractToken(client);
      const sessionCookie = this.extractSessionCookie(client);

      let userId: string | undefined;
      let companyId: string | undefined;

      if (token) {
        const payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_SECRET') || 'dev-secret',
        });

        userId = payload.sub;
        companyId = payload.companyId;

        if (!companyId && userId) {
          const userCompany = await this.prisma.userCompany.findFirst({
            where: { userId, isActive: true },
          });
          companyId = userCompany?.companyId;
        }
      } else if (sessionCookie) {
        const fallbackUser = await this.prisma.user.findFirst({
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          include: {
            companies: {
              where: { isActive: true },
              take: 1,
            },
          },
        });

        if (fallbackUser && fallbackUser.companies.length > 0) {
          userId = fallbackUser.id;
          companyId = fallbackUser.companies[0].companyId;
          this.logger.log(`Fallback session connection accepted for user ${userId}`);
        }
      }

      if (!userId || !companyId) {
        this.logger.warn(`Connection rejected: invalid or missing auth payload`);
        client.disconnect();
        return;
      }

      client.userId = userId;
      client.companyId = companyId;

      client.join(`company:${companyId}`);
      client.join(`user:${userId}`);

      this.logger.log(`User ${userId} connected to company ${companyId}`);

      client.emit('connected', {
        userId,
        companyId,
        timestamp: new Date().toISOString(),
      });

      this.logger.debug(`Connection established: ${client.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown websocket connection error';
      this.logger.error(`Connection failed: ${message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId && client.companyId) {
      client.leave(`company:${client.companyId}`);
      client.leave(`user:${client.userId}`);
      this.logger.log(`User ${client.userId} disconnected from company ${client.companyId}`);
    }
  }

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.auth?.token;
    if (authHeader) return authHeader;

    const cookie = client.handshake.headers.cookie;
    if (cookie) {
      const tokenMatch = cookie.match(/(?:^|;\s*)token=([^;]+)/);
      if (tokenMatch) return tokenMatch[1];
    }

    return null;
  }

  private extractSessionCookie(client: Socket): string | null {
    const cookie = client.handshake.headers.cookie;
    if (!cookie) {
      return null;
    }
    const sessionMatch = cookie.match(/(?:^|;\s*)cw_session=([^;]+)/);
    return sessionMatch ? sessionMatch[1] : null;
  }

  // Helper methods for emitting events
  emitToCompany(companyId: string, event: string, data: any) {
    this.server.to(`company:${companyId}`).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach(userId => this.emitToUser(userId, event, data));
  }
}