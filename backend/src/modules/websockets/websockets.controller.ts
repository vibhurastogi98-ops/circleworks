import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { WebsocketsService } from './websockets.service';

interface NotificationTestDto {
  userId: string;
  title: string;
  description: string;
  type?: string;
  metadata?: Record<string, any>;
}

@Controller('websocket/test')
export class WebsocketsController {
  constructor(private readonly websocketsService: WebsocketsService) {}

  @Post('notification')
  async emitNotification(@Body() body: NotificationTestDto) {
    const { userId, title, description, type = 'SYSTEM', metadata } = body;
    if (!userId || !title || !description) {
      throw new BadRequestException('userId, title, and description are required');
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
