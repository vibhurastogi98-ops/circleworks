import { Injectable } from '@nestjs/common';
import { DeviceInfo } from './session.service';

@Injectable()
export class SessionAlertService {
  async sendPasswordChangedRevocationEmail(user: { id: string; email: string }) {
    await this.queueEmail(user.email, 'Password changed — all other sessions signed out', {
      userId: user.id,
    });
  }

  async sendNewDeviceLoginAlertEmail(user: { id: string; email: string }, deviceInfo: DeviceInfo) {
    await this.queueEmail(user.email, `New sign-in from ${deviceInfo.type} in ${deviceInfo.location}`, {
      userId: user.id,
      device: `${deviceInfo.type} ${deviceInfo.browser} on ${deviceInfo.os}`,
      location: deviceInfo.location,
    });
  }

  private async queueEmail(to: string, subject: string, payload: Record<string, unknown>) {
    // TODO: connect to the email-delivery queue/provider. Kept async so callers can await
    // the contract without knowing which provider backs the notification.
    console.log('[SessionAlertEmail]', { to, subject, payload });
  }
}
