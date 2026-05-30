import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { WebsocketsService } from './websockets.service';
import { EventsGateway } from './events.gateway';

interface NotificationTestDto {
  userId: string;
  title: string;
  description: string;
  type?: string;
  metadata?: Record<string, any>;
}

@Controller('websocket/test')
export class WebsocketsController {
  constructor(
    private readonly websocketsService: WebsocketsService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Get('metrics')
  getMetrics() {
    return this.eventsGateway.getMetrics();
  }

  @Post('notification')
  async emitNotification(@Body() body: NotificationTestDto) {
    const { userId, title, description, type = 'SYSTEM', metadata } = body;
    if (!userId || !title || !description) {
      throw new BadRequestException(
        'userId, title, and description are required',
      );
    }

    const notification = {
      id: `test-${Date.now()}`,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      isRead: false,
      metadata,
    };

    this.websocketsService.emitNotificationNew(userId, { notification });
    return { success: true, notification };
  }
}
