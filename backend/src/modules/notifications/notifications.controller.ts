import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly crud: PrismaCrudService) {}

  @Get()
  async list(@Query() query: Record<string, any>, @Request() req: any) {
    return this.crud.list(
      'notification',
      { ...query, userId: query.userId || req.user?.id },
      {
        filterMap: { userId: 'userId', isRead: 'isRead', type: 'type' },
      },
    );
  }

  @Put('mark-read')
  async markRead(@Body() body: any, @Request() req: any) {
    const ids = body.ids || (body.id ? [body.id] : undefined);
    const where = ids?.length
      ? { id: { in: ids }, userId: req.user?.id }
      : { userId: req.user?.id, isRead: false };

    const result = await this.crud.prismaClient.notification.updateMany({
      where,
      data: { isRead: true, readAt: new Date() },
    });

    return { updated: result.count };
  }

  @Put('preferences')
  async updatePreferences(@Body() body: any, @Request() req: any) {
    return {
      userId: req.user?.id,
      preferences: body,
      updatedAt: new Date().toISOString(),
    };
  }

  @Put(':id/read')
  async markOneRead(@Param('id') id: string, @Request() req: any) {
    return this.crud.prismaClient.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
