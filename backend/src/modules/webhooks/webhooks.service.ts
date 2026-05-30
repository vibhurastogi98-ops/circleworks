import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createHmac, randomBytes } from 'crypto';
import { PrismaCrudService } from '@/common/crud/prisma-crud.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly crud: PrismaCrudService) {}

  generateSecret() {
    return `cwsec_${randomBytes(24).toString('base64url')}`;
  }

  async dispatch(
    companyId: string,
    eventType: string,
    payload: Record<string, any>,
  ) {
    const webhooks = await this.crud.prismaClient.webhook.findMany({
      where: {
        companyId,
        isActive: true,
        events: { has: eventType },
      },
    });

    await Promise.all(
      webhooks.map(async (webhook) => {
        const envelope = {
          id: `evt_${randomBytes(12).toString('hex')}`,
          event: eventType,
          apiVersion: 'v1',
          deliveredAt: new Date().toISOString(),
          payload,
        };
        const rawBody = JSON.stringify(envelope);
        const signature = createHmac('sha256', webhook.secret)
          .update(rawBody)
          .digest('hex');

        try {
          const response = await axios.post(webhook.url, rawBody, {
            headers: {
              'Content-Type': 'application/json',
              'X-CircleWorks-Signature': signature,
              'X-CircleWorks-Event': eventType,
              'X-CircleWorks-Api-Version': 'v1',
            },
            timeout: 5000,
          });

          await this.crud.prismaClient.webhookDelivery.create({
            data: {
              webhookId: webhook.id,
              eventType,
              payload: rawBody,
              status: response.status,
              response: JSON.stringify(response.data ?? {}),
            },
          });
        } catch (error: any) {
          this.logger.warn(
            `Webhook delivery failed for ${webhook.id}: ${error.message}`,
          );
          await this.crud.prismaClient.webhookDelivery.create({
            data: {
              webhookId: webhook.id,
              eventType,
              payload: rawBody,
              status: error.response?.status,
              response: error.response?.data
                ? JSON.stringify(error.response.data)
                : error.message,
            },
          });
        }
      }),
    );
  }
}
