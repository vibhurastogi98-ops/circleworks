import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
@UseGuards(AuthGuard('jwt'))
export class WebhooksController {
  constructor(
    private readonly crud: PrismaCrudService,
    private readonly webhooksService: WebhooksService,
  ) {}

  @Get()
  async list(@Query() query: Record<string, any>) {
    return this.crud.list('webhook', query, {
      companyScoped: true,
      filterMap: { isActive: 'isActive' },
      searchFields: ['url'],
    });
  }

  @Post()
  async register(@Body() body: any) {
    return this.crud.create('webhook', {
      ...body,
      secret: body.secret || this.webhooksService.generateSecret(),
      isActive: body.isActive ?? true,
    });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.crud.get('webhook', id, { include: { deliveries: true } });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.crud.update('webhook', id, { isActive: false });
  }

  @Get(':id/deliveries')
  async deliveries(@Param('id') id: string) {
    return this.crud.prismaClient.webhookDelivery.findMany({
      where: { webhookId: id },
      orderBy: { deliveredAt: 'desc' },
    });
  }

  @Post(':id/test')
  @HttpCode(HttpStatus.ACCEPTED)
  async test(@Param('id') id: string) {
    const webhook = await this.crud.get('webhook', id);
    await this.webhooksService.dispatch(webhook.companyId, 'webhook.test', {
      webhookId: id,
    });
    return { queued: true };
  }
}
