import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsGateway } from './events.gateway';
import { WebsocketsService } from './websockets.service';
import { WebsocketsController } from './websockets.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'dev-secret',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [WebsocketsController],
  providers: [EventsGateway, WebsocketsService],
  exports: [EventsGateway, WebsocketsService],
})
export class WebsocketsModule {}